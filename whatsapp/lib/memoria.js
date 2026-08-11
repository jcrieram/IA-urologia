/**
 * Memoria de "a quién ya he avisado", para no responder cinco veces
 * seguidas a quien manda cinco audios.
 *
 * Usa Vercel KV / Upstash Redis si están configurados (KV_REST_API_URL +
 * KV_REST_API_TOKEN). Si no lo están, cae a memoria del proceso: funciona,
 * pero cada instancia serverless tiene la suya, así que algún contacto
 * puede recibir el aviso repetido. Para producción, configura KV.
 */

const enMemoria = new Map()

function limpiarCaducados(ahoraMs) {
  for (const [clave, caducaEn] of enMemoria) {
    if (caducaEn <= ahoraMs) enMemoria.delete(clave)
  }
}

function reservarEnMemoria(clave, segundos, ahoraMs) {
  limpiarCaducados(ahoraMs)
  if (enMemoria.has(clave)) return false
  enMemoria.set(clave, ahoraMs + segundos * 1000)
  return true
}

/**
 * Reserva atómica en Redis: SET clave 1 NX EX <segundos>.
 * Devuelve true solo si la clave no existía, es decir, si toca avisar.
 */
async function reservarEnKV(clave, segundos, { url, token }) {
  const destino = `${url.replace(/\/$/, '')}/set/${encodeURIComponent(clave)}/1?NX=true&EX=${segundos}`
  const respuesta = await fetch(destino, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!respuesta.ok) {
    throw new Error(`KV respondió ${respuesta.status}: ${await respuesta.text()}`)
  }

  const datos = await respuesta.json()
  return datos.result === 'OK'
}

/**
 * ¿Debo avisar a este contacto ahora mismo?
 * Devuelve true como mucho una vez cada `segundos` por contacto.
 */
async function reservarAviso(contacto, segundos, opciones = {}) {
  const ahoraMs = opciones.ahoraMs || Date.now()
  const clave = `wa:aviso:${contacto}`

  // Un cooldown de 0 desactiva la deduplicación: se avisa siempre.
  if (!segundos || segundos <= 0) return true

  const url = opciones.kvUrl || process.env.KV_REST_API_URL
  const token = opciones.kvToken || process.env.KV_REST_API_TOKEN

  if (url && token) {
    try {
      return await reservarEnKV(clave, segundos, { url, token })
    } catch (error) {
      // Si el KV falla preferimos avisar de más antes que dejar al
      // paciente sin respuesta, pero dejamos rastro en los logs.
      console.error('[whatsapp] KV no disponible, uso memoria local:', error.message)
    }
  }

  return reservarEnMemoria(clave, segundos, ahoraMs)
}

/** Solo para tests. */
function _reiniciarMemoria() {
  enMemoria.clear()
}

module.exports = { reservarAviso, _reiniciarMemoria }
