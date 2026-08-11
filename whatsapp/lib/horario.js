/**
 * Decide si un instante cae dentro de las franjas de consulta,
 * respetando zona horaria (y por tanto el cambio de hora) y festivos.
 */

const DIAS_EN = {
  Mon: 'lun',
  Tue: 'mar',
  Wed: 'mie',
  Thu: 'jue',
  Fri: 'vie',
  Sat: 'sab',
  Sun: 'dom',
}

/** Convierte "HH:MM" en minutos desde medianoche. */
function aMinutos(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm).trim())
  if (!m) throw new Error(`Hora inválida: "${hhmm}" (se espera HH:MM)`)
  const horas = Number(m[1])
  const minutos = Number(m[2])
  if (horas > 23 || minutos > 59) throw new Error(`Hora fuera de rango: "${hhmm}"`)
  return horas * 60 + minutos
}

/** "09:00-13:30" -> { inicio: 540, fin: 810 } */
function parsearFranja(franja) {
  const partes = String(franja).split('-')
  if (partes.length !== 2) {
    throw new Error(`Franja inválida: "${franja}" (se espera HH:MM-HH:MM)`)
  }
  return { inicio: aMinutos(partes[0]), fin: aMinutos(partes[1]) }
}

/**
 * Traduce una fecha a la hora local de la zona indicada.
 * Devuelve el día de la semana en clave corta, la fecha ISO y los
 * minutos transcurridos desde medianoche.
 */
function horaLocal(fecha, zonaHoraria) {
  const formato = new Intl.DateTimeFormat('en-US', {
    timeZone: zonaHoraria,
    hour12: false,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  const partes = {}
  for (const parte of formato.formatToParts(fecha)) partes[parte.type] = parte.value

  // Algunos entornos devuelven "24" para la medianoche.
  const horas = Number(partes.hour) % 24

  return {
    dia: DIAS_EN[partes.weekday],
    fechaISO: `${partes.year}-${partes.month}-${partes.day}`,
    minutos: horas * 60 + Number(partes.minute),
  }
}

/** ¿Están esos minutos dentro de la franja? Soporta franjas que cruzan medianoche. */
function dentroDeFranja(minutos, franja) {
  const { inicio, fin } = parsearFranja(franja)
  if (fin > inicio) return minutos >= inicio && minutos < fin
  if (fin < inicio) return minutos >= inicio || minutos < fin // cruza medianoche
  return false // "10:00-10:00" es una franja vacía
}

/**
 * ¿Toca contestar automáticamente en este momento?
 * @param {Date} fecha
 * @param {object} config  Config de whatsapp/config.js
 */
function enHorarioDeConsulta(fecha, config) {
  const { dia, fechaISO, minutos } = horaLocal(fecha, config.zonaHoraria)

  const excepciones = config.excepciones || {}
  const franjas = Object.prototype.hasOwnProperty.call(excepciones, fechaISO)
    ? excepciones[fechaISO]
    : (config.franjas || {})[dia]

  if (!Array.isArray(franjas) || franjas.length === 0) return false
  return franjas.some((franja) => dentroDeFranja(minutos, franja))
}

/** Valida la config al arrancar para fallar pronto y con un mensaje claro. */
function validarConfig(config) {
  const errores = []

  try {
    horaLocal(new Date(), config.zonaHoraria)
  } catch (error) {
    errores.push(`zonaHoraria inválida: "${config.zonaHoraria}"`)
  }

  const grupos = Object.entries(config.franjas || {}).concat(
    Object.entries(config.excepciones || {})
  )
  for (const [clave, franjas] of grupos) {
    if (!Array.isArray(franjas)) {
      errores.push(`"${clave}" debe ser una lista de franjas`)
      continue
    }
    for (const franja of franjas) {
      try {
        parsearFranja(franja)
      } catch (error) {
        errores.push(`"${clave}": ${error.message}`)
      }
    }
  }

  if (!config.mensaje || !String(config.mensaje).trim()) {
    errores.push('mensaje vacío')
  }
  if (!(Number(config.horasEntreAvisos) >= 0)) {
    errores.push('horasEntreAvisos debe ser un número >= 0')
  }

  return errores
}

module.exports = { enHorarioDeConsulta, horaLocal, dentroDeFranja, parsearFranja, validarConfig }
