/*
 * ECOE Trainer — Banco de estaciones (BORRADOR para validación médica)
 * ==================================================================
 * Alineado al "Informe Ejecutivo ECOE EUNACOM-SP (UC)" del usuario:
 *  - 4 etapas: Medicina Interna, Pediatría, Obstetricia y Ginecología, Cirugía.
 *  - Enfoque MÉDICO GENERAL: diagnosticar / estabilizar / DERIVAR, definiendo
 *    siempre el destino del paciente (ambulatorio, hospitalización o derivación).
 *  - Estructura por competencias según el algoritmo SEGURA:
 *      Seguridad inicial → Anamnesis (Escuchar) → Examen físico →
 *      Exámenes e interpretación (Gravedad) → Diagnóstico (Ubicar) →
 *      Procedimiento → Manejo y destino (Resolver) → Comunicación y cierre (Asegurar).
 *  - Las estaciones son material ORIGINAL de práctica basado en las
 *    estaciones modelo y "criterios mínimos" del informe. No son casos
 *    oficiales ni bancos filtrados de la UC.
 *  - Cada estación declara `fuentes`: las guías de referencia contra las
 *    que su contenido debe contrastarse (ver catálogo FUENTES).
 *
 * NOTA CLÍNICA: herramienta educativa; no reemplaza el juicio clínico ni las
 * guías vigentes (MINSAL/GES/UC/EUNACOM).
 *
 * ESTADO DE VALIDACIÓN — dos niveles distintos, no confundir:
 *
 *   `revisionEstructura:'AAAA-MM-DD'`
 *      El formato de la estación (etapas SEGURA, pauta, ítems críticos,
 *      instrucción de puerta, tiempos) fue revisado y aprobado.
 *      NO implica que el contenido clínico haya sido verificado.
 *
 *   `validacionClinica:{ por:'...', fecha:'AAAA-MM-DD', fuente:'...' }`
 *      El contenido clínico fue verificado por un profesional con
 *      experiencia vigente en el área, contra una fuente citable.
 *
 * ESTADO ACTUAL: ninguna estación tiene `validacionClinica`. Medicina
 * Interna tiene revisión de estructura (2026-08-02). El resto es borrador.
 * El contenido debe contrastarse con las guías vigentes antes de darlo por
 * bueno (MINSAL/GES, manuales UC, Perfil de Conocimientos EUNACOM).
 *
 * Modelo de una opción: { id, texto, tipo, puntos, critico?, resp, fb }
 *   tipo: 'clave' | 'util' | 'neutro' | 'peligroso'   (los 'peligroso' restan)
 *   critico:true => omitir una 'clave' crítica, o ejecutar una 'peligroso'
 *                   crítica, REPRUEBA la estación.
 */

const AREAS = {
  medint:    { nombre:'Medicina Interna',           color:'#3b82f6', icono:'🫀', semana:1 },
  pediatria: { nombre:'Pediatría',                  color:'#22c55e', icono:'🧒', semana:2 },
  gineco:    { nombre:'Obstetricia y Ginecología',  color:'#ec4899', icono:'🤰', semana:3 },
  cirugia:   { nombre:'Cirugía',                    color:'#ef4444', icono:'🔪', semana:4 },
  transversal:{nombre:'Transversal',                color:'#8b5cf6', icono:'💬', semana:4 },
};

// Orden de competencias = algoritmo SEGURA (rige el orden de las etapas)
const COMPETENCIAS = [
  'Seguridad inicial',
  'Anamnesis',
  'Examen físico',
  'Exámenes e interpretación',
  'Diagnóstico',
  'Procedimiento',
  'Manejo y destino',
  'Comunicación y cierre',
];

// Interrogación oral por defecto (preguntas frecuentes del examinador, del informe UC)
const ORAL_DEFAULT = [
  { q:'¿Cuál es su diagnóstico principal y qué diferenciales considera?', modelo:'Estructura: "Paciente estable/inestable con un síndrome compatible con ___; mis diferenciales relevantes son ___ y ___".' },
  { q:'¿Qué examen solicita primero y por qué? ¿Qué resultado cambiaría su conducta?', modelo:'Prioriza el examen que confirma o descarta la hipótesis más grave y explica el umbral que modifica la decisión.' },
  { q:'¿Requiere manejo ambulatorio, hospitalización o derivación?', modelo:'Define el destino de forma explícita y justifícalo según la gravedad y el alcance del médico general.' },
  { q:'¿Qué tratamiento inicial indicaría y qué complicaciones anticipa?', modelo:'Medidas iniciales proporcionales al cuadro + vigilancia de las complicaciones esperables.' },
  { q:'¿Qué signos de alarma explicaría al cerrar la estación?', modelo:'Enumera signos de alarma concretos para reconsultar y verifica la comprensión del paciente.' },
];

