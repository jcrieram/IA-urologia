/**
 * Memoria de "a quién ya he avisado", para no responder cinco veces
 * seguidas a quien manda cinco audios.
 *
 * Se guarda en disco para que sobreviva a reinicios del bot: si se cae y
 * vuelve, no repite avisos que ya envió.
 */

import fs from 'fs'
import path from 'path'

export function crearMemoria(rutaFichero) {
  let avisos = new Map()
  let escrituraPendiente = null

  function cargar() {
    try {
      const datos = JSON.parse(fs.readFileSync(rutaFichero, 'utf8'))
      avisos = new Map(Object.entries(datos))
    } catch (error) {
      // Primera ejecución o fichero corrupto: empezamos de cero.
      if (error.code !== 'ENOENT') {
        console.error('[memoria] no se pudo leer el histórico, empiezo vacío:', error.message)
      }
      avisos = new Map()
    }
  }

  function guardar() {
    // Escritura atómica: si el proceso muere a media escritura, el fichero
    // bueno sigue intacto.
    const temporal = `${rutaFichero}.tmp`
    fs.mkdirSync(path.dirname(rutaFichero), { recursive: true })
    fs.writeFileSync(temporal, JSON.stringify(Object.fromEntries(avisos)))
    fs.renameSync(temporal, rutaFichero)
  }

  function guardarDiferido() {
    if (escrituraPendiente) return
    escrituraPendiente = setTimeout(() => {
      escrituraPendiente = null
      try {
        guardar()
      } catch (error) {
        console.error('[memoria] no se pudo guardar el histórico:', error.message)
      }
    }, 1000)
    escrituraPendiente.unref?.()
  }

  function limpiarCaducados(ahoraMs) {
    for (const [contacto, caducaEn] of avisos) {
      if (caducaEn <= ahoraMs) avisos.delete(contacto)
    }
  }

  cargar()

  return {
    /**
     * ¿Debo avisar a este contacto ahora mismo?
     * Devuelve true como mucho una vez cada `segundos` por contacto.
     */
    reservarAviso(contacto, segundos, opciones = {}) {
      const ahoraMs = opciones.ahoraMs || Date.now()

      // Un cooldown de 0 desactiva la deduplicación: se avisa siempre.
      if (!segundos || segundos <= 0) return true

      limpiarCaducados(ahoraMs)
      if (avisos.has(contacto)) return false

      avisos.set(contacto, ahoraMs + segundos * 1000)
      guardarDiferido()
      return true
    },

    /** Vuelca a disco lo que quede pendiente (al apagar el bot). */
    cerrar() {
      if (escrituraPendiente) clearTimeout(escrituraPendiente)
      escrituraPendiente = null
      try {
        guardar()
      } catch (error) {
        console.error('[memoria] no se pudo guardar al cerrar:', error.message)
      }
    },

    /** Solo para tests. */
    _tamano: () => avisos.size,
  }
}

/** Memoria en RAM, sin disco. Útil en tests. */
export function crearMemoriaVolatil() {
  const avisos = new Map()
  return {
    reservarAviso(contacto, segundos, opciones = {}) {
      const ahoraMs = opciones.ahoraMs || Date.now()
      if (!segundos || segundos <= 0) return true

      for (const [clave, caducaEn] of avisos) {
        if (caducaEn <= ahoraMs) avisos.delete(clave)
      }
      if (avisos.has(contacto)) return false

      avisos.set(contacto, ahoraMs + segundos * 1000)
      return true
    },
    cerrar() {},
    _tamano: () => avisos.size,
  }
}
