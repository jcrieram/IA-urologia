/**
 * Webhook de WhatsApp Cloud API desplegado como función serverless en Vercel.
 *
 *   GET  /api/whatsapp  -> verificación del webhook (la hace Meta una vez)
 *   POST /api/whatsapp  -> mensajes entrantes
 *
 * La configuración de horarios y mensaje está en whatsapp/config.js.
 */

const crypto = require('crypto')

const config = require('../whatsapp/config')
const { validarConfig } = require('../whatsapp/lib/horario')
const { procesarEvento } = require('../whatsapp/lib/procesar')
const { reservarAviso } = require('../whatsapp/lib/memoria')
const { enviarTexto, marcarLeido } = require('../whatsapp/lib/whatsapp-api')

async function leerCuerpo(req) {
  // Si el runtime ya consumió y parseó el stream, trabajamos con el objeto.
  if (!req.readable) {
    return { crudo: null, json: req.body || {} }
  }

  const trozos = []
  for await (const trozo of req) trozos.push(trozo)
  const crudo = Buffer.concat(trozos).toString('utf8')
  return { crudo, json: crudo ? JSON.parse(crudo) : {} }
}

function hmac(secreto, contenido) {
  return 'sha256=' + crypto.createHmac('sha256', secreto).update(contenido, 'utf8').digest('hex')
}

function comparar(a, b) {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)
}

/** json_encode de PHP escapa los caracteres no ASCII con secuencias \uXXXX. */
function escaparNoAscii(texto) {
  return texto.replace(/[^\x00-\x7F]/g, (caracter) =>
    '\\u' + caracter.charCodeAt(0).toString(16).padStart(4, '0')
  )
}

/**
 * Valida la cabecera X-Hub-Signature-256. Con el cuerpo crudo es exacto;
 * si el runtime ya lo parseó, reconstruimos el JSON y probamos las dos
 * variantes de escapado habituales.
 */
function firmaValida(req, crudo, json) {
  const secreto = process.env.WHATSAPP_APP_SECRET
  if (!secreto) return true // sin secreto configurado no se valida (ver README)

  const firma = req.headers['x-hub-signature-256']
  if (!firma) return false

  const candidatos = crudo !== null
    ? [crudo]
    : [JSON.stringify(json), escaparNoAscii(JSON.stringify(json))]

  return candidatos.some((contenido) => comparar(hmac(secreto, contenido), firma))
}

function verificar(req, res) {
  const params = new URL(req.url, 'http://localhost').searchParams
  const esperado = process.env.WHATSAPP_VERIFY_TOKEN

  const modo = params.get('hub.mode')
  const token = params.get('hub.verify_token')

  if (modo === 'subscribe' && esperado && token === esperado) {
    res.status(200).send(params.get('hub.challenge') || '')
    return
  }

  res.status(403).send('Token de verificación incorrecto')
}

async function handler(req, res) {
  if (req.method === 'GET') return verificar(req, res)

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).send('Método no permitido')
  }

  const errores = validarConfig(config)
  if (errores.length) {
    console.error('[whatsapp] config inválida:', errores.join('; '))
    return res.status(500).send('Configuración inválida')
  }

  let crudo
  let json
  try {
    ({ crudo, json } = await leerCuerpo(req))
  } catch (error) {
    console.error('[whatsapp] cuerpo ilegible:', error.message)
    return res.status(400).send('JSON inválido')
  }

  if (!firmaValida(req, crudo, json)) {
    console.error('[whatsapp] firma inválida, evento descartado')
    return res.status(401).send('Firma inválida')
  }

  try {
    const acciones = await procesarEvento(json, {
      config,
      enviarTexto,
      marcarLeido,
      reservarAviso,
    })
    if (acciones.length) console.log('[whatsapp]', JSON.stringify(acciones))
  } catch (error) {
    // Devolvemos 200 igualmente: un error nuestro no debe provocar que
    // Meta reintente el mismo evento en bucle.
    console.error('[whatsapp] error procesando el evento:', error)
  }

  return res.status(200).send('EVENT_RECEIVED')
}

module.exports = handler
// Pedimos el cuerpo sin parsear para poder validar la firma de Meta.
module.exports.config = { api: { bodyParser: false } }
