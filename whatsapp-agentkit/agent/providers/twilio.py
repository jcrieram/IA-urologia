# agent/providers/twilio.py — Adaptador para Twilio WhatsApp
# Generado por AgentKit

import os
import hmac
import base64
import hashlib
import logging
import httpx
from fastapi import Request
from agent.providers.base import ProveedorWhatsApp, MensajeEntrante

logger = logging.getLogger("agentkit")


class ProveedorTwilio(ProveedorWhatsApp):
    """Proveedor de WhatsApp usando Twilio."""

    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.phone_number = os.getenv("TWILIO_PHONE_NUMBER")
        self.validar = os.getenv("TWILIO_VALIDAR_FIRMA", "true").lower() != "false"

    async def parsear_webhook(self, request: Request) -> list[MensajeEntrante]:
        """Parsea el payload form-encoded de Twilio."""
        form = await request.form()
        texto = form.get("Body", "")
        telefono = form.get("From", "").replace("whatsapp:", "")
        mensaje_id = form.get("MessageSid", "")
        if not texto:
            return []
        return [MensajeEntrante(
            telefono=telefono,
            texto=texto,
            mensaje_id=mensaje_id,
            es_propio=False,
        )]

    async def validar_firma(self, request: Request, cuerpo: dict) -> bool:
        """
        Valida la cabecera X-Twilio-Signature.

        Twilio firma cada webhook con HMAC-SHA1 sobre la URL completa más los
        parámetros del formulario ordenados alfabéticamente y concatenados.
        Sin esto, cualquiera que descubra tu URL puede escribirle al agente.
        """
        if not self.validar:
            return True
        if not self.auth_token:
            logger.warning("TWILIO_AUTH_TOKEN ausente: no se puede validar la firma")
            return False

        firma_recibida = request.headers.get("X-Twilio-Signature", "")
        if not firma_recibida:
            return False

        # Twilio firma la URL pública exacta que tiene configurada. Si la
        # damos por variable de entorno no hay que adivinarla a partir de
        # cabeceras de proxy, que con túneles como ngrok no siempre llegan
        # como uno espera.
        base_publica = os.getenv("PUBLIC_BASE_URL", "").rstrip("/")
        if base_publica:
            url = base_publica + request.url.path
        else:
            # Sin PUBLIC_BASE_URL, se reconstruye a partir de cabeceras.
            # Funciona en la mayoría de proxies, pero es menos fiable.
            url = str(request.url)
            proto = request.headers.get("X-Forwarded-Proto")
            if proto and url.startswith("http://"):
                url = proto + url[len("http"):]

        base = url + "".join(f"{k}{cuerpo[k]}" for k in sorted(cuerpo))
        esperada = base64.b64encode(
            hmac.new(self.auth_token.encode(), base.encode(), hashlib.sha1).digest()
        ).decode()

        if not hmac.compare_digest(esperada, firma_recibida):
            logger.warning("Firma de Twilio inválida — webhook rechazado")
            return False
        return True

    async def enviar_mensaje(self, telefono: str, mensaje: str) -> bool:
        """Envía mensaje via Twilio API."""
        if not all([self.account_sid, self.auth_token, self.phone_number]):
            logger.warning("Variables de Twilio no configuradas")
            return False
        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json"
        auth = base64.b64encode(f"{self.account_sid}:{self.auth_token}".encode()).decode()
        headers = {"Authorization": f"Basic {auth}"}
        data = {
            "From": f"whatsapp:{self.phone_number}",
            "To": f"whatsapp:{telefono}",
            "Body": mensaje,
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(url, data=data, headers=headers)
            if r.status_code != 201:
                logger.error(f"Error Twilio: {r.status_code} — {r.text}")
            return r.status_code == 201