// ---------- Helpers de etapas transversales (reutilizables) ----------
function segInicial(urgente){
  const gravedad = urgente
    ? { id:'s6', texto:'Evaluar estabilidad con ABCDE y pedir ayuda si corresponde', tipo:'clave', puntos:3, critico:true,
        resp:'Se aplica ABCDE; se solicita apoyo.', fb:'Reconocer y actuar ante la inestabilidad ANTES del diagnóstico es prioritario.' }
    : { id:'s6', texto:'Evaluar estado general y estabilidad (¿estable o inestable?)', tipo:'clave', puntos:2,
        resp:'Paciente evaluado; impresión de estabilidad.', fb:'Detectar gravedad temprano orienta toda la conducta.' };
  return {
    comp:'Seguridad inicial', tipo:'multi',
    instruccion:'Primer minuto: acciones de seguridad y apertura de la estación.',
    opciones:[
      { id:'s1', texto:'Higiene de manos', tipo:'clave', puntos:1, resp:'Realiza higiene de manos.', fb:'Competencia transversal de alto impacto.' },
      { id:'s2', texto:'Presentarse e indicar su rol', tipo:'clave', puntos:1, resp:'Se presenta como médico/a.', fb:'Ubica al paciente y genera confianza.' },
      { id:'s3', texto:'Confirmar identidad del paciente', tipo:'util', puntos:1, resp:'Confirma nombre y edad.', fb:'Seguridad del paciente.' },
      { id:'s4', texto:'Explicar la tarea y solicitar consentimiento', tipo:'clave', puntos:2, critico:true, resp:'El paciente acepta.', fb:'Omitir el consentimiento es un error crítico de comunicación.' },
      { id:'s5', texto:'Resguardar privacidad', tipo:'util', puntos:1, resp:'Se resguarda la privacidad.', fb:'Parte del profesionalismo evaluado.' },
      gravedad,
      { id:'s7', texto:'Iniciar maniobras invasivas sin evaluar ni consentir', tipo:'peligroso', puntos:-2, resp:'Genera riesgo y desconfianza.', fb:'Nunca antes de evaluar la estabilidad y obtener consentimiento.' },
    ],
  };
}

function cierre(extra){
  const base = [
    { id:'z1', texto:'Explicar diagnóstico y plan en lenguaje comprensible', tipo:'clave', puntos:2, resp:'El paciente/familia comprende.', fb:'La comunicación clara es una competencia evaluada.' },
    { id:'z2', texto:'Entregar signos de alarma para reconsultar', tipo:'clave', puntos:2, critico:true, resp:'Se explican los signos de alarma.', fb:'Omitir signos de alarma o no cerrar la estación penaliza fuertemente.' },
    { id:'z3', texto:'Verificar comprensión (pedir que repita el plan)', tipo:'clave', puntos:1, resp:'Confirma comprensión.', fb:'Cerrar el ciclo comunicacional.' },
    { id:'z4', texto:'Responder dudas y ofrecer apoyo', tipo:'util', puntos:1, resp:'Se responden dudas.', fb:'Buena práctica comunicacional.' },
  ];
  return { comp:'Comunicación y cierre', tipo:'multi', instruccion:'Cierre de la estación (últimos 30-45 s).', opciones: extra? base.concat(extra): base };
}

function destino(texto, fb){
  return { id:'mdest', texto, tipo:'clave', puntos:3, critico:true, resp:'Se define el destino del paciente.', fb: fb || 'No definir el destino del paciente es un error crítico.' };
}

// ============================ BANCO DE ESTACIONES ============================
// ===================== CATÁLOGO DE FUENTES DE REFERENCIA =====================
// Referencias sugeridas para CONTRASTAR el contenido de cada estación. No
// implican que la estación reproduzca la guía: son el material contra el cual
// debe verificarse antes de darla por válida. Cita siempre la versión vigente.
const FUENTES = {
  eunacom_perfil: 'Perfil de Conocimientos EUNACOM (eunacom.cl/contenidos/PerfilNew.pdf)',
  eunacom_sp:     'EUNACOM — Evaluación de la Sección Práctica (eunacom.cl/reglamentacion/EvaluacionSP.html)',
  minsal_ges:     'Guías Clínicas GES/AUGE, MINSAL Chile (versión vigente)',
  minsal_guias:   'Guías y normas técnicas MINSAL Chile (versión vigente)',
  uc_obsgin:      'Manual de Obstetricia y Ginecología, Facultad de Medicina UC (2023)',
  atls:           'ATLS — Advanced Trauma Life Support (American College of Surgeons)',
  acls:           'ACLS / Guías AHA de reanimación',
  aiepi:          'AIEPI / Normas de atención pediátrica MINSAL',
};

// ============================ BANCO DE ESTACIONES ============================
// Las estaciones se registran desde los módulos por área (data/<area>.js)
// mediante ESTACIONES.push(...). Mantener un archivo por área.
const ESTACIONES = [];
