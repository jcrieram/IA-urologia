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
 *  - Las 10 estaciones son material ORIGINAL de práctica basado en las
 *    estaciones modelo y "criterios mínimos" del informe. No son casos
 *    oficiales ni bancos filtrados de la UC.
 *
 * NOTA CLÍNICA: herramienta educativa; no reemplaza el juicio clínico ni las
 * guías vigentes (MINSAL/GES/UC/EUNACOM).
 *
 * ESTADO DE VALIDACIÓN: las estaciones con el campo `validado:'AAAA-MM-DD'`
 * fueron revisadas y aprobadas por el Dr. Juan Carlos Riera. Las que no lo
 * tienen siguen en estado BORRADOR pendiente de validación médica.
 *   Validadas: Medicina Interna (dolor torácico, ACV) — 2026-08-02.
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
const ESTACIONES = [

  /* ========== 1 · MEDICINA INTERNA — Dolor torácico ========== */
  {
    id:'mi-dolor-toracico', area:'medint', titulo:'Dolor torácico agudo', nivel:'Médico general', minutos:8,
    validado:'2026-08-02',
    motivo:'Hombre de 58 años con dolor torácico de 40 minutos.',
    puerta:'Hombre de 58 años con dolor torácico de 40 minutos. Realice anamnesis dirigida, explique su hipótesis y la conducta inicial.',
    criterios:['Caracterizar el dolor e irradiación','Buscar disnea, diaforesis, náuseas y síncope','Factores de riesgo cardiovascular','ECG, monitorización y evaluación urgente','No dar de alta sin estudio'],
    briefing:'Servicio de urgencia. En 8 minutos: seguridad, anamnesis y examen dirigidos, exámenes, diagnóstico y manejo inicial. El tiempo es crítico.',
    vineta:'Hombre de 58 años, hipertenso y fumador. Dolor retroesternal opresivo de 40 min, irradiado a brazo izquierdo, con sudoración. Llega caminando, ansioso.',
    etapas:[
      segInicial(true),
      { comp:'Anamnesis', tipo:'multi', instruccion:'Anamnesis dirigida.', opciones:[
        { id:'a1', texto:'Caracterizar el dolor (tipo, irradiación, duración, gatillantes/reposo)', tipo:'clave', puntos:3, critico:true, resp:'"Es un peso en el pecho, se corre al brazo izquierdo, no cede en reposo, 40 min."', fb:'Define la probabilidad de origen coronario.' },
        { id:'a2', texto:'Síntomas asociados: disnea, diaforesis, náuseas, síncope', tipo:'clave', puntos:2, resp:'"Sudo frío y me falta un poco el aire."', fb:'Los síntomas neurovegetativos apoyan isquemia.' },
        { id:'a3', texto:'Factores de riesgo cardiovascular', tipo:'clave', puntos:2, resp:'"HTA, fumo una cajetilla al día, mi papá infartó."', fb:'Aumentan la probabilidad pre-test.' },
        { id:'a4', texto:'Antecedentes de sangrado / uso de anticoagulantes', tipo:'util', puntos:1, resp:'"No, nunca."', fb:'Relevante antes de antiagregar/anticoagular.' },
        { id:'a5', texto:'Uso de sildenafil o drogas (cocaína)', tipo:'util', puntos:1, resp:'"No uso nada de eso."', fb:'Importante antes de indicar nitratos.' },
        { id:'a6', texto:'Anamnesis enciclopédica de toda la historia vital', tipo:'peligroso', puntos:-1, resp:'Consume el tiempo de la estación.', fb:'La anamnesis enciclopédica es un error de ejecución ECOE.' },
      ]},
      { comp:'Examen físico', tipo:'multi', instruccion:'Examen dirigido.', opciones:[
        { id:'e1', texto:'Signos vitales + saturación (PA en ambos brazos)', tipo:'clave', puntos:2, resp:'PA 158/94 (simétrica), FC 92, SatO₂ 96%, FR 18.', fb:'Diferencia de PA orienta a disección aórtica.' },
        { id:'e2', texto:'Auscultación cardíaca (soplos, R3, frotes)', tipo:'clave', puntos:2, resp:'Rítmico, sin soplos ni R3.', fb:'Detecta complicaciones/insuficiencia.' },
        { id:'e3', texto:'Auscultación pulmonar (crépitos)', tipo:'util', puntos:1, resp:'Sin crépitos.', fb:'Evalúa congestión (Killip).' },
        { id:'e4', texto:'Buscar si el dolor es reproducible a la palpación', tipo:'util', puntos:1, resp:'No se reproduce a la palpación.', fb:'La reproducción a la palpación haría menos probable el origen coronario.' },
      ]},
      { comp:'Exámenes e interpretación', tipo:'multi', instruccion:'Exámenes iniciales.', opciones:[
        { id:'x1', texto:'ECG de 12 derivaciones en < 10 minutos', tipo:'clave', puntos:4, critico:true, resp:'SDST de 2 mm en DII, DIII y aVF.', fb:'El ECG precoz es la prioridad: define la reperfusión.' },
        { id:'x2', texto:'Troponinas', tipo:'clave', puntos:2, resp:'Troponina inicial elevada.', fb:'Marcador de necrosis miocárdica.' },
        { id:'x3', texto:'Radiografía de tórax', tipo:'util', puntos:1, resp:'Sin ensanchamiento mediastínico.', fb:'Apoya diferenciales (disección, neumotórax).' },
        { id:'x4', texto:'Esperar 6 h para repetir troponina antes de actuar', tipo:'peligroso', puntos:-3, critico:true, resp:'Retrasa la reperfusión.', fb:'En SDST NO se espera troponina: se activa reperfusión de inmediato.' },
      ]},
      { comp:'Diagnóstico', tipo:'unica', instruccion:'Diagnóstico más probable.', opciones:[
        { id:'d1', texto:'IAM con SDST (pared inferior)', tipo:'clave', puntos:4, resp:'Correcto.', fb:'SDST en DII-DIII-aVF define IAMCEST inferior.' },
        { id:'d2', texto:'Angina estable', tipo:'peligroso', puntos:-2, resp:'Incorrecto: dolor en reposo, prolongado, con SDST.', fb:'Subestima un IAM en curso.' },
        { id:'d3', texto:'Dolor musculoesquelético', tipo:'peligroso', puntos:-3, resp:'Incorrecto y peligroso.', fb:'Riesgo de alta inadecuada.' },
        { id:'d4', texto:'Pericarditis aguda', tipo:'neutro', puntos:0, resp:'Menos probable.', fb:'Diferencial descartado por patrón.' },
      ]},
      { comp:'Manejo y destino', tipo:'multi', instruccion:'Manejo inicial del IAMCEST.', opciones:[
        { id:'m1', texto:'Aspirina (carga) + segundo antiagregante', tipo:'clave', puntos:2, resp:'Doble antiagregación.', fb:'Pilar del SCA.' },
        { id:'m2', texto:'Activar reperfusión (angioplastía primaria o trombólisis según tiempos)', tipo:'clave', puntos:3, critico:true, resp:'Se activa la red de reperfusión.', fb:'La reperfusión precoz salva miocardio.' },
        { id:'m3', texto:'Monitorización continua; O₂ solo si SatO₂ < 90%', tipo:'clave', puntos:2, resp:'Se monitoriza.', fb:'Vigilar arritmias; O₂ solo si hipoxemia.' },
        { id:'m4', texto:'Nitroglicerina sin verificar PA/uso de sildenafil', tipo:'peligroso', puntos:-2, resp:'Riesgo de hipotensión grave.', fb:'Contraindicada en hipotensión, IAM de VD o inhibidores PDE5.' },
        destino('Hospitalización en unidad coronaria / traslado urgente para reperfusión','El destino es hospitalización urgente; nunca alta sin estudio.'),
      ]},
      cierre(),
    ],
    oral:[
      { q:'¿Cuál es su diagnóstico principal y en qué se basa?', modelo:'IAM con SDST inferior: dolor opresivo prolongado en reposo, factores de riesgo cardiovascular y SDST en DII-DIII-aVF con troponina elevada.' },
      { q:'¿Qué examen solicita primero y por qué?', modelo:'ECG de 12 derivaciones en < 10 min: define la reperfusión inmediata. En el SDST no se espera la troponina para actuar.' },
      { q:'¿Hospitaliza o deriva? ¿Qué tratamiento inicia?', modelo:'Hospitalización/traslado urgente para reperfusión (angioplastía primaria o trombólisis según tiempos) + aspirina y segundo antiagregante, monitorización; oxígeno solo si SatO₂ < 90%.' },
      { q:'¿Qué complicaciones anticipa?', modelo:'Arritmias (FV/TV), bradiarritmias/bloqueo AV (frecuentes en IAM inferior), falla de bomba/shock y complicaciones mecánicas.' },
      { q:'¿Qué haría si el paciente rechaza el tratamiento?', modelo:'Informar el riesgo vital con empatía, verificar comprensión y capacidad, registrar; respetar la autonomía si la decisión es competente y ofrecer reevaluación.' },
    ],
    aprobacion:{ minPct:60, requiereDx:true },
  },

  /* ========== 2 · MEDICINA INTERNA — Déficit neurológico focal (ACV) ========== */
  {
    id:'mi-acv', area:'medint', titulo:'Déficit neurológico focal agudo', nivel:'Médico general', minutos:8,
    validado:'2026-08-02',
    motivo:'Mujer de 70 años con afasia y hemiparesia derecha de inicio súbito.',
    puerta:'Mujer de 70 años con afasia y hemiparesia derecha de inicio súbito. Evalúe y entregue la conducta.',
    criterios:['Hora de inicio o última vez vista normal','ABCDE y glicemia capilar','Evaluación neurológica focalizada','Anticoagulantes y contraindicaciones','Activar protocolo ACV y neuroimagen urgente'],
    briefing:'Urgencia. Sospecha de ACV: el tiempo es cerebro. En 8 minutos evalúe y defina conducta.',
    vineta:'Mujer de 70 años, hipertensa. Hace 1 hora inicia bruscamente dificultad para hablar y debilidad del brazo y pierna derechos. Vigil, PA elevada.',
    etapas:[
      segInicial(true),
      { comp:'Anamnesis', tipo:'multi', instruccion:'Anamnesis dirigida (rápida).', opciones:[
        { id:'a1', texto:'Hora exacta de inicio / última vez vista normal', tipo:'clave', puntos:3, critico:true, resp:'"Estaba bien hace una hora."', fb:'Define la ventana para reperfusión (trombólisis/trombectomía).' },
        { id:'a2', texto:'Uso de anticoagulantes/antiagregantes', tipo:'clave', puntos:2, critico:true, resp:'"No toma anticoagulantes."', fb:'Contraindicaciones y riesgo de hemorragia.' },
        { id:'a3', texto:'Factores de riesgo: HTA, FA, diabetes, ACV previo', tipo:'clave', puntos:2, resp:'"Hipertensa, con arritmia conocida."', fb:'FA sugiere origen cardioembólico.' },
        { id:'a4', texto:'Síntomas asociados (cefalea, convulsión, trauma)', tipo:'util', puntos:1, resp:'"Sin cefalea ni trauma."', fb:'Orienta a hemorragia u otras causas.' },
        { id:'a5', texto:'Últimas comidas y alergias en detalle', tipo:'neutro', puntos:0, resp:'Sin relevancia inmediata.', fb:'No prioritario en la ventana de tiempo.' },
      ]},
      { comp:'Examen físico', tipo:'multi', instruccion:'Examen dirigido.', opciones:[
        { id:'e1', texto:'ABCDE + glicemia capilar (HGT)', tipo:'clave', puntos:3, critico:true, resp:'HGT 108 mg/dL; vía aérea permeable.', fb:'La hipoglucemia imita un ACV: SIEMPRE medir HGT.' },
        { id:'e2', texto:'Examen neurológico focalizado (lenguaje, fuerza, facial, campos)', tipo:'clave', puntos:3, resp:'Afasia, hemiparesia derecha, desviación facial.', fb:'Cuantifica el déficit (escala tipo NIHSS).' },
        { id:'e3', texto:'Signos vitales y presión arterial', tipo:'clave', puntos:2, resp:'PA 190/100, FC irregular.', fb:'Manejo de PA y detección de FA.' },
        { id:'e4', texto:'Auscultación cardíaca (ritmo)', tipo:'util', puntos:1, resp:'Ritmo irregular.', fb:'Apoya FA / cardioembolia.' },
      ]},
      { comp:'Exámenes e interpretación', tipo:'multi', instruccion:'Estudio inicial.', opciones:[
        { id:'x1', texto:'TC de cerebro sin contraste URGENTE', tipo:'clave', puntos:4, critico:true, resp:'TC sin sangrado (isquémico probable).', fb:'Distingue isquémico de hemorrágico: define el tratamiento.' },
        { id:'x2', texto:'ECG (buscar FA)', tipo:'clave', puntos:1, resp:'Fibrilación auricular.', fb:'Fuente cardioembólica.' },
        { id:'x3', texto:'Hemograma, glicemia, coagulación', tipo:'util', puntos:1, resp:'Normales.', fb:'Necesarios antes de trombólisis.' },
        { id:'x4', texto:'Iniciar aspirina antes de la TC', tipo:'peligroso', puntos:-3, critico:true, resp:'Riesgo si es hemorrágico.', fb:'Nunca antiagregar/anticoagular antes de descartar hemorragia por imagen.' },
      ]},
      { comp:'Diagnóstico', tipo:'unica', instruccion:'Diagnóstico más probable.', opciones:[
        { id:'d1', texto:'Ataque cerebrovascular (probable isquémico)', tipo:'clave', puntos:4, resp:'Correcto.', fb:'Déficit focal súbito con TC sin sangrado.' },
        { id:'d2', texto:'Crisis de pánico', tipo:'peligroso', puntos:-3, resp:'Incorrecto y peligroso.', fb:'Ignora una emergencia tiempo-dependiente.' },
        { id:'d3', texto:'Migraña con aura', tipo:'neutro', puntos:0, resp:'Poco probable a esta edad y presentación.', fb:'Diferencial descartado.' },
        { id:'d4', texto:'Hipoglucemia', tipo:'neutro', puntos:0, resp:'Descartada con HGT normal.', fb:'Diferencial obligado ya evaluado.' },
      ]},
      { comp:'Manejo y destino', tipo:'multi', instruccion:'Conducta.', opciones:[
        { id:'m1', texto:'Activar protocolo/código ACV', tipo:'clave', puntos:3, critico:true, resp:'Se activa el código ACV.', fb:'Coordina la atención tiempo-dependiente.' },
        { id:'m2', texto:'Evaluar reperfusión (trombólisis/trombectomía) según ventana', tipo:'clave', puntos:2, resp:'Se evalúa elegibilidad.', fb:'Beneficio dependiente del tiempo.' },
        { id:'m3', texto:'Manejo cauteloso de la PA según protocolo', tipo:'util', puntos:1, resp:'Se maneja la PA.', fb:'No bajar la PA agresivamente en isquémico.' },
        destino('Hospitalización / derivación urgente a centro con neuroimagen y unidad de ACV','El médico general estabiliza y deriva sin demora.'),
      ]},
      cierre(),
    ],
    oral:[
      { q:'¿Cuál es su diagnóstico y su principal preocupación?', modelo:'ACV probablemente isquémico (déficit focal súbito con TC sin sangrado). Preocupa la ventana terapéutica: "tiempo es cerebro".' },
      { q:'¿Qué dato define su conducta?', modelo:'La hora de inicio / última vez visto normal y la TC sin hemorragia: definen la elegibilidad para trombólisis o trombectomía.' },
      { q:'¿Por qué mide glicemia capilar?', modelo:'La hipoglucemia imita un ACV; es un diferencial obligado y reversible que se descarta de inmediato.' },
      { q:'¿Hospitaliza o deriva? ¿Qué tratamiento?', modelo:'Activar código ACV y derivar urgente a un centro con neuroimagen/unidad de ACV; evaluar reperfusión según ventana; no antiagregar antes de descartar hemorragia; manejo cauteloso de la PA.' },
      { q:'¿Qué signos de alarma explicaría?', modelo:'Empeoramiento del déficit, compromiso de conciencia, cefalea intensa o vómitos: aviso/reconsulta inmediata.' },
    ],
    aprobacion:{ minPct:60, requiereDx:true },
  },

  /* ========== 3 · PEDIATRÍA — Lactante con dificultad respiratoria ========== */
  {
    id:'ped-dificultad-resp', area:'pediatria', titulo:'Lactante con dificultad respiratoria', nivel:'Médico general', minutos:8,
    motivo:'Lactante de 8 meses con tos, rechazo alimentario y taquipnea.',
    puerta:'Lactante de ocho meses con tos, rechazo alimentario y taquipnea. Evalúe y explique el manejo.',
    criterios:['Apariencia y perfusión','Signos de dificultad respiratoria','Saturación y apneas','Alimentación y diuresis','Criterios de hospitalización y alarmas'],
    briefing:'Urgencia pediátrica, acompañado de su madre. Evalúe gravedad, plantee diagnóstico y defina manejo y educación.',
    vineta:'Lactante de 8 meses, previamente sano, 3 días de coriza y tos, hoy con dificultad respiratoria y sibilancias. Rechazo parcial de la alimentación. Sin fiebre alta.',
    etapas:[
      segInicial(false),
      { comp:'Anamnesis', tipo:'multi', instruccion:'Preguntas dirigidas a la madre.', opciones:[
        { id:'a1', texto:'Tolerancia oral, diuresis y signos de deshidratación', tipo:'clave', puntos:3, critico:true, resp:'"Come menos de la mitad y ha mojado menos pañales."', fb:'Determinante para decidir hospitalización.' },
        { id:'a2', texto:'Signos de alarma: apneas, cianosis, quejido', tipo:'clave', puntos:3, critico:true, resp:'"A veces se pone morado de los labios y hace un quejido."', fb:'Indican gravedad y necesidad de manejo inmediato.' },
        { id:'a3', texto:'Tiempo de evolución y progresión', tipo:'clave', puntos:2, resp:'"3 días resfriado, hoy respira más rápido."', fb:'Fase evolutiva típica de bronquiolitis.' },
        { id:'a4', texto:'Antecedentes: prematuridad, cardiopatía, vacunas', tipo:'util', puntos:2, resp:'"De término, vacunas al día."', fb:'Modifican la gravedad esperada.' },
        { id:'a5', texto:'Contactos enfermos / sala cuna', tipo:'util', puntos:1, resp:'"El hermano anda resfriado."', fb:'Contexto epidemiológico viral.' },
      ]},
      { comp:'Examen físico', tipo:'multi', instruccion:'Examen y evaluación de gravedad.', opciones:[
        { id:'e1', texto:'Apariencia, perfusión y signos vitales + SatO₂', tipo:'clave', puntos:3, critico:true, resp:'FR 62, FC 148, T° 37,6°, SatO₂ 89%, algo pálido.', fb:'Apariencia, perfusión y saturación son determinantes de gravedad.' },
        { id:'e2', texto:'Retracciones y uso de musculatura accesoria', tipo:'clave', puntos:2, resp:'Retracción subcostal e intercostal, aleteo nasal.', fb:'Gradúa la severidad.' },
        { id:'e3', texto:'Auscultación pulmonar', tipo:'clave', puntos:2, resp:'Sibilancias y crépitos difusos, espiración prolongada.', fb:'Patrón compatible con bronquiolitis.' },
        { id:'e4', texto:'Estado de hidratación y conciencia', tipo:'util', puntos:1, resp:'Mucosas algo secas, consolable.', fb:'Complementa la evaluación.' },
      ]},
      { comp:'Exámenes e interpretación', tipo:'multi', instruccion:'Conducta respecto a exámenes.', opciones:[
        { id:'x1', texto:'Diagnóstico clínico; no solicitar exámenes de rutina', tipo:'clave', puntos:3, critico:true, resp:'La bronquiolitis es un diagnóstico clínico.', fb:'No se recomiendan exámenes de rutina en bronquiolitis típica.' },
        { id:'x2', texto:'Panel viral solo si cambia conducta/aislamiento', tipo:'util', puntos:1, resp:'Uso selectivo para cohorte.', fb:'No universal.' },
        { id:'x3', texto:'Radiografía de tórax de rutina', tipo:'peligroso', puntos:-2, resp:'No indicada de rutina.', fb:'Radiación y antibióticos innecesarios.' },
      ]},
      { comp:'Diagnóstico', tipo:'unica', instruccion:'Diagnóstico más probable.', opciones:[
        { id:'d1', texto:'Bronquiolitis aguda con hipoxemia', tipo:'clave', puntos:4, resp:'Correcto.', fb:'Lactante < 1 año, pródromo viral, sibilancias/crépitos e hipoxemia.' },
        { id:'d2', texto:'Neumonía bacteriana', tipo:'neutro', puntos:0, resp:'Menos probable sin fiebre alta ni foco.', fb:'Diferencial a considerar.' },
        { id:'d3', texto:'Crisis asmática', tipo:'neutro', puntos:0, resp:'Poco probable a esta edad y primer episodio.', fb:'Diferencial menos probable.' },
      ]},
      { comp:'Manejo y destino', tipo:'multi', instruccion:'Manejo inicial.', opciones:[
        { id:'m1', texto:'Oxígeno para SatO₂ ≥ 92%', tipo:'clave', puntos:3, critico:true, resp:'Se administra O₂; mejora.', fb:'Corregir la hipoxemia es la prioridad.' },
        { id:'m2', texto:'Aseo nasal y soporte (hidratación, alimentación fraccionada)', tipo:'clave', puntos:2, resp:'Medidas de soporte.', fb:'El manejo es fundamentalmente de soporte.' },
        { id:'m3', texto:'Antibióticos de rutina', tipo:'peligroso', puntos:-2, resp:'No indicados en cuadro viral.', fb:'Sin foco bacteriano no corresponden.' },
        destino('Hospitalizar por hipoxemia (SatO₂ 89%) y baja tolerancia oral','Alta con hipoxemia no corregida es un error grave.'),
      ]},
      cierre([
        { id:'z5', texto:'Enseñar signos de alarma específicos (rechazo total, apneas, cianosis)', tipo:'clave', puntos:1, resp:'Se enseñan.', fb:'Seguridad durante la evolución.' },
      ]),
    ],
    aprobacion:{ minPct:60, requiereDx:true },
  },

  /* ========== 4 · PEDIATRÍA — Diarrea y deshidratación ========== */
  {
    id:'ped-diarrea', area:'pediatria', titulo:'Diarrea y deshidratación', nivel:'Médico general', minutos:8,
    motivo:'Niño de 2 años con diarrea y vómitos.',
    puerta:'Niño de dos años con diarrea y vómitos. Clasifique la hidratación y plantee el manejo.',
    criterios:['Ingesta y diuresis','Estado mental y sed','Mucosas, ojos y perfusión','Clasificar gravedad','Plan de rehidratación y alarmas'],
    briefing:'Urgencia pediátrica. Clasifique el grado de deshidratación y defina el plan de rehidratación.',
    vineta:'Niño de 2 años, 2 días de diarrea acuosa y vómitos. Bebe con avidez, ojos algo hundidos, orina disminuida. Sin sangre en deposiciones.',
    etapas:[
      segInicial(false),
      { comp:'Anamnesis', tipo:'multi', instruccion:'Anamnesis dirigida.', opciones:[
        { id:'a1', texto:'Ingesta de líquidos y diuresis (n° pañales)', tipo:'clave', puntos:3, critico:true, resp:'"Bebe con ganas; orina menos que ayer."', fb:'Balance hídrico clave para clasificar y manejar.' },
        { id:'a2', texto:'Frecuencia y características de diarrea y vómitos', tipo:'clave', puntos:2, resp:'"Muchas cámaras acuosas, vómitos ocasionales."', fb:'Cuantifica pérdidas.' },
        { id:'a3', texto:'Sangre/mucosidad en deposiciones y fiebre', tipo:'util', puntos:1, resp:'"Sin sangre; febrícula."', fb:'Orienta a etiología (disentería).' },
        { id:'a4', texto:'Tiempo de evolución y contactos', tipo:'util', puntos:1, resp:'"2 días; hay más niños con lo mismo."', fb:'Contexto epidemiológico.' },
      ]},
      { comp:'Examen físico', tipo:'multi', instruccion:'Evaluación de hidratación.', opciones:[
        { id:'e1', texto:'Estado mental y sed', tipo:'clave', puntos:2, resp:'Alerta, bebe con avidez (sed aumentada).', fb:'Parámetros del score de deshidratación.' },
        { id:'e2', texto:'Mucosas, ojos, signo del pliegue y perfusión (llene capilar)', tipo:'clave', puntos:3, critico:true, resp:'Mucosas secas, ojos hundidos, pliegue que regresa lento, llene < 2 s.', fb:'Signos objetivos que clasifican la gravedad.' },
        { id:'e3', texto:'Signos vitales y peso', tipo:'clave', puntos:2, resp:'FC 130, afebril; peso registrado.', fb:'El peso guía la reposición y el seguimiento.' },
      ]},
      { comp:'Diagnóstico', tipo:'unica', instruccion:'Clasifique el grado de deshidratación.', opciones:[
        { id:'d1', texto:'Deshidratación leve-moderada (algún grado)', tipo:'clave', puntos:4, resp:'Correcto: alerta, sed, ojos hundidos, pliegue lento.', fb:'Clasificación que indica plan de rehidratación oral supervisada.' },
        { id:'d2', texto:'Sin deshidratación', tipo:'neutro', puntos:0, resp:'Subestima los hallazgos.', fb:'Hay signos objetivos de déficit.' },
        { id:'d3', texto:'Deshidratación grave (shock)', tipo:'peligroso', puntos:-2, resp:'Sobreestima: el niño está alerta y perfunde.', fb:'Llevaría a manejo endovenoso innecesario; reclasificar.' },
      ]},
      { comp:'Manejo y destino', tipo:'multi', instruccion:'Plan de rehidratación.', opciones:[
        { id:'m1', texto:'Sales de rehidratación oral (SRO) supervisada (plan B)', tipo:'clave', puntos:3, critico:true, resp:'Se inicia SRO fraccionada.', fb:'La vía oral es de elección en deshidratación leve-moderada.' },
        { id:'m2', texto:'Reevaluar tolerancia; SNG o EV si fracasa la vía oral', tipo:'clave', puntos:2, resp:'Plan de escalamiento definido.', fb:'Vía alternativa ante vómitos persistentes.' },
        { id:'m3', texto:'Continuar alimentación y aporte de zinc', tipo:'util', puntos:1, resp:'Se mantiene alimentación.', fb:'Reduce duración y recurrencia.' },
        { id:'m4', texto:'Antibióticos y antidiarreicos de rutina', tipo:'peligroso', puntos:-2, resp:'No indicados de rutina.', fb:'Los antidiarreicos son peligrosos en niños; antibióticos solo en casos seleccionados.' },
        destino('Observación con SRO; hospitalizar si fracasa la vía oral o progresa a grave','Definir observación vs hospitalización según respuesta.'),
      ]},
      cierre([
        { id:'z5', texto:'Enseñar técnica de SRO y signos de alarma de deshidratación', tipo:'clave', puntos:1, resp:'Se educa a la madre.', fb:'Continuidad del manejo en el hogar.' },
      ]),
    ],
    aprobacion:{ minPct:60, requiereDx:true },
  },

  /* ========== 5 · OBS-GINE — Sangrado del primer trimestre ========== */
  {
    id:'gin-sangrado-1t', area:'gineco', titulo:'Sangrado del primer trimestre', nivel:'Médico general', minutos:8,
    motivo:'Mujer de 29 años, 8 semanas de amenorrea, con dolor pélvico y sangrado.',
    puerta:'Mujer de 29 años, ocho semanas de amenorrea, dolor pélvico y sangrado. Evalúe y defina conducta.',
    criterios:['Estabilidad hemodinámica','Cantidad del sangrado','Dolor lateralizado y síncope','Factores de riesgo de embarazo ectópico','Estudio y derivación urgente'],
    briefing:'Urgencia. Toda mujer en edad fértil con dolor y sangrado es un embarazo ectópico hasta demostrar lo contrario. Priorice la estabilidad.',
    vineta:'Mujer de 29 años, 8 semanas de amenorrea. Dolor pélvico derecho y sangrado vaginal moderado. Refiere mareo al ponerse de pie.',
    etapas:[
      segInicial(true),
      { comp:'Anamnesis', tipo:'multi', instruccion:'Anamnesis dirigida.', opciones:[
        { id:'a1', texto:'Cuantía del sangrado, dolor lateralizado, síncope/dolor de hombro', tipo:'clave', puntos:3, critico:true, resp:'"Sangrado moderado, dolor a la derecha, me mareo al pararme."', fb:'Dolor lateralizado + síncope sugieren ectópico complicado.' },
        { id:'a2', texto:'FUR y confirmar test de embarazo previo', tipo:'clave', puntos:2, resp:'"8 semanas de atraso, test casero positivo."', fb:'Confirma el embarazo y la edad gestacional.' },
        { id:'a3', texto:'Factores de riesgo de ectópico (DIU, ITS/PIP, cirugía tubaria previa)', tipo:'clave', puntos:2, resp:'"Tuve una infección pélvica hace años."', fb:'Aumentan la probabilidad de ectópico.' },
        { id:'a4', texto:'Antecedentes obstétricos y grupo/Rh', tipo:'util', puntos:1, resp:'"Un embarazo previo; no sé mi grupo."', fb:'Relevante para profilaxis anti-D.' },
      ]},
      { comp:'Examen físico', tipo:'multi', instruccion:'Examen dirigido.', opciones:[
        { id:'e1', texto:'Signos vitales y evaluación de estabilidad hemodinámica', tipo:'clave', puntos:3, critico:true, resp:'PA 100/62, FC 108, palidez leve.', fb:'Detectar shock incipiente cambia toda la conducta.' },
        { id:'e2', texto:'Examen abdominal (dolor, irritación peritoneal)', tipo:'clave', puntos:2, resp:'Dolor en fosa ilíaca derecha, defensa leve.', fb:'Signos de abdomen agudo/hemoperitoneo.' },
        { id:'e3', texto:'Especuloscopía (origen y cuantía del sangrado, cuello)', tipo:'util', puntos:1, resp:'Sangrado por OCE, cuello cerrado.', fb:'Evalúa el origen del sangrado.' },
      ]},
      { comp:'Exámenes e interpretación', tipo:'multi', instruccion:'Estudio inicial.', opciones:[
        { id:'x1', texto:'β-hCG cuantitativa', tipo:'clave', puntos:2, critico:true, resp:'β-hCG positiva.', fb:'Confirma embarazo; se correlaciona con la eco.' },
        { id:'x2', texto:'Ecografía transvaginal', tipo:'clave', puntos:2, resp:'Útero sin saco intrauterino; masa anexial derecha.', fb:'Ausencia de saco intrauterino con β-hCG alta sugiere ectópico.' },
        { id:'x3', texto:'Hemograma y grupo/Rh', tipo:'util', puntos:1, resp:'Hb 10,8; Rh negativo.', fb:'Anemia y necesidad de profilaxis anti-D.' },
      ]},
      { comp:'Diagnóstico', tipo:'unica', instruccion:'Sospecha diagnóstica.', opciones:[
        { id:'d1', texto:'Sospecha de embarazo ectópico', tipo:'clave', puntos:4, resp:'Correcto.', fb:'Dolor lateralizado, sangrado, ausencia de saco intrauterino y masa anexial.' },
        { id:'d2', texto:'Aborto espontáneo simple, dar de alta', tipo:'peligroso', puntos:-3, resp:'Incorrecto y peligroso.', fb:'No se descarta ectópico: riesgo de rotura y muerte.' },
        { id:'d3', texto:'Sangrado por implantación, sin estudio', tipo:'peligroso', puntos:-2, resp:'Minimiza un cuadro potencialmente letal.', fb:'Requiere estudio y observación.' },
      ]},
      { comp:'Manejo y destino', tipo:'multi', instruccion:'Conducta.', opciones:[
        { id:'m1', texto:'Vía venosa, volumen y preparar para eventual reanimación', tipo:'clave', puntos:2, resp:'Se instala vía y se repone volumen.', fb:'Anticipar la inestabilidad.' },
        { id:'m2', texto:'Profilaxis anti-D si Rh negativa', tipo:'util', puntos:1, resp:'Se indica según protocolo.', fb:'Prevención de isoinmunización.' },
        { id:'m3', texto:'Dar de alta con control en policlínico en 1 semana', tipo:'peligroso', puntos:-4, critico:true, resp:'Conducta insegura.', fb:'No se puede dar de alta un ectópico no descartado.' },
        destino('Derivación urgente a ginecología/obstetricia con eco','El médico general estabiliza y deriva sin demora.'),
      ]},
      cierre(),
    ],
    aprobacion:{ minPct:60, requiereDx:true },
  },

  /* ========== 6 · OBS-GINE — Preeclampsia ========== */
  {
    id:'gin-preeclampsia', area:'gineco', titulo:'Preeclampsia', nivel:'Médico general', minutos:8,
    motivo:'Embarazada de 34 semanas con cefalea intensa y visión borrosa.',
    puerta:'Embarazada de 34 semanas con cefalea intensa y visión borrosa. Evalúe y defina conducta.',
    criterios:['Presión arterial','Síntomas neurológicos y epigastralgia','Movimientos fetales','Reconocer emergencia obstétrica','Hospitalización y evaluación materno-fetal'],
    briefing:'Urgencia maternal. Reconozca la emergencia obstétrica, inicie manejo y defina destino.',
    vineta:'Primigesta de 29 años, 34 semanas. Cefalea intensa, fotopsias y edema de manos y cara. PA elevada al ingreso.',
    etapas:[
      segInicial(true),
      { comp:'Anamnesis', tipo:'multi', instruccion:'Anamnesis dirigida.', opciones:[
        { id:'a1', texto:'Síntomas premonitorios: cefalea, fotopsias, tinnitus, epigastralgia', tipo:'clave', puntos:3, critico:true, resp:'"Cefalea intensa, veo lucecitas y me duele la boca del estómago."', fb:'Definen crisis y severidad.' },
        { id:'a2', texto:'Percepción de movimientos fetales', tipo:'clave', puntos:2, resp:'"Se mueve, pero menos que ayer."', fb:'Bienestar fetal.' },
        { id:'a3', texto:'Edad gestacional confiable y controles previos', tipo:'clave', puntos:2, resp:'"34 semanas por eco precoz; presión siempre normal."', fb:'La EG determina la conducta obstétrica.' },
        { id:'a4', texto:'Pérdida de líquido, sangrado o dinámica uterina', tipo:'util', puntos:1, resp:'"No he perdido líquido ni sangre."', fb:'Descarta RPM/DPPNI/trabajo de parto.' },
      ]},
      { comp:'Examen físico', tipo:'multi', instruccion:'Examen dirigido.', opciones:[
        { id:'e1', texto:'Medición correcta y repetida de la PA', tipo:'clave', puntos:3, critico:true, resp:'PA 168/112 confirmada.', fb:'PA ≥ 160/110 confirma rango severo.' },
        { id:'e2', texto:'Reflejos y búsqueda de clonus', tipo:'clave', puntos:2, resp:'ROT exaltados, clonus presente.', fb:'Advierte riesgo de eclampsia.' },
        { id:'e3', texto:'Altura uterina y latidos cardiofetales', tipo:'clave', puntos:2, resp:'AU acorde; LCF 148.', fb:'Evaluación básica del bienestar fetal.' },
        { id:'e4', texto:'Edema y examen pulmonar', tipo:'util', puntos:1, resp:'Edema de cara/manos; pulmones limpios.', fb:'Evalúa compromiso y edema pulmonar.' },
      ]},
      { comp:'Exámenes e interpretación', tipo:'multi', instruccion:'Exámenes.', opciones:[
        { id:'x1', texto:'Laboratorio: plaquetas, pruebas hepáticas, creatinina, LDH', tipo:'clave', puntos:3, critico:true, resp:'Plaquetas 95.000, transaminasas altas, LDH alta.', fb:'Buscan severidad / HELLP.' },
        { id:'x2', texto:'Proteinuria', tipo:'clave', puntos:2, resp:'Proteinuria (+++).', fb:'Apoya el diagnóstico.' },
        { id:'x3', texto:'Monitorización fetal / ecografía', tipo:'clave', puntos:2, resp:'RBNE reactivo por ahora.', fb:'Evalúa bienestar fetal.' },
      ]},
      { comp:'Diagnóstico', tipo:'unica', instruccion:'Diagnóstico.', opciones:[
        { id:'d1', texto:'Preeclampsia con criterios de severidad', tipo:'clave', puntos:4, resp:'Correcto (con sospecha de HELLP).', fb:'PA ≥160/110, síntomas y laboratorio alterado.' },
        { id:'d2', texto:'Cefalea tensional', tipo:'peligroso', puntos:-3, resp:'Incorrecto y peligroso.', fb:'Ignora una emergencia obstétrica.' },
        { id:'d3', texto:'Hipertensión gestacional sin severidad', tipo:'peligroso', puntos:-2, resp:'Incorrecto: hay criterios de severidad.', fb:'Subestima la gravedad.' },
      ]},
      { comp:'Manejo y destino', tipo:'multi', instruccion:'Conducta inicial.', opciones:[
        { id:'m1', texto:'Sulfato de magnesio (prevención de eclampsia)', tipo:'clave', puntos:3, critico:true, resp:'Se inicia sulfato de magnesio.', fb:'Profilaxis/tratamiento de convulsiones.' },
        { id:'m2', texto:'Antihipertensivos para PA severa (labetalol/hidralazina/nifedipino)', tipo:'clave', puntos:3, critico:true, resp:'Se maneja la crisis hipertensiva.', fb:'Reduce el riesgo de ACV materno.' },
        { id:'m3', texto:'Corticoides para maduración pulmonar fetal (34 sem)', tipo:'util', puntos:2, resp:'Según protocolo.', fb:'Considerar por prematurez.' },
        { id:'m4', texto:'Enviar a casa con reposo y control ambulatorio', tipo:'peligroso', puntos:-4, critico:true, resp:'Conducta insegura.', fb:'La preeclampsia severa no se maneja ambulatoriamente.' },
        destino('Hospitalización en unidad de alto riesgo; evaluación materno-fetal e interrupción según condición','El tratamiento definitivo es la interrupción; se coordina con el equipo.'),
      ]},
      cierre(),
    ],
    aprobacion:{ minPct:60, requiereDx:true },
  },

  /* ========== 7 · CIRUGÍA — Abdomen agudo ========== */
  {
    id:'cir-abdomen-agudo', area:'cirugia', titulo:'Abdomen agudo', nivel:'Médico general', minutos:8,
    motivo:'Hombre de 37 años con dolor abdominal de 18 horas.',
    puerta:'Hombre de 37 años con dolor abdominal de 18 horas. Realice anamnesis y examen, plantee diagnóstico y conducta.',
    criterios:['Cronología y migración del dolor','Vómitos, fiebre y tránsito','Examen abdominal sistemático','Irritación peritoneal','Ayuno, analgesia y evaluación quirúrgica'],
    briefing:'Urgencia. Distinga el abdomen quirúrgico y defina la conducta.',
    vineta:'Hombre de 37 años, sano. Dolor abdominal de 18 h, inicialmente periumbilical, ahora en fosa ilíaca derecha, con náuseas y anorexia.',
    etapas:[
      segInicial(false),
      { comp:'Anamnesis', tipo:'multi', instruccion:'Anamnesis dirigida.', opciones:[
        { id:'a1', texto:'Cronología y migración del dolor (periumbilical → FID)', tipo:'clave', puntos:3, critico:true, resp:'"Empezó en el ombligo y se corrió a la derecha abajo."', fb:'La migración es el dato de mayor valor.' },
        { id:'a2', texto:'Anorexia, náuseas, vómitos y tránsito intestinal', tipo:'clave', puntos:2, resp:'"Sin apetito, náuseas, hoy no obro."', fb:'Apoyan el cuadro apendicular.' },
        { id:'a3', texto:'Fiebre/calofríos', tipo:'util', puntos:1, resp:'"Me sentí afiebrado."', fb:'La febrícula es frecuente.' },
        { id:'a4', texto:'Síntomas urinarios', tipo:'util', puntos:1, resp:'"No, sin ardor."', fb:'Diferencial urológico.' },
        { id:'a5', texto:'Antecedentes quirúrgicos, alergias, última ingesta', tipo:'util', puntos:1, resp:'"Nunca operado, sin alergias."', fb:'Necesarios antes de eventual cirugía.' },
      ]},
      { comp:'Examen físico', tipo:'multi', instruccion:'Examen abdominal sistemático.', opciones:[
        { id:'e1', texto:'Signos vitales (incluye temperatura)', tipo:'clave', puntos:2, resp:'PA 124/76, FC 96, T° 37,9°.', fb:'Orienta gravedad y respuesta inflamatoria.' },
        { id:'e2', texto:'Palpación buscando dolor en McBurney', tipo:'clave', puntos:3, critico:true, resp:'Dolor máximo en punto de McBurney.', fb:'Hallazgo cardinal.' },
        { id:'e3', texto:'Signos de irritación peritoneal (Blumberg, defensa)', tipo:'clave', puntos:3, resp:'Blumberg (+), resistencia localizada.', fb:'Define el abdomen quirúrgico.' },
        { id:'e4', texto:'Signos de Rovsing/psoas/obturador', tipo:'util', puntos:2, resp:'Rovsing (+), psoas (+).', fb:'Aumentan la probabilidad.' },
      ]},
      { comp:'Exámenes e interpretación', tipo:'multi', instruccion:'Exámenes iniciales.', opciones:[
        { id:'x1', texto:'Hemograma + PCR', tipo:'clave', puntos:2, resp:'Leucocitos 14.500 con desviación izquierda; PCR 62.', fb:'Apoya el proceso inflamatorio.' },
        { id:'x2', texto:'Imagen (eco/TC según disponibilidad)', tipo:'clave', puntos:2, resp:'Apéndice engrosado no compresible con líquido periapendicular.', fb:'Confirma en casos dudosos.' },
        { id:'x3', texto:'Sedimento de orina', tipo:'util', puntos:1, resp:'Orina normal.', fb:'Descarta causa urológica.' },
        { id:'x4', texto:'Colonoscopía de urgencia', tipo:'peligroso', puntos:-2, resp:'No indicada; retrasa el manejo.', fb:'Sin rol en el abdomen agudo apendicular.' },
      ]},
      { comp:'Diagnóstico', tipo:'unica', instruccion:'Diagnóstico más probable.', opciones:[
        { id:'d1', texto:'Apendicitis aguda', tipo:'clave', puntos:4, resp:'Correcto.', fb:'Migración, McBurney (+), irritación peritoneal.' },
        { id:'d2', texto:'Gastroenteritis aguda', tipo:'peligroso', puntos:-2, resp:'No explica el dolor localizado con irritación.', fb:'Subestima un abdomen quirúrgico.' },
        { id:'d3', texto:'Cólico renal derecho', tipo:'neutro', puntos:0, resp:'Menos probable con orina normal.', fb:'Diferencial descartado.' },
      ]},
      { comp:'Manejo y destino', tipo:'multi', instruccion:'Conducta.', opciones:[
        { id:'m1', texto:'Régimen cero + hidratación EV', tipo:'clave', puntos:2, resp:'Ayuno e hidratación.', fb:'Preparación prequirúrgica.' },
        { id:'m2', texto:'Analgesia EV', tipo:'clave', puntos:2, resp:'Se administra analgesia.', fb:'La analgesia no enmascara el diagnóstico; debe indicarse.' },
        { id:'m3', texto:'Antibióticos EV según protocolo', tipo:'util', puntos:1, resp:'Se inician.', fb:'Perioperatorios.' },
        { id:'m4', texto:'Alta con analgésicos orales y control en 48 h', tipo:'peligroso', puntos:-4, critico:true, resp:'Riesgo de perforación y peritonitis.', fb:'Dar de alta un abdomen quirúrgico es un error grave.' },
        destino('Evaluación quirúrgica urgente (apendicectomía)','La resolución es quirúrgica; derivar a cirugía sin demora.'),
      ]},
      cierre(),
    ],
    aprobacion:{ minPct:60, requiereDx:true },
  },

  /* ========== 8 · CIRUGÍA — Politrauma (ABCDE) ========== */
  {
    id:'cir-politrauma', area:'cirugia', titulo:'Politrauma (manejo ABCDE)', nivel:'Médico general', minutos:8,
    motivo:'Paciente de 28 años confuso y taquicárdico tras colisión.',
    puerta:'Paciente de 28 años confuso, taquicárdico y con dolor torácico tras una colisión. Realice el manejo inicial.',
    criterios:['Pedir ayuda','A con protección cervical','B ventilación y tórax','C perfusión y hemorragia','D/E y reevaluación continua'],
    briefing:'Reanimación. Aplique ABCDE de forma secuencial; no haga anamnesis extensa antes de estabilizar.',
    vineta:'Hombre de 28 años tras colisión a alta velocidad. Confuso, taquicárdico, dolor torácico y abdominal. Palidez y sudoración.',
    etapas:[
      { comp:'Seguridad inicial', tipo:'multi', instruccion:'Preparación de la reanimación.', opciones:[
        { id:'s1', texto:'Pedir ayuda / activar equipo de trauma', tipo:'clave', puntos:3, critico:true, resp:'Se activa el equipo.', fb:'El politrauma se maneja en equipo; pedir ayuda es prioritario.' },
        { id:'s2', texto:'Equipo de protección personal y seguridad de la escena', tipo:'util', puntos:1, resp:'Se coloca EPP.', fb:'Autoprotección del equipo.' },
        { id:'s3', texto:'Iniciar anamnesis detallada antes de evaluar el ABCDE', tipo:'peligroso', puntos:-2, resp:'Retrasa la estabilización.', fb:'Primero ABCDE; la historia (AMPLIA) va después.' },
      ]},
      { comp:'Examen físico', tipo:'multi', instruccion:'A — Vía aérea con control cervical.', opciones:[
        { id:'a1', texto:'Evaluar/permeabilizar vía aérea con inmovilización cervical', tipo:'clave', puntos:3, critico:true, resp:'Vía aérea permeable; collar cervical.', fb:'A siempre con protección de la columna cervical.' },
        { id:'a2', texto:'Aspirar secreciones / retirar cuerpos extraños si obstruyen', tipo:'util', puntos:1, resp:'Se despeja la vía aérea.', fb:'Asegura la permeabilidad.' },
      ]},
      { comp:'Examen físico', tipo:'multi', instruccion:'B — Ventilación y tórax.', opciones:[
        { id:'b1', texto:'Oxígeno, evaluar expansión y descartar neumotórax a tensión', tipo:'clave', puntos:3, critico:true, resp:'MP disminuido a derecha; se descomprime.', fb:'El neumotórax a tensión es una causa reversible de shock.' },
        { id:'b2', texto:'Saturometría y frecuencia respiratoria', tipo:'util', puntos:1, resp:'SatO₂ 92%, FR 28.', fb:'Monitoriza la ventilación.' },
      ]},
      { comp:'Examen físico', tipo:'multi', instruccion:'C — Circulación y hemorragia.', opciones:[
        { id:'c1', texto:'Control de hemorragias + 2 vías gruesas + reposición', tipo:'clave', puntos:3, critico:true, resp:'Se controla el sangrado y se repone volumen.', fb:'Detener la hemorragia y reponer es prioritario en el shock.' },
        { id:'c2', texto:'Evaluar perfusión (pulso, llene capilar, PA)', tipo:'clave', puntos:2, resp:'FC 130, PA 90/60, llene lento.', fb:'Estima la magnitud del shock.' },
        { id:'c3', texto:'Solicitar grupo/Rh y activar protocolo de transfusión si procede', tipo:'util', puntos:1, resp:'Se solicita sangre.', fb:'Anticipa la reposición de hemoderivados.' },
      ]},
      { comp:'Examen físico', tipo:'multi', instruccion:'D/E — Neurológico y exposición.', opciones:[
        { id:'de1', texto:'Glasgow, pupilas y glicemia (D)', tipo:'clave', puntos:2, resp:'GCS 13, pupilas iguales.', fb:'Evalúa el compromiso neurológico.' },
        { id:'de2', texto:'Exposición completa evitando hipotermia (E)', tipo:'clave', puntos:2, resp:'Se expone y se abriga.', fb:'Buscar lesiones ocultas sin enfriar al paciente.' },
        { id:'de3', texto:'Reevaluación continua del ABCDE', tipo:'clave', puntos:1, resp:'Se reevalúa.', fb:'El ABCDE es dinámico.' },
      ]},
      { comp:'Exámenes e interpretación', tipo:'multi', instruccion:'Apoyo diagnóstico dirigido.', opciones:[
        { id:'x1', texto:'FAST y radiografías dirigidas (tórax/pelvis) en la reanimación', tipo:'clave', puntos:2, resp:'FAST con líquido libre.', fb:'Estudios rápidos junto a la cama en el paciente inestable.' },
        { id:'x2', texto:'Enviar al TC a un paciente inestable', tipo:'peligroso', puntos:-3, critico:true, resp:'Riesgo de deterioro fuera de la reanimación.', fb:'El inestable NO va al TC: se estabiliza/deriva a pabellón.' },
      ]},
      { comp:'Diagnóstico', tipo:'unica', instruccion:'Impresión diagnóstica.', opciones:[
        { id:'d1', texto:'Politraumatizado con shock hipovolémico', tipo:'clave', puntos:3, resp:'Correcto.', fb:'Taquicardia, hipotensión, FAST (+): hemorragia interna.' },
        { id:'d2', texto:'Crisis de ansiedad post-accidente', tipo:'peligroso', puntos:-3, resp:'Incorrecto y peligroso.', fb:'Ignora un shock hemorrágico.' },
      ]},
      { comp:'Manejo y destino', tipo:'multi', instruccion:'Conducta.', opciones:[
        { id:'m1', texto:'Reanimación continua y control del sangrado', tipo:'clave', puntos:2, resp:'Se mantiene la reanimación.', fb:'Prioridad sobre estudios electivos.' },
        destino('Traslado urgente a pabellón / centro de trauma','El médico general estabiliza y deriva a resolución quirúrgica.'),
      ]},
      cierre([
        { id:'z5', texto:'Informar a la familia con lenguaje claro y contención', tipo:'util', puntos:1, resp:'Se informa.', fb:'Comunicación en contexto crítico.' },
      ]),
    ],
    aprobacion:{ minPct:60, requiereDx:true },
  },

  /* ========== 9 · CIRUGÍA/UROLOGÍA — Retención urinaria y sondaje ========== */
  {
    id:'cir-retencion-sondaje', area:'cirugia', titulo:'Retención urinaria aguda y sondaje', nivel:'Médico general', minutos:8,
    motivo:'Varón de 72 años con imposibilidad para orinar y dolor hipogástrico.',
    puerta:'Varón de 72 años con imposibilidad para orinar y dolor hipogástrico. Evalúe y realice el manejo (incluye procedimiento).',
    criterios:['Confirmar la retención','Descartar trauma uretral','Consentimiento y asepsia','No forzar ante resistencia','Registrar volumen y complicaciones'],
    briefing:'Estación con procedimiento. Confirme la retención, descarte contraindicaciones y realice el sondaje con técnica segura.',
    vineta:'Varón de 72 años, con síntomas prostáticos previos. Hace horas no puede orinar, con dolor y distensión hipogástrica. Sin antecedente de trauma.',
    etapas:[
      segInicial(false),
      { comp:'Anamnesis', tipo:'multi', instruccion:'Anamnesis dirigida.', opciones:[
        { id:'a1', texto:'Tiempo sin orinar, dolor y episodios previos', tipo:'clave', puntos:2, resp:'"Llevo horas sin poder orinar, con mucho dolor."', fb:'Caracteriza la retención aguda.' },
        { id:'a2', texto:'Síntomas prostáticos, fármacos (anticolinérgicos), cirugías', tipo:'clave', puntos:2, resp:'"Orino con dificultad hace tiempo; tomé un antigripal."', fb:'Causas frecuentes: HPB y fármacos.' },
        { id:'a3', texto:'Hematuria, uretrorragia o antecedente de trauma pélvico', tipo:'clave', puntos:2, critico:true, resp:'"No he tenido golpes ni sangre por el pene."', fb:'La uretrorragia/trauma contraindica el sondaje ciego.' },
        { id:'a4', texto:'Fiebre y calofríos', tipo:'util', puntos:1, resp:'"Sin fiebre."', fb:'Descarta foco infeccioso/obstrucción séptica.' },
      ]},
      { comp:'Examen físico', tipo:'multi', instruccion:'Examen dirigido.', opciones:[
        { id:'e1', texto:'Palpar/percutir globo vesical (confirmar retención)', tipo:'clave', puntos:3, critico:true, resp:'Globo vesical palpable, matidez y dolor hipogástrico.', fb:'Confirma la retención antes de sondar.' },
        { id:'e2', texto:'Inspección del meato buscando sangre (trauma uretral)', tipo:'clave', puntos:3, critico:true, resp:'Sin sangre en el meato.', fb:'La sangre en el meato contraindica el sondaje uretral.' },
        { id:'e3', texto:'Tacto rectal (próstata)', tipo:'util', puntos:1, resp:'Próstata aumentada, lisa.', fb:'Orienta a HPB.' },
        { id:'e4', texto:'Signos vitales', tipo:'util', puntos:1, resp:'Estables.', fb:'Evalúa repercusión.' },
      ]},
      { comp:'Procedimiento', tipo:'multi', instruccion:'Sondaje vesical: técnica segura.', opciones:[
        { id:'p1', texto:'Explicar el procedimiento y obtener consentimiento', tipo:'clave', puntos:2, critico:true, resp:'El paciente consiente.', fb:'Consentimiento obligatorio antes del procedimiento.' },
        { id:'p2', texto:'Asepsia, técnica estéril y lubricación', tipo:'clave', puntos:3, critico:true, resp:'Se prepara campo estéril y se lubrica.', fb:'Previene infección y lesión uretral.' },
        { id:'p3', texto:'Avanzar sin forzar; detenerse ante resistencia', tipo:'clave', puntos:3, critico:true, resp:'Se avanza suavemente; buen flujo de orina.', fb:'Nunca forzar: riesgo de falsa vía y lesión.' },
        { id:'p4', texto:'Inflar el balón solo tras confirmar retorno de orina', tipo:'clave', puntos:2, resp:'Se infla el balón con la sonda en vejiga.', fb:'Inflar en la uretra causa lesión grave.' },
        { id:'p5', texto:'Registrar el volumen drenado y vigilar complicaciones', tipo:'clave', puntos:2, resp:'Se drenan 900 mL; se registra.', fb:'Documentar el volumen y vigilar hematuria/poliuria post-obstructiva.' },
        { id:'p6', texto:'Forzar la sonda para vencer la resistencia prostática', tipo:'peligroso', puntos:-4, critico:true, resp:'Provoca falsa vía y uretrorragia.', fb:'Forzar es un error grave: derivar a urología si no progresa.' },
      ]},
      { comp:'Diagnóstico', tipo:'unica', instruccion:'Diagnóstico.', opciones:[
        { id:'d1', texto:'Retención urinaria aguda (probable por HPB)', tipo:'clave', puntos:3, resp:'Correcto.', fb:'Globo vesical + síntomas prostáticos.' },
        { id:'d2', texto:'Anuria por falla renal', tipo:'neutro', puntos:0, resp:'Menos probable con globo vesical palpable.', fb:'La anuria no distiende la vejiga.' },
      ]},
      { comp:'Manejo y destino', tipo:'multi', instruccion:'Conducta posterior.', opciones:[
        { id:'m1', texto:'Descompresión y vigilar hematuria ex vacuo / poliuria post-obstructiva', tipo:'clave', puntos:2, resp:'Se vigila.', fb:'Complicaciones tras el vaciamiento.' },
        { id:'m2', texto:'Iniciar/ajustar tratamiento de HPB y control', tipo:'util', puntos:1, resp:'Se indica manejo.', fb:'Aborda la causa.' },
        destino('Manejo ambulatorio con sonda y derivación a urología (o derivar si no se logró sondar)','Definir seguimiento urológico; derivar si el sondaje falla.'),
      ]},
      cierre(),
    ],
    aprobacion:{ minPct:60, requiereDx:false },
  },

  /* ========== 10 · TRANSVERSAL — Comunicación de diagnóstico grave ========== */
  {
    id:'tx-malas-noticias', area:'transversal', titulo:'Comunicación de un diagnóstico grave', nivel:'Médico general', minutos:8,
    motivo:'Entregar información de una probable enfermedad grave.',
    puerta:'Explique a un paciente que los resultados sugieren una enfermedad grave y que requiere estudio especializado.',
    criterios:['Privacidad','Explorar cuánto sabe','Advertir información difícil','Frases breves y empatía','Plan concreto y verificación de comprensión'],
    briefing:'Estación de comunicación (tipo SPIKES). No es una estación de diagnóstico: se evalúa cómo comunica y contiene.',
    vineta:'Paciente de 55 años acude por resultados. La imagen sugiere una lesión probablemente maligna que requiere biopsia y evaluación por especialista.',
    etapas:[
      { comp:'Seguridad inicial', tipo:'multi', instruccion:'Preparar el entorno (S — Setting).', opciones:[
        { id:'s1', texto:'Asegurar privacidad y un lugar tranquilo, sin interrupciones', tipo:'clave', puntos:3, critico:true, resp:'Se busca un espacio privado.', fb:'La privacidad es esencial para dar malas noticias.' },
        { id:'s2', texto:'Presentarse, sentarse y disponer del tiempo necesario', tipo:'clave', puntos:2, resp:'Se sienta a la altura del paciente.', fb:'El lenguaje no verbal comunica respeto.' },
        { id:'s3', texto:'Ofrecer que acompañe alguien de confianza si lo desea', tipo:'util', puntos:1, resp:'Se ofrece acompañamiento.', fb:'Red de apoyo.' },
      ]},
      { comp:'Comunicación y cierre', tipo:'multi', instruccion:'Explorar y advertir (P/I/W).', opciones:[
        { id:'c1', texto:'Explorar qué sabe y qué quiere saber el paciente', tipo:'clave', puntos:3, critico:true, resp:'"Cuénteme qué le han explicado hasta ahora."', fb:'Adecuar la información al punto de partida del paciente.' },
        { id:'c2', texto:'Dar un aviso previo ("tengo información difícil que compartir")', tipo:'clave', puntos:2, resp:'Se anticipa la noticia.', fb:'El "warning shot" prepara emocionalmente.' },
        { id:'c3', texto:'Soltar el diagnóstico de golpe, con tecnicismos', tipo:'peligroso', puntos:-3, critico:true, resp:'Genera shock y daño.', fb:'Comunicar bruscamente un diagnóstico grave es un error crítico.' },
        { id:'c4', texto:'Dar falsas garantías ("no es nada, quédese tranquilo")', tipo:'peligroso', puntos:-2, resp:'Falta a la honestidad.', fb:'Las falsas garantías rompen la confianza.' },
      ]},
      { comp:'Comunicación y cierre', tipo:'multi', instruccion:'Informar, acoger y planificar (K/E/S).', opciones:[
        { id:'k1', texto:'Informar en frases breves, con lenguaje simple y pausas', tipo:'clave', puntos:2, resp:'Se informa con claridad y calma.', fb:'La dosificación de la información facilita la comprensión.' },
        { id:'k2', texto:'Permitir silencios y acoger la emoción con empatía', tipo:'clave', puntos:2, resp:'Se acompaña la reacción.', fb:'Responder a la emoción antes que seguir informando.' },
        { id:'k3', texto:'Entregar un plan concreto (biopsia, derivación, plazos, contacto)', tipo:'clave', puntos:3, critico:true, resp:'Se define el siguiente paso.', fb:'Un plan concreto reduce la incertidumbre.' },
        { id:'k4', texto:'Verificar comprensión y ofrecer apoyo/seguimiento', tipo:'clave', puntos:2, critico:true, resp:'Se confirma comprensión.', fb:'Cerrar el ciclo y asegurar continuidad.' },
        { id:'k5', texto:'Responder dudas y dejar espacio para preguntas', tipo:'util', puntos:1, resp:'Se responden dudas.', fb:'Autonomía del paciente.' },
      ]},
    ],
    aprobacion:{ minPct:65, requiereDx:false },
  },

];
