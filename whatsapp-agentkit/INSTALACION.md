# Instalación en este repositorio

Copia instalada de [Hainrixz/whatsapp-agentkit](https://github.com/Hainrixz/whatsapp-agentkit)
(commit `ddeb9dd`, "chore: eliminar Whapi como proveedor").

Vive como subcarpeta independiente de `IA-urologia`: no toca `index.html`, `ecoe/`,
`cistoscopia/` ni `vercel.json`, y no se despliega con el sitio.

## Cómo usarlo

El kit trae su propio `CLAUDE.md` y su comando `/build-agent` en `.claude/commands/`.
Claude Code los detecta solo si abres la sesión **desde esta carpeta**:

```bash
cd whatsapp-agentkit
bash start.sh     # verifica Python 3.11+ y Claude Code
claude            # y dentro escribe: /build-agent
```

## Qué falta antes de construir el agente

`/build-agent` te pedirá estos datos, así que tenlos a mano:

- **API key de Anthropic** — https://platform.anthropic.com/settings/api-keys
- **Proveedor de WhatsApp** — Twilio (sandbox gratis para probar) o Meta Cloud API
  y sus credenciales
- **Archivos del negocio** (opcional) — déjalos en `knowledge/`; están ignorados por git

El `.env` no existe todavía: lo genera `/build-agent`, o lo creas con
`cp .env.example .env`. Nunca se commitea (está en `.gitignore`).

## Qué queda fuera del control de versiones

El `.gitignore` del kit excluye lo que se genera durante el onboarding —
`agent/`, `config/`, `tests/`, `requirements.txt`, `Dockerfile`,
`docker-compose.yml` — además de `.env`, `*.db` y el contenido de `knowledge/`.
Si quieres versionar el agente ya construido, tendrás que ajustar ese archivo.
