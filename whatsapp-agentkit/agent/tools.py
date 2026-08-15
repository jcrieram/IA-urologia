# agent/tools.py — Herramientas del agente
# Generado por AgentKit

"""
Herramientas específicas del negocio.
Estas funciones extienden las capacidades del agente más allá de responder texto.
"""

import os
import re
import yaml
import logging
import unicodedata
from datetime import datetime
from functools import lru_cache

logger = logging.getLogger("agentkit")


@lru_cache(maxsize=1)
def cargar_info_negocio() -> dict:
    """Carga la información del negocio desde business.yaml."""
    try:
        with open("config/business.yaml", "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    except FileNotFoundError:
        logger.error("config/business.yaml no encontrado")
        return {}


def obtener_horario() -> dict:
    """Retorna el horario de atención y si estamos dentro de él ahora."""
    info = cargar_info_negocio()
    horario = info.get("negocio", {}).get("horario", "No disponible")
    ahora = datetime.now()
    # Lunes a viernes de 9:00 a 13:00
    abierto = ahora.weekday() < 5 and 9 <= ahora.hour < 13
    return {"horario": horario, "esta_abierto": abierto}


# ── Preguntas frecuentes ──────────────────────────────────────

def buscar_en_knowledge(consulta: str) -> str:
    """
    Busca información relevante en los archivos de /knowledge.
    Retorna el contenido más relevante encontrado.
    """
    resultados = []
    knowledge_dir = "knowledge"

    if not os.path.exists(knowledge_dir):
        return "No hay archivos de conocimiento disponibles."

    for archivo in os.listdir(knowledge_dir):
        ruta = os.path.join(knowledge_dir, archivo)
        if archivo.startswith(".") or not os.path.isfile(ruta):
            continue
        try:
            with open(ruta, "r", encoding="utf-8") as f:
                contenido = f.read()
                if consulta.lower() in contenido.lower():
                    resultados.append(f"[{archivo}]: {contenido[:500]}")
        except (UnicodeDecodeError, IOError):
            continue

    if resultados:
        return "\n---\n".join(resultados)
    return "No encontré información específica sobre eso en mis archivos."


# ── Agendamiento: derivar al centro correcto ──────────────────
# La reserva no la cierra el agente. Cada clínica tiene su propio canal y su
# ejecutiva, así que la herramienta enruta al centro adecuado en vez de
# prometer una hora que nadie ha confirmado.

def listar_centros() -> list[dict]:
    """Todos los centros donde atiende el doctor."""
    return cargar_info_negocio().get("centros", [])


def buscar_centros(texto: str) -> list[dict]:
    """
    Devuelve los centros que coinciden con una ciudad o nombre mencionados
    por el paciente. Si no hay coincidencia, devuelve todos.
    """
    texto = _normalizar(texto)
    if not texto:
        return listar_centros()

    coincidencias = [
        c for c in listar_centros()
        if _normalizar(c.get("ciudad", "")) in texto
        or _menciona_nombre(c.get("nombre", ""), texto)
    ]
    return coincidencias or listar_centros()


# Palabras que aparecen en varias clínicas y no distinguen ninguna.
_GENERICAS = {"centro", "medico", "clinica", "interclinica", "provincia", "de", "los", "del"}


def _menciona_nombre(nombre: str, texto: str) -> bool:
    """
    ¿El paciente nombró esta clínica? Nadie escribe el nombre completo, así
    que basta con que aparezca una palabra distintiva ("aquamed", "carrera").
    """
    palabras = {
        p for p in _normalizar(nombre).replace("(", " ").replace(")", " ").split()
        if len(p) > 3 and p not in _GENERICAS
    }
    return any(p in texto for p in palabras)


def _normalizar(texto: str) -> str:
    """
    Minúsculas y sin diacríticos, para que 'Quilpué' case con 'quilpue' y
    'Viña del Mar' con 'vina del mar' (la gente rara vez escribe tildes ni ñ).
    """
    descompuesto = unicodedata.normalize("NFD", texto.lower())
    return "".join(c for c in descompuesto if unicodedata.category(c) != "Mn")


# ── Leads y seguimiento ───────────────────────────────────────

def registrar_lead(telefono: str, nombre: str = "", interes: str = "") -> dict:
    """
    Guarda los datos de contacto de quien pide una hora, para que el equipo
    haga el seguimiento. Escribe en knowledge/leads.csv (ignorado por git).
    """
    ruta = os.path.join("knowledge", "leads.csv")
    os.makedirs("knowledge", exist_ok=True)
    nuevo = not os.path.exists(ruta)
    try:
        with open(ruta, "a", encoding="utf-8") as f:
            if nuevo:
                f.write("fecha,telefono,nombre,interes\n")
            fecha = datetime.now().isoformat(timespec="seconds")
            f.write(f"{fecha},{telefono},{_csv(nombre)},{_csv(interes)}\n")
        return {"registrado": True}
    except IOError as e:
        logger.error(f"No se pudo registrar el lead: {e}")
        return {"registrado": False}


def _csv(valor: str) -> str:
    """Limpia comas y saltos de línea para no romper el CSV."""
    return re.sub(r"[,\r\n]+", " ", valor or "").strip()


def escalar_a_equipo(telefono: str, motivo: str) -> dict:
    """
    Marca una conversación para que la revise una persona.
    Úsalo ante urgencias, reclamos o cualquier consulta clínica.
    """
    logger.warning(f"ESCALAR — {telefono}: {motivo}")
    return {"escalado": True, "motivo": motivo}
