/**
 * Lógica de decisión, aislada de WhatsApp para poder probarla:
 * ¿es un audio? ¿estoy en consulta? ¿ya avisé a este contacto hace poco?
 */

import { enHorarioDeConsulta } from './horario.js'

/**
 * WhatsApp envuelve algunos mensajes (temporales, "ver una vez").
 * Nos quedamos con el contenido real.
 */
export function contenido(mensaje) {
  let actual = mensaje?.message
  const envoltorios = [
    'ephemeralMessage',
    'viewOnceMessage',
    'viewOnceMessageV2',
    'viewOnceMessageV2Extension',
    'documentWithCaptionMessage',
  ]

  // Varios envoltorios pueden estar anidados; el límite evita un bucle
  // infinito si algún día llega una estructura rara.
  for (let vuelta = 0; actual && vuelta < 5; vuelta++) {
    const envoltorio = envoltorios.find((clave) => actual[clave]?.message)
    if (!envoltorio) break
    actual = actual[envoltorio].message
  }

  return actual || null
}

/** El timestamp de Baileys puede venir como número o como Long de protobuf. */
function marcaEnMs(mensaje) {
  const bruto = mensaje?.messageTimestamp
  const segundos = Number(typeof bruto?.toNumber === 'function' ? bruto.toNumber() : bruto)
  return Number.isFinite(segundos) ? segundos * 1000 : null
}

/** '34600111222@s.whatsapp.net' -> '34600111222' */
export function numeroDeJid(jid) {
  return String(jid || '').split('@')[0].split(':')[0]
}

/**
 * Traduce un mensaje de Baileys a algo con lo que podamos razonar.
 * Devuelve null si no es un mensaje de usuario aprovechable.
 */
export function normalizar(mensaje) {
  const jid = mensaje?.key?.remoteJid
  if (!jid) return null

  const cuerpo = contenido(mensaje)
  const audio = cuerpo?.audioMessage || null

  return {
    jid,
    clave: mensaje.key,
    numero: numeroDeJid(mensaje.key.participant || jid),
    deMi: Boolean(mensaje.key.fromMe),
    esGrupo: jid.endsWith('@g.us'),
    esEstado: jid === 'status@broadcast' || jid.endsWith('@broadcast'),
    esCanal: jid.endsWith('@newsletter'),
    esAudio: Boolean(audio),
    esNotaDeVoz: Boolean(audio?.ptt),
    marcaMs: marcaEnMs(mensaje),
  }
}

/**
 * Decide qué hacer con un mensaje ya normalizado.
 * No envía nada: solo devuelve { accion, motivo }.
 */
export function decidir(mensaje, config, ahora) {
  if (!mensaje) return { accion: 'ignorado', motivo: 'mensaje ilegible' }
  if (mensaje.deMi) return { accion: 'ignorado', motivo: 'mensaje propio' }
  if (mensaje.esEstado) return { accion: 'ignorado', motivo: 'estado' }
  if (mensaje.esCanal) return { accion: 'ignorado', motivo: 'canal' }

  if (mensaje.esGrupo && !config.responderEnGrupos) {
    return { accion: 'ignorado', motivo: 'grupo' }
  }

  if (!mensaje.esAudio) return { accion: 'ignorado', motivo: 'no es audio' }
  if (config.soloNotasDeVoz && !mensaje.esNotaDeVoz) {
    return { accion: 'ignorado', motivo: 'audio adjunto, no nota de voz' }
  }

  const excluidos = config.contactosExcluidos || []
  if (excluidos.map(String).includes(mensaje.numero)) {
    return { accion: 'ignorado', motivo: 'contacto excluido' }
  }

  const limiteMin = Number(config.ignorarMensajesMasViejosQueMin)
  if (limiteMin > 0 && mensaje.marcaMs) {
    const edadMin = (ahora.getTime() - mensaje.marcaMs) / 60000
    if (edadMin > limiteMin) {
      return { accion: 'ignorado', motivo: `audio de hace ${Math.round(edadMin)} min` }
    }
  }

  if (!enHorarioDeConsulta(ahora, config)) {
    return { accion: 'ignorado', motivo: 'fuera del horario de consulta' }
  }

  return { accion: 'responder' }
}

/**
 * Procesa un mensaje entrante de principio a fin.
 *
 * @param {object} bruto   Mensaje tal cual llega de Baileys
 * @param {object} deps    { config, ahora, memoria, enviarTexto, marcarLeido }
 * @returns {Promise<object>} { numero, accion, motivo }
 */
export async function procesarMensaje(bruto, deps) {
  const { config, memoria, enviarTexto, marcarLeido } = deps
  const ahora = deps.ahora || new Date()

  const mensaje = normalizar(bruto)
  const decision = decidir(mensaje, config, ahora)
  const numero = mensaje?.numero

  if (decision.accion !== 'responder') {
    return { numero, ...decision }
  }

  const segundos = Math.round(Number(config.horasEntreAvisos) * 3600)
  const tocaAvisar = await memoria.reservarAviso(mensaje.numero, segundos, {
    ahoraMs: ahora.getTime(),
  })
  if (!tocaAvisar) {
    return { numero, accion: 'ignorado', motivo: 'ya avisado recientemente' }
  }

  try {
    if (config.marcarComoLeido && marcarLeido) {
      await marcarLeido(mensaje.clave)
    }
    await enviarTexto(mensaje.jid, config.mensaje)
    return { numero, accion: 'respondido' }
  } catch (error) {
    console.error(`[bot] no se pudo responder a ${numero}:`, error.message)
    return { numero, accion: 'error', motivo: error.message }
  }
}
