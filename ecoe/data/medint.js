/* ECOE — Estaciones · Medicina Interna
   Ver data/00-core.js para el modelo de datos y el estado de validación. */
ESTACIONES.push(
  /* ========== 1 · MEDICINA INTERNA — Dolor torácico ========== */
  {
    id:'mi-dolor-toracico', area:'medint', titulo:'Dolor torácico agudo', nivel:'Médico general', minutos:8,
    fuentes:['minsal_ges','acls','eunacom_perfil'],
    revisionEstructura:'2026-08-02',
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
    fuentes:['minsal_ges','eunacom_perfil'],
    revisionEstructura:'2026-08-02',
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
);
