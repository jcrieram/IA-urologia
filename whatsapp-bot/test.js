/**
 * Pruebas de la lógica de respuesta automática.
 *   node test.js
 */

import assert from 'assert'
import fs from 'fs'
import os from 'os'
import path from 'path'

import config from './config.js'
import { enHorarioDeConsulta, dentroDeFranja, validarConfig } from './lib/horario.js'
import { normalizar, decidir, contenido, procesarMensaje } from './lib/procesar.js'
import { crearMemoria, crearMemoriaVolatil } from './lib/memoria.js'

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

const NUMERO = '34600111222'

/** Mensaje tal y como lo entrega Baileys. */
function mensajeAudio({ de = NUMERO, ptt = true, ahora = MARTES_10H, grupo = false } = {}) {
  const jid = grupo ? '120363000000000000@g.us' : `${de}@s.whatsapp.net`
  return {
    key: {
      remoteJid: jid,
      fromMe: false,
      id: 'ABCD1234',
      ...(grupo ? { participant: `${de}@s.whatsapp.net` } : {}),
    },
    messageTimestamp: Math.floor(ahora.getTime() / 1000),
    pushName: 'José Muñoz',
    message: {
      audioMessage: { ptt, mimetype: 'audio/ogg; codecs=opus', seconds: 12 },
    },
  }
}

function mensajeTexto(de = NUMERO) {
  const m = mensajeAudio({ de })
  m.message = { conversation: 'Buenos días doctor' }
  return m
}

/** Instante en UTC; agosto en Madrid es UTC+2, enero UTC+1. */
const cuando = (iso) => new Date(iso)

const MARTES_10H = cuando('2026-08-11T08:00:00Z')

function espia() {
  const enviados = []
  const leidos = []
  return {
    enviados,
    leidos,
    enviarTexto: async (jid, texto) => enviados.push({ jid, texto }),
    marcarLeido: async (clave) => leidos.push(clave),
  }
}

async function correr(mensaje, { ahora = MARTES_10H, memoria, cfg = config, ...resto } = {}) {
  const s = resto.espia || espia()
  const resultado = await procesarMensaje(mensaje, {
    config: cfg,
    ahora,
    memoria: memoria || crearMemoriaVolatil(),
    enviarTexto: s.enviarTexto,
    marcarLeido: s.marcarLeido,
  })
  return { resultado, espia: s }
}

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
  assert.strictEqual(enHorarioDeConsulta(MARTES_10H, config), true)
})

await prueba('la pausa de comida queda fuera', () => {
  // 14:15 en Madrid
  assert.strictEqual(enHorarioDeConsulta(cuando('2026-08-11T12:15:00Z'), config), false)
})

await prueba('la tarde vuelve a estar dentro', () => {
  // 15:30 en Madrid
  assert.strictEqual(enHorarioDeConsulta(cuando('2026-08-11T13:30:00Z'), config), true)
})

await prueba('después de las 17:30 ya no se contesta', () => {
  // 17:31 en Madrid
  assert.strictEqual(enHorarioDeConsulta(cuando('2026-08-11T15:31:00Z'), config), false)
})

await prueba('el sábado no se contesta', () => {
  // 2026-08-15 es sábado, 10:00 en Madrid
  assert.strictEqual(enHorarioDeConsulta(cuando('2026-08-15T08:00:00Z'), config), false)
})

await prueba('el horario de invierno se respeta (UTC+1)', () => {
  // 2026-01-13 es martes: 09:30 en Madrid = 08:30 UTC
  assert.strictEqual(enHorarioDeConsulta(cuando('2026-01-13T08:30:00Z'), config), true)
  // 08:30 en Madrid = 07:30 UTC -> todavía fuera
  assert.strictEqual(enHorarioDeConsulta(cuando('2026-01-13T07:30:00Z'), config), false)
})

await prueba('una excepción de festivo anula el día', () => {
  const conFestivo = { ...config, excepciones: { '2026-08-11': [] } }
  assert.strictEqual(enHorarioDeConsulta(MARTES_10H, conFestivo), false)
})

await prueba('una excepción puede activar un sábado', () => {
  const conGuardia = { ...config, excepciones: { '2026-08-15': ['08:00-22:00'] } }
  assert.strictEqual(enHorarioDeConsulta(cuando('2026-08-15T08:00:00Z'), conGuardia), true)
})

await prueba('la config del repositorio es válida', () => {
  assert.deepStrictEqual(validarConfig(config), [])
})

await prueba('validarConfig detecta franjas mal escritas', () => {
  const rota = { ...config, franjas: { ...config.franjas, lun: ['9-13'] } }
  assert.ok(validarConfig(rota).length > 0)
})

