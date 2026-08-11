#!/usr/bin/env node
/**
 * Bot de respuesta automática a audios, conectado a tu propio número
 * de WhatsApp mediante el protocolo multidispositivo (como WhatsApp Web).
 *
 *   node bot.js            arranca el bot
 *   node bot.js --revisar  valida la configuración y sale, sin conectarse
 */

import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  Browsers,
} from '@whiskeysockets/baileys'
import pino from 'pino'
import qrcode from 'qrcode-terminal'

import config from './config.js'
import { validarConfig, resumenHorario, horaLocal } from './lib/horario.js'
import { crearMemoria } from './lib/memoria.js'
import { procesarMensaje } from './lib/procesar.js'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const DIR_DATOS = process.env.WHATSAPP_DATOS || path.join(AQUI, 'datos')
const DIR_SESION = path.join(DIR_DATOS, 'sesion')
const FICHERO_AVISOS = path.join(DIR_DATOS, 'avisos.json')

const registro = pino({ level: process.env.LOG_LEVEL || 'silent' })

function ahoraTexto() {
  const { dia, fechaISO, minutos } = horaLocal(new Date(), config.zonaHoraria)
  const hh = String(Math.floor(minutos / 60)).padStart(2, '0')
  const mm = String(minutos % 60).padStart(2, '0')
  return `${dia} ${fechaISO} ${hh}:${mm}`
}

function log(...partes) {
  console.log(`[${ahoraTexto()}]`, ...partes)
}

function comprobarConfiguracion() {
  const errores = validarConfig(config)
  if (errores.length) {
    console.error('Configuración inválida en config.js:')
    for (const error of errores) console.error(`  - ${error}`)
    process.exit(1)
  }

  log('Horario de consulta:', resumenHorario(config))
  log(`Zona horaria: ${config.zonaHoraria} | Ahora mismo: ${ahoraTexto()}`)
  log(`Un aviso cada ${config.horasEntreAvisos} h por contacto`)
  log(config.soloNotasDeVoz ? 'Solo notas de voz' : 'Notas de voz y audios adjuntos')
  log(config.responderEnGrupos ? 'Grupos incluidos' : 'Grupos ignorados')
}

async function arrancar() {
  comprobarConfiguracion()

  fs.mkdirSync(DIR_SESION, { recursive: true })
  const memoria = crearMemoria(FICHERO_AVISOS)
  const { state, saveCreds } = await useMultiFileAuthState(DIR_SESION)
  const { version } = await fetchLatestBaileysVersion()

  let cerrando = false
  let reintentos = 0

  function conectar() {
    const sock = makeWASocket({
      version,
      auth: state,
      logger: registro,
      browser: Browsers.appropriate('Consulta'),
      // Clave con un número personal: si el bot se marcase como "en línea",
      // WhatsApp le enviaría a él las notificaciones y dejarían de sonar
      // en tu móvil.
      markOnlineOnConnect: false,
      syncFullHistory: false,
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (evento) => {
      const { connection, lastDisconnect, qr } = evento

      if (qr) {
        console.log('\nEscanea este QR desde tu móvil:')
        console.log('WhatsApp > Ajustes > Dispositivos vinculados > Vincular dispositivo\n')
        qrcode.generate(qr, { small: true })
      }

      if (connection === 'open') {
        reintentos = 0
        const yo = sock.user?.id ? sock.user.id.split(':')[0] : 'desconocido'
        log(`Conectado como ${yo}. Escuchando audios.`)
      }

      if (connection === 'close') {
        const codigo = lastDisconnect?.error?.output?.statusCode

        if (cerrando) return

        if (codigo === DisconnectReason.loggedOut) {
          log('La sesión se cerró desde el móvil.')
          log(`Borra ${DIR_SESION} y vuelve a arrancar para escanear un QR nuevo.`)
          process.exit(1)
        }

        // Espera creciente hasta 1 minuto para no martillear el servidor.
        reintentos++
        const espera = Math.min(60, 2 ** Math.min(reintentos, 5))
        log(`Conexión perdida (${codigo || 'sin código'}). Reintento en ${espera}s.`)
        setTimeout(conectar, espera * 1000)
      }
    })

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      // 'notify' son los mensajes que llegan en vivo. 'append' es histórico
      // que WhatsApp sincroniza al conectar: no hay que contestarlo.
      if (type !== 'notify') return

      for (const bruto of messages) {
        try {
          const resultado = await procesarMensaje(bruto, {
            config,
            memoria,
            enviarTexto: (jid, texto) => sock.sendMessage(jid, { text: texto }),
            marcarLeido: (clave) => sock.readMessages([clave]),
          })

          if (resultado.accion === 'respondido') {
            log(`Audio de ${resultado.numero} -> respondido`)
          } else if (resultado.accion === 'error') {
            log(`Audio de ${resultado.numero} -> ERROR: ${resultado.motivo}`)
          } else if (resultado.motivo !== 'no es audio' && resultado.motivo !== 'mensaje propio') {
            log(`Audio de ${resultado.numero} -> ignorado (${resultado.motivo})`)
          }
        } catch (error) {
          console.error('[bot] fallo procesando un mensaje:', error)
        }
      }
    })

    return sock
  }

  const apagar = (senal) => {
    if (cerrando) return
    cerrando = true
    log(`Recibido ${senal}, guardando y saliendo.`)
    memoria.cerrar()
    process.exit(0)
  }

  process.on('SIGINT', () => apagar('SIGINT'))
  process.on('SIGTERM', () => apagar('SIGTERM'))

  conectar()
}

if (process.argv.includes('--revisar')) {
  comprobarConfiguracion()
  log('Configuración correcta.')
} else {
  arrancar().catch((error) => {
    console.error('[bot] no se pudo arrancar:', error)
    process.exit(1)
  })
}
