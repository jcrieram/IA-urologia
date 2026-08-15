# agent/main.py — Servidor FastAPI + Webhook de WhatsApp
# Generado por AgentKit

"""
Servidor principal del agente de WhatsApp.
Funciona con cualquier proveedor (Meta, Twilio) gracias a la capa de providers.
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.responses import PlainTextResponse
from dotenv import load_dotenv

from agent.brain import generar_respuesta
from agent.memory import (
    inicializar_db,
    guardar_mensaje,
    obtener_historial,
    marcar_procesado,
)
from agent.providers import obtener_proveedor

load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
log_level = logging.DEBUG if ENVIRONMENT == "development" else logging.INFO
logging.basicConfig(level=log_level)
logger = logging.getLogger("agentkit")

proveedor = obtener_proveedor()
PORT = int(os.getenv("PORT", 8000))


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Inicializa la base de datos al arrancar el servidor."""
    await inicializar_db()
    logger.info("Base de datos inicializada")
    logger.info(f"Servidor AgentKit corriendo en puerto {PORT}")
    logger.info(f"Proveedor de WhatsApp: {proveedor.__class__.__name__}")
    yield


app = FastAPI(
    title="AgentKit — WhatsApp AI Agent",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/")
async def health_check():
    """Endpoint de salud para Railway/monitoreo."""
    return {"status": "ok", "service": "agentkit"}


@app.get("/webhook")
async def webhook_verificacion(request: Request):
    """Verificación GET del webhook (requerido por Meta Cloud API, no-op para otros)."""
    resultado = await proveedor.validar_webhook(request)
    if resultado is not None:
        return PlainTextResponse(str(resultado))
    return {"status": "ok"}


async def _atender(telefono: str, texto: str):
    """
    Genera y envía la respuesta. Se ejecuta en segundo plano para que el
    webhook conteste de inmediato: Claude puede tardar varios segundos y
    Twilio reintentaría el envío si la respuesta HTTP se demora.
    """
    try:
        # El historial se lee ANTES de guardar el mensaje actual
        # (brain.py lo agrega, así evitamos duplicarlo)
        historial = await obtener_historial(telefono)
        respuesta = await generar_respuesta(texto, historial)

        await guardar_mensaje(telefono, "user", texto)
        await guardar_mensaje(telefono, "assistant", respuesta)

        await proveedor.enviar_mensaje(telefono, respuesta)
        logger.info(f"Respuesta a {telefono}: {respuesta}")
    except Exception as e:
        logger.error(f"Error atendiendo a {telefono}: {e}")


@app.post("/webhook")
async def webhook_handler(request: Request, background: BackgroundTasks):
    """
    Recibe mensajes de WhatsApp via el proveedor configurado.
    Valida la firma, encola el procesamiento y responde 200 al momento.
    """
    try:
        form = dict(await request.form())
        if not await proveedor.validar_firma(request, form):
            # 200 a propósito: un 4xx haría que Twilio reintentara sin parar.
            return {"status": "ignorado"}

        mensajes = await proveedor.parsear_webhook(request)

        for msg in mensajes:
            if msg.es_propio or not msg.texto:
                continue

            if not await marcar_procesado(msg.mensaje_id):
                logger.info(f"Mensaje repetido {msg.mensaje_id} — ignorado")
                continue

            logger.info(f"Mensaje de {msg.telefono}: {msg.texto}")
            background.add_task(_atender, msg.telefono, msg.texto)

        return {"status": "ok"}

    except Exception as e:
        # Nunca devolvemos 500: Twilio reintentaría y el paciente recibiría
        # respuestas duplicadas. El error queda en los logs.
        logger.error(f"Error en webhook: {e}")
        return {"status": "error"}
