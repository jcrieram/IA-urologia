/**
 * Lógica del webhook, aislada del transporte HTTP para poder probarla.
 *
 * Recibe el cuerpo que manda Meta y decide, para cada mensaje:
 *   ¿es un audio? ¿estoy en consulta? ¿ya avisé a este contacto hace poco?
 */

const { enHorarioDeConsulta } = require('./horario')

/** Extrae los mensajes de la estructura anidada del webhook. */
function extraerMensajes(cuerpo) {
  const mensajes = []
  for (const entrada of (cuerpo && cuerpo.entry) || []) {
    for (const cambio of entrada.changes || []) {
      const valor = cambio.value || {}
      for (const mensaje of valor.messages || []) {
        mensajes.push(mensaje)
      }
    }
  }
  return mensajes
}

function esAudio(mensaje, config) {
  if (mensaje.type !== 'audio') return false
  if (config.soloNotasDeVoz) return Boolean(mensaje.audio && mensaje.audio.voice)
  return true
}

/** Meta reenvía webhooks fallidos; no contestamos a audios rancios. */
function demasiadoViejo(mensaje, config, ahora) {
  const limiteMin = Number(config.ignorarMensajesMasViejosQueMin)
  if (!limiteMin || limiteMin <= 0) return false

  const marca = Number(mensaje.timestamp)
  if (!Number.isFinite(marca)) return false

  const edadMin = (ahora.getTime() - marca * 1000) / 60000
  return edadMin > limiteMin
}

/**
 * Procesa un evento del webhook.
 *
 * @param {object} cuerpo  JSON recibido de Meta
 * @param {object} deps    { config, ahora, enviarTexto, marcarLeido, reservarAviso }
 * @returns {Promise<Array>} una entrada por mensaje, con el motivo de la decisión
 */
async function procesarEvento(cuerpo, deps) {
  const { config, enviarTexto, marcarLeido, reservarAviso } = deps
  const ahora = deps.ahora || new Date()
  const acciones = []

  for (const mensaje of extraerMensajes(cuerpo)) {
    const de = mensaje.from

    if (!esAudio(mensaje, config)) {
      acciones.push({ de, accion: 'ignorado', motivo: `no es audio (${mensaje.type})` })
      continue
    }

    if (demasiadoViejo(mensaje, config, ahora)) {
      acciones.push({ de, accion: 'ignorado', motivo: 'audio antiguo (reintento de Meta)' })
      continue
    }

    if (!enHorarioDeConsulta(ahora, config)) {
      acciones.push({ de, accion: 'ignorado', motivo: 'fuera del horario de consulta' })
      continue
    }

    const segundos = Math.round(Number(config.horasEntreAvisos) * 3600)
    const tocaAvisar = await reservarAviso(de, segundos, { ahoraMs: ahora.getTime() })
    if (!tocaAvisar) {
      acciones.push({ de, accion: 'ignorado', motivo: 'ya avisado recientemente' })
      continue
    }

    try {
      if (config.marcarComoLeido && marcarLeido) {
        await marcarLeido(mensaje.id)
      }
      await enviarTexto(de, config.mensaje)
      acciones.push({ de, accion: 'respondido' })
    } catch (error) {
      console.error(`[whatsapp] no se pudo responder a ${de}:`, error.message)
      acciones.push({ de, accion: 'error', motivo: error.message })
    }
  }

  return acciones
}

module.exports = { procesarEvento, extraerMensajes, esAudio, demasiadoViejo }
