/**
 * Cliente mínimo de la WhatsApp Cloud API (Graph API de Meta).
 * Sin dependencias: usa el fetch nativo de Node 18+.
 */

const VERSION_GRAPH = process.env.WHATSAPP_GRAPH_VERSION || 'v21.0'

function credenciales() {
  const token = process.env.WHATSAPP_TOKEN
  const idNumero = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !idNumero) {
    throw new Error(
      'Faltan WHATSAPP_TOKEN y/o WHATSAPP_PHONE_NUMBER_ID en las variables de entorno'
    )
  }
  return { token, idNumero }
}

async function llamar(cuerpo) {
  const { token, idNumero } = credenciales()
  const respuesta = await fetch(
    `https://graph.facebook.com/${VERSION_GRAPH}/${idNumero}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cuerpo),
    }
  )

  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    const detalle = datos && datos.error ? datos.error.message : JSON.stringify(datos)
    throw new Error(`Graph API ${respuesta.status}: ${detalle}`)
  }
  return datos
}

/** Envía un texto plano al número indicado (formato internacional, sin '+'). */
function enviarTexto(destino, texto) {
  return llamar({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: destino,
    type: 'text',
    text: { preview_url: false, body: texto },
  })
}

/** Marca el audio recibido como leído (doble check azul). */
function marcarLeido(idMensaje) {
  return llamar({
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: idMensaje,
  })
}

module.exports = { enviarTexto, marcarLeido }