// ---------- Lectura de mensajes de WhatsApp ----------

await prueba('reconoce una nota de voz', () => {
  const m = normalizar(mensajeAudio({ ptt: true }))
  assert.strictEqual(m.esAudio, true)
  assert.strictEqual(m.esNotaDeVoz, true)
  assert.strictEqual(m.numero, NUMERO)
  assert.strictEqual(m.esGrupo, false)
})

await prueba('distingue el audio adjunto de la nota de voz', () => {
  const m = normalizar(mensajeAudio({ ptt: false }))
  assert.strictEqual(m.esAudio, true)
  assert.strictEqual(m.esNotaDeVoz, false)
})

await prueba('un texto no es audio', () => {
  assert.strictEqual(normalizar(mensajeTexto()).esAudio, false)
})

await prueba('desenvuelve mensajes temporales y de ver una vez', () => {
  const interior = { audioMessage: { ptt: true } }
  const temporal = { message: { ephemeralMessage: { message: interior } } }
  const verUnaVez = {
    message: { viewOnceMessageV2: { message: { audioMessage: { ptt: true } } } },
  }
  const anidado = {
    message: { ephemeralMessage: { message: { viewOnceMessage: { message: interior } } } },
  }

  assert.ok(contenido(temporal).audioMessage)
  assert.ok(contenido(verUnaVez).audioMessage)
  assert.ok(contenido(anidado).audioMessage)
})

await prueba('saca el número real del remitente en un grupo', () => {
  const m = normalizar(mensajeAudio({ grupo: true }))
  assert.strictEqual(m.esGrupo, true)
  assert.strictEqual(m.numero, NUMERO)
})

await prueba('acepta el timestamp como Long de protobuf', () => {
  const m = mensajeAudio()
  const segundos = m.messageTimestamp
  m.messageTimestamp = { toNumber: () => segundos }
  assert.strictEqual(normalizar(m).marcaMs, segundos * 1000)
})

// ---------- Decisiones ----------

await prueba('responde a un audio en horario de consulta', async () => {
  const { resultado, espia: s } = await correr(mensajeAudio())
  assert.strictEqual(resultado.accion, 'respondido')
  assert.strictEqual(s.enviados.length, 1)
  assert.strictEqual(s.enviados[0].texto, config.mensaje)
  assert.strictEqual(s.enviados[0].jid, `${NUMERO}@s.whatsapp.net`)
  assert.strictEqual(s.leidos.length, 1)
})

await prueba('no responde a mensajes de texto', async () => {
  const { resultado, espia: s } = await correr(mensajeTexto())
  assert.strictEqual(resultado.accion, 'ignorado')
  assert.strictEqual(s.enviados.length, 0)
})

await prueba('no responde a un audio fuera de horario', async () => {
  const noche = cuando('2026-08-11T20:00:00Z') // 22:00 en Madrid
  const { resultado, espia: s } = await correr(mensajeAudio({ ahora: noche }), { ahora: noche })
  assert.strictEqual(resultado.motivo, 'fuera del horario de consulta')
  assert.strictEqual(s.enviados.length, 0)
})

await prueba('no se responde a sí mismo', async () => {
  const m = mensajeAudio()
  m.key.fromMe = true
  const { espia: s } = await correr(m)
  assert.strictEqual(s.enviados.length, 0)
})

await prueba('ignora los estados y los canales', async () => {
  const estado = mensajeAudio()
  estado.key.remoteJid = 'status@broadcast'
  const canal = mensajeAudio()
  canal.key.remoteJid = '120363111@newsletter'

  assert.strictEqual((await correr(estado)).espia.enviados.length, 0)
  assert.strictEqual((await correr(canal)).espia.enviados.length, 0)
})

await prueba('ignora los grupos salvo que se active en la config', async () => {
  assert.strictEqual((await correr(mensajeAudio({ grupo: true }))).espia.enviados.length, 0)

  const conGrupos = { ...config, responderEnGrupos: true }
  const { espia: s } = await correr(mensajeAudio({ grupo: true }), { cfg: conGrupos })
  assert.strictEqual(s.enviados.length, 1)
})

await prueba('soloNotasDeVoz descarta los audios adjuntos', async () => {
  const estricta = { ...config, soloNotasDeVoz: true }
  const adjunto = await correr(mensajeAudio({ ptt: false }), { cfg: estricta })
  const nota = await correr(mensajeAudio({ ptt: true }), { cfg: estricta })

  assert.strictEqual(adjunto.espia.enviados.length, 0)
  assert.strictEqual(nota.espia.enviados.length, 1)
})

