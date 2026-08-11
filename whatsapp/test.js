/**
 * Pruebas de la lógica de respuesta automática.
 * Sin dependencias:  node whatsapp/test.js
 */

const assert = require('assert')

const config = require('./config')
const { enHorarioDeConsulta, dentroDeFranja, validarConfig } = require('./lib/horario')
const { procesarEvento, esAudio, demasiadoViejo } = require('./lib/procesar')
const { reservarAviso, _reiniciarMemoria } = require('./lib/memoria')

let pasadas = 0
const fallos = []

async function prueba(nombre, fn) {
  try {
    await fn()
    pasadas++
  } catch (error) {
    fallos.push(`${nombre}\n    ${error.message}`)
  }
}

/** Construye un instante a partir de hora local de Madrid. */
function madrid(iso) {
  return new Date(iso)
}

/** Evento de webhook con un mensaje de audio. */
function eventoAudio({ de = '34600111222', voz = true, timestamp } = {}) {
  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '123',
        changes: [
          {
            field: 'messages',
            value: {
              messaging_product: 'whatsapp',
              metadata: { phone_number_id: '999' },
              contacts: [{ profile: { name: 'José Muñoz' }, wa_id: de }],
              messages: [
                {
                  from: de,
                  id: 'wamid.' + de + (timestamp || ''),
                  timestamp: String(timestamp || Math.floor(Date.now() / 1000)),
                  type: 'audio',
                  audio: { id: 'a1', mime_type: 'audio/ogg; codecs=opus', voice: voz },
                },
              ],
            },
          },
        ],
      },
    ],
  }
}

function eventoTexto(de = '34600111222') {
  const evento = eventoAudio({ de })
  const mensaje = evento.entry[0].changes[0].value.messages[0]
  delete mensaje.audio
  mensaje.type = 'text'
  mensaje.text = { body: 'Buenos días doctor' }
  return evento
}

