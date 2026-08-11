/**
 * Configuración de la respuesta automática a audios de WhatsApp.
 *
 * Este es el único fichero que necesitas tocar para el día a día:
 * horarios, mensaje y frecuencia.
 */

export default {
  // Zona horaria con la que se interpretan las franjas de abajo.
  zonaHoraria: 'Europe/Madrid',

  /**
   * Franjas en las que SÍ se contesta automáticamente (estás en consulta).
   * Formato "HH:MM-HH:MM", varias por día. Un día con [] no contesta nunca.
   * Una franja que cruza medianoche se escribe igual: "22:00-02:00".
   */
  franjas: {
    lun: ['09:00-13:30', '15:00-17:30'],
    mar: ['09:00-13:30', '15:00-17:30'],
    mie: ['09:00-13:30', '15:00-17:30'],
    jue: ['09:00-13:30', '15:00-17:30'],
    vie: ['09:00-13:30', '15:00-17:30'],
    sab: [],
    dom: [],
  },

  /**
   * Excepciones por fecha concreta (YYYY-MM-DD). Sustituyen a la franja
   * del día de la semana. Útil para festivos, congresos o quirófano.
   *   '2026-08-15': []                    -> festivo, no se contesta
   *   '2026-09-10': ['08:00-22:00']       -> día de congreso, todo el día
   */
  excepciones: {},

  // Mensaje que se envía. Se manda tal cual, en texto plano.
  mensaje:
    'Hola, soy el Dr. Juan Carlos Riera. Ahora mismo estoy en consulta y no ' +
    'puedo escuchar audios. Si me lo escribes por texto te contesto en cuanto ' +
    'termine. Gracias por tu paciencia.',

  // Horas que deben pasar antes de volver a avisar al mismo contacto.
  horasEntreAvisos: 6,

  // true = solo notas de voz grabadas en el momento.
  // false = también ficheros de audio reenviados o adjuntos.
  soloNotasDeVoz: false,

  // Marcar el audio como leído (doble check azul) al responder.
  marcarComoLeido: true,

  // Contestar también a los audios que llegan por grupos.
  responderEnGrupos: false,

  /**
   * Contactos a los que nunca se responde automáticamente (familia, socios...).
   * Número completo con prefijo de país y sin '+', por ejemplo '34600111222'.
   */
  contactosExcluidos: [],

  /**
   * Al arrancar, WhatsApp entrega de golpe los mensajes recibidos mientras el
   * bot estaba apagado. Ignoramos los audios más antiguos que esto para no
   * contestar "estoy en consulta" a un audio de ayer.
   */
  ignorarMensajesMasViejosQueMin: 10,
}