await prueba('respeta la lista de contactos excluidos', async () => {
  const cfg = { ...config, contactosExcluidos: [NUMERO] }
  const { resultado, espia: s } = await correr(mensajeAudio(), { cfg })
  assert.strictEqual(resultado.motivo, 'contacto excluido')
  assert.strictEqual(s.enviados.length, 0)
})

await prueba('descarta los audios recibidos mientras el bot estaba apagado', async () => {
  const viejo = mensajeAudio({ ahora: new Date(MARTES_10H.getTime() - 3600 * 1000) })
  const { espia: s } = await correr(viejo)
  assert.strictEqual(s.enviados.length, 0)
})

// ---------- Anti-repetición ----------

await prueba('cinco audios seguidos generan una sola respuesta', async () => {
  const memoria = crearMemoriaVolatil()
  const s = espia()

  for (let i = 0; i < 5; i++) {
    await correr(mensajeAudio(), { memoria, espia: s })
  }
  assert.strictEqual(s.enviados.length, 1)
})

await prueba('el silencio es por contacto, no global', async () => {
  const memoria = crearMemoriaVolatil()
  const s = espia()

  for (const de of [NUMERO, '34600333444']) {
    await correr(mensajeAudio({ de }), { memoria, espia: s })
  }
  assert.strictEqual(s.enviados.length, 2)
})

await prueba('pasadas las horas de silencio se vuelve a avisar', async () => {
  const memoria = crearMemoriaVolatil()
  const s = espia()
  const despues = new Date(MARTES_10H.getTime() + (config.horasEntreAvisos + 1) * 3600 * 1000)

  await correr(mensajeAudio({ ahora: MARTES_10H }), { memoria, espia: s })
  // 7 h después de las 10:00 son las 17:00: sigue siendo horario de tarde.
  await correr(mensajeAudio({ ahora: despues }), { memoria, espia: s, ahora: despues })

  assert.strictEqual(s.enviados.length, 2)
})

await prueba('la memoria en disco sobrevive a un reinicio', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wa-memoria-'))
  const fichero = path.join(dir, 'avisos.json')

  const primera = crearMemoria(fichero)
  assert.strictEqual(primera.reservarAviso(NUMERO, 3600), true)
  assert.strictEqual(primera.reservarAviso(NUMERO, 3600), false)
  primera.cerrar()

  const segunda = crearMemoria(fichero)
  assert.strictEqual(segunda.reservarAviso(NUMERO, 3600), false, 'debería recordar el aviso')
  segunda.cerrar()

  fs.rmSync(dir, { recursive: true, force: true })
})

await prueba('la memoria en disco olvida los avisos caducados', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wa-memoria-'))
  const fichero = path.join(dir, 'avisos.json')
  const ahoraMs = Date.now()

  const memoria = crearMemoria(fichero)
  memoria.reservarAviso(NUMERO, 3600, { ahoraMs })
  assert.strictEqual(
    memoria.reservarAviso(NUMERO, 3600, { ahoraMs: ahoraMs + 3601 * 1000 }),
    true
  )
  memoria.cerrar()

  fs.rmSync(dir, { recursive: true, force: true })
})

await prueba('un fichero de memoria corrupto no tumba el bot', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wa-memoria-'))
  const fichero = path.join(dir, 'avisos.json')
  fs.writeFileSync(fichero, 'esto no es json')

  const memoria = crearMemoria(fichero)
  assert.strictEqual(memoria.reservarAviso(NUMERO, 3600), true)
  memoria.cerrar()

  fs.rmSync(dir, { recursive: true, force: true })
})

// ---------- Errores ----------

await prueba('un fallo al enviar no rompe el bot', async () => {
  const resultado = await procesarMensaje(mensajeAudio(), {
    config,
    ahora: MARTES_10H,
    memoria: crearMemoriaVolatil(),
    enviarTexto: async () => {
      throw new Error('conexión perdida')
    },
    marcarLeido: async () => {},
  })
  assert.strictEqual(resultado.accion, 'error')
})

await prueba('un mensaje sin estructura reconocible se ignora', () => {
  assert.strictEqual(normalizar({}), null)
  assert.strictEqual(decidir(null, config, MARTES_10H).accion, 'ignorado')
})

// ---------- Resultado ----------

console.log(`\n${pasadas} pruebas pasadas`)
if (fallos.length) {
  console.error(`${fallos.length} fallos:\n  - ${fallos.join('\n  - ')}\n`)
  process.exit(1)
}
