# agent/brain.py — Cerebro del agente: conexión con Claude API
# Generado por AgentKit

"""
Lógica de IA del agente. Lee el system prompt de prompts.yaml
y genera respuestas usando la API de Anthropic Claude.
"""

import os
import yaml
import logging
from functools import lru_cache
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("agentkit")

# claude-sonnet-4-6 sigue activo, pero su equivalente actual es claude-sonnet-5:
# misma familia, mejor calidad en seguimiento de instrucciones. Para más
# capacidad (a mayor coste) cambia a "claude-opus-5".
MODELO = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5")

# Un mensaje de WhatsApp es corto: sin pensamiento extendido y con esfuerzo bajo
# el agente responde rápido y barato, que es lo que importa en un chat.
ESFUERZO = os.getenv("ANTHROPIC_EFFORT", "low")
MAX_TOKENS = int(os.getenv("ANTHROPIC_MAX_TOKENS", "1024"))

client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


@lru_cache(maxsize=1)
def cargar_config_prompts() -> dict:
    """
    Lee toda la configuración desde config/prompts.yaml.

    Cacheado: el archivo no cambia en caliente y se consultaba en cada mensaje.
    Si editas prompts.yaml, reinicia el servidor para recargarlo.
    """
    try:
        with open("config/prompts.yaml", "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    except FileNotFoundError:
        logger.error("config/prompts.yaml no encontrado")
        return {}


def cargar_system_prompt() -> str:
    """Lee el system prompt desde config/prompts.yaml."""
    config = cargar_config_prompts()
    return config.get("system_prompt", "Eres un asistente útil. Responde en español.")


def obtener_mensaje_error() -> str:
    """Retorna el mensaje de error configurado en prompts.yaml."""
    config = cargar_config_prompts()
    return config.get(
        "error_message",
        "Lo siento, estoy teniendo problemas técnicos. Por favor intenta de nuevo en unos minutos.",
    )


def obtener_mensaje_fallback() -> str:
    """Retorna el mensaje de fallback configurado en prompts.yaml."""
    config = cargar_config_prompts()
    return config.get("fallback_message", "Disculpa, no entendí tu mensaje. ¿Podrías reformularlo?")


async def generar_respuesta(mensaje: str, historial: list[dict]) -> str:
    """
    Genera una respuesta usando Claude API.

    Args:
        mensaje: El mensaje nuevo del usuario
        historial: Lista de mensajes anteriores [{"role": "user/assistant", "content": "..."}]

    Returns:
        La respuesta generada por Claude
    """
    if not mensaje or len(mensaje.strip()) < 2:
        return obtener_mensaje_fallback()

    system_prompt = cargar_system_prompt()

    mensajes = [{"role": m["role"], "content": m["content"]} for m in historial]
    mensajes.append({"role": "user", "content": mensaje})

    try:
        response = await client.messages.create(
            model=MODELO,
            max_tokens=MAX_TOKENS,
            # El system prompt es idéntico en todas las conversaciones, así que se
            # cachea: a partir del segundo mensaje se cobra ~10% por esa parte.
            system=[{
                "type": "text",
                "text": system_prompt,
                "cache_control": {"type": "ephemeral"},
            }],
            thinking={"type": "disabled"},
            output_config={"effort": ESFUERZO},
            messages=mensajes,
        )

        if response.stop_reason == "refusal":
            logger.warning("Claude declinó responder este mensaje")
            return obtener_mensaje_error()

        respuesta = next((b.text for b in response.content if b.type == "text"), "")
        if not respuesta:
            return obtener_mensaje_error()

        logger.info(
            f"Respuesta generada ({response.usage.input_tokens} in / "
            f"{response.usage.output_tokens} out / "
            f"{response.usage.cache_read_input_tokens} cache)"
        )
        return respuesta

    except Exception as e:
        logger.error(f"Error Claude API: {e}")
        return obtener_mensaje_error()