async function main() {
  // ---------- Franjas ----------
  await prueba('dentroDeFranja incluye el inicio y excluye el final', () => {
    assert.strictEqual(dentroDeFranja(9 * 60, '09:00-13:30'), true)
    assert.strictEqual(dentroDeFranja(13 * 60 + 29, '09:00-13:30'), true)
    assert.strictEqual(dentroDeFranja(13 * 60 + 30, '09:00-13:30'), false)
    assert.strictEqual(dentroDeFranja(8 * 60 + 59, '09:00-13:30'), false)
  })

  await prueba('dentroDeFranja soporta franjas que cruzan medianoche', () => {
    assert.strictEqual(dentroDeFranja(23 * 60, '22:00-02:00'), true)
    assert.strictEqual(dentroDeFranja(60, '22:00-02:00'), true)
    assert.strictEqual(dentroDeFranja(12 * 60, '22:00-02:00'), false)
  })

  // ---------- Horario configurado (L-V 9:00-13:30 y 15:00-17:30) ----------
  await prueba('martes a las 10:00 de Madrid está en consulta', () => {
    // 2026-08-11 es martes. En agosto Madrid va en UTC+2.
    assert.strictEqual(enHorarioDeConsulta(madrid('2026-08-11T08:00:00Z'), config), true)
  })

  await prueba('la pausa de comida queda fuera', () => {
    // 14:15 en Madrid
    assert.strictEqual(enHorarioDeConsulta(madrid('2026-08-11T12:15:00Z'), config), false)
  })

  await prueba('la tarde vuelve a estar dentro', () => {
    // 15:30 en Madrid
    assert.strictEqual(enHorarioDeConsulta(madrid('2026-08-11T13:30:00Z'), config), true)
  })

  await prueba('después de las 17:30 ya no se contesta', () => {
    // 17:31 en Madrid
    assert.strictEqual(enHorarioDeConsulta(madrid('2026-08-11T15:31:00Z'), config), false)
  })

  await prueba('el sábado no se contesta', () => {
    // 2026-08-15 es sábado, 10:00 en Madrid
    assert.strictEqual(enHorarioDeConsulta(madrid('2026-08-15T08:00:00Z'), config), false)
  })

  await prueba('el horario de invierno se respeta (UTC+1)', () => {
    // 2026-01-13 martes, 09:30 en Madrid = 08:30 UTC
    assert.strictEqual(enHorarioDeConsulta(madrid('2026-01-13T08:30:00Z'), config), true)
    // 08:30 en Madrid = 07:30 UTC -> todavía fuera
    assert.strictEqual(enHorarioDeConsulta(madrid('2026-01-13T07:30:00Z'), config), false)
  })

  await prueba('una excepción de festivo anula el día', () => {
    const conFestivo = { ...config, excepciones: { '2026-08-11': [] } }
    assert.strictEqual(enHorarioDeConsulta(madrid('2026-08-11T08:00:00Z'), conFestivo), false)
  })

  await prueba('una excepción puede activar un sábado', () => {
    const conGuardia = { ...config, excepciones: { '2026-08-15': ['08:00-22:00'] } }
    assert.strictEqual(enHorarioDeConsulta(madrid('2026-08-15T08:00:00Z'), conGuardia), true)
  })

  await prueba('la config del repositorio es válida', () => {
    assert.deepStrictEqual(validarConfig(config), [])
  })

  await prueba('validarConfig detecta franjas mal escritas', () => {
    const rota = { ...config, franjas: { ...config.franjas, lun: ['9-13'] } }
    assert.ok(validarConfig(rota).length > 0)
  })

  // ---------- Detección de audio ----------
  await prueba('reconoce nota de voz y fichero de audio', () => {
    const nota = { type: 'audio', audio: { voice: true } }
    const fichero = { type: 'audio', audio: { voice: false } }

    assert.strictEqual(esAudio(nota, { soloNotasDeVoz: false }), true)
    assert.strictEqual(esAudio(fichero, { soloNotasDeVoz: false }), true)
    assert.strictEqual(esAudio(fichero, { soloNotasDeVoz: true }), false)
    assert.strictEqual(esAudio({ type: 'text' }, { soloNotasDeVoz: false }), false)
  })

  await prueba('descarta reintentos antiguos de Meta', () => {
    const ahora = new Date('2026-08-11T08:00:00Z')
    const viejo = { timestamp: String(Math.floor(ahora.getTime() / 1000) - 3600) }
    const reciente = { timestamp: String(Math.floor(ahora.getTime() / 1000) - 30) }

    assert.strictEqual(demasiadoViejo(viejo, config, ahora), true)
    assert.strictEqual(demasiadoViejo(reciente, config, ahora), false)
  })

  // ---------- Flujo completo ----------
  function espia() {
    const enviados = []
    const leidos = []
    return {
      enviados,
      leidos,
      enviarTexto: async (a, texto) => enviados.push({ a, texto }),
      marcarLeido: async (id) => leidos.push(id),
    }
  }

  await prueba('responde a un audio en horario de consulta', async () => {
    _reiniciarMemoria()
    const s = espia()
    const acciones = await procesarEvento(eventoAudio(), {
      config,
      ahora: madrid('2026-08-11T08:00:00Z'),
      enviarTexto: s.enviarTexto,
      marcarLeido: s.marcarLeido,
      reservarAviso,
    })

    assert.strictEqual(acciones[0].accion, 'respondido')
    assert.strictEqual(s.enviados.length, 1)
    assert.strictEqual(s.enviados[0].texto, config.mensaje)
    assert.strictEqual(s.leidos.length, 1)
  })

  await prueba('no responde a mensajes de texto', async () => {
    _reiniciarMemoria()
    const s = espia()
    const acciones = await procesarEvento(eventoTexto(), {
      config,
      ahora: madrid('2026-08-11T08:00:00Z'),
      enviarTexto: s.enviarTexto,
      marcarLeido: s.marcarLeido,
      reservarAviso,
    })

    assert.strictEqual(acciones[0].accion, 'ignorado')
    assert.strictEqual(s.enviados.length, 0)
  })

  await prueba('no responde a un audio fuera de horario', async () => {
    _reiniciarMemoria()
    const s = espia()
    await procesarEvento(eventoAudio(), {
      config,
      ahora: madrid('2026-08-11T20:00:00Z'), // 22:00 en Madrid
      enviarTexto: s.enviarTexto,
      marcarLeido: s.marcarLeido,
      reservarAviso,
    })

    assert.strictEqual(s.enviados.length, 0)
  })

  await prueba('cinco audios seguidos generan una sola respuesta', async () => {
    _reiniciarMemoria()
    const s = espia()
    const ahora = madrid('2026-08-11T08:00:00Z')

    for (let i = 0; i < 5; i++) {
      await procesarEvento(eventoAudio({ timestamp: Math.floor(ahora.getTime() / 1000) }), {
        config,
        ahora,
        enviarTexto: s.enviarTexto,
        marcarLeido: s.marcarLeido,
        reservarAviso,
      })
    }

    assert.strictEqual(s.enviados.length, 1)
  })

  await prueba('el silencio es por contacto, no global', async () => {
    _reiniciarMemoria()
    const s = espia()
    const ahora = madrid('2026-08-11T08:00:00Z')
    const marca = Math.floor(ahora.getTime() / 1000)

    for (const de of ['34600111222', '34600333444']) {
      await procesarEvento(eventoAudio({ de, timestamp: marca }), {
        config,
        ahora,
        enviarTexto: s.enviarTexto,
        marcarLeido: s.marcarLeido,
        reservarAviso,
      })
    }

    assert.strictEqual(s.enviados.length, 2)
  })

  await prueba('pasadas las horas de silencio se vuelve a avisar', async () => {
    _reiniciarMemoria()
    const s = espia()
    const primera = madrid('2026-08-11T08:00:00Z')
    const segunda = new Date(primera.getTime() + (config.horasEntreAvisos + 1) * 3600 * 1000)

    const enviar = async (ahora) =>
      procesarEvento(eventoAudio({ timestamp: Math.floor(ahora.getTime() / 1000) }), {
        config,
        ahora,
        enviarTexto: s.enviarTexto,
        marcarLeido: s.marcarLeido,
        reservarAviso,
      })

    await enviar(primera)
    // 6h después de las 10:00 son las 16:00 de Madrid: sigue siendo horario de tarde.
    await enviar(segunda)

    assert.strictEqual(s.enviados.length, 2)
  })

  await prueba('un fallo al enviar no rompe el webhook', async () => {
    _reiniciarMemoria()
    const acciones = await procesarEvento(eventoAudio(), {
      config,
      ahora: madrid('2026-08-11T08:00:00Z'),
      enviarTexto: async () => {
        throw new Error('Graph API 401')
      },
      marcarLeido: async () => {},
      reservarAviso,
    })

    assert.strictEqual(acciones[0].accion, 'error')
  })

  // ---------- Resultado ----------
  console.log(`\n${pasadas} pruebas pasadas`)
  if (fallos.length) {
    console.error(`${fallos.length} fallos:\n  - ${fallos.join('\n  - ')}\n`)
    process.exit(1)
  }
}

main()
