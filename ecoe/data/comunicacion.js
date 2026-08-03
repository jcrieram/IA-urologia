/* ECOE — Estaciones de comunicación y consejería
   Agrupadas por TIPO de estación, no por área: cada una declara su área
   (Medicina Interna o Cirugía) entre las 4 áreas del EUNACOM.
   Ver data/00-core.js para el modelo de datos y el estado de validación. */
ESTACIONES.push(
  /* ========== MEDICINA INTERNA — Comunicación de un diagnóstico grave ========== */
  {
    id:'mi-malas-noticias', area:'medint', titulo:'Comunicación de un diagnóstico grave', nivel:'Médico general', minutos:8,
    revisionEstructura:'2026-08-03',
    fuentes:['eunacom_perfil','eunacom_sp'],
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

  /* ========== CIRUGÍA — Paciente enojado / reclamo en urgencia ========== */
  {
    id:'cir-paciente-enojado', area:'cirugia', titulo:'Paciente enojado o reclamo por la atención', nivel:'Médico general', minutos:8,
    revisionEstructura:'2026-08-03',
    fuentes:['eunacom_perfil','eunacom_sp'],
    motivo:'Paciente molesto por una espera prolongada y por sentirse mal atendido.',
    puerta:'Un paciente reclama airadamente por la demora y por la atención recibida. Maneje la situación.',
    criterios:['Mantener la calma y la seguridad','Escuchar sin interrumpir','Validar la emoción sin admitir culpas falsas','Explicar y ofrecer solución concreta','Registrar y canalizar el reclamo'],
    briefing:'Estación de comunicación difícil. No se evalúa diagnóstico: se evalúa cómo contiene, escucha y resuelve.',
    vineta:'Paciente de 48 años lleva más de tres horas esperando. Alza la voz, dice que "aquí no le importa a nadie" y exige ser atendido de inmediato.',
    etapas:[
      { comp:'Seguridad inicial', tipo:'multi', instruccion:'Apertura y seguridad de la situación.', opciones:[
        { id:'s1', texto:'Mantener la calma, tono pausado y lenguaje corporal abierto', tipo:'clave', puntos:3, critico:true, resp:'El paciente baja levemente la voz.', fb:'La regulación del propio afecto es lo que desescala el conflicto.' },
        { id:'s2', texto:'Buscar un espacio privado para conversar', tipo:'clave', puntos:2, resp:'Se traslada la conversación.', fb:'Evita la escalada frente a terceros y protege la confidencialidad.' },
        { id:'s3', texto:'Presentarse e invitar a sentarse', tipo:'util', puntos:1, resp:'Se sientan a conversar.', fb:'Iguala la posición y reduce la tensión.' },
        { id:'s4', texto:'Evaluar riesgo de agresión y pedir apoyo si lo hubiera', tipo:'util', puntos:1, resp:'Sin conducta agresiva física.', fb:'La seguridad del equipo y del paciente es prioritaria.' },
        { id:'s5', texto:'Responder en el mismo tono elevado para poner límites', tipo:'peligroso', puntos:-3, critico:true, resp:'La situación escala.', fb:'Responder con hostilidad rompe el vínculo y agrava el conflicto.' },
      ]},
      { comp:'Comunicación y cierre', tipo:'multi', instruccion:'Escuchar y validar.', opciones:[
        { id:'c1', texto:'Escuchar el reclamo completo sin interrumpir', tipo:'clave', puntos:3, critico:true, resp:'"...y nadie me explicó nada en todo este rato."', fb:'Dejar hablar es la intervención más eficaz al inicio.' },
        { id:'c2', texto:'Validar la emoción ("entiendo que esta espera lo haya molestado")', tipo:'clave', puntos:3, resp:'El paciente se siente escuchado.', fb:'Validar la emoción no equivale a aceptar una acusación.' },
        { id:'c3', texto:'Pedir disculpas por la experiencia y la demora', tipo:'clave', puntos:2, resp:'Se ofrece una disculpa sincera.', fb:'Disculparse por la experiencia es distinto de admitir negligencia.' },
        { id:'c4', texto:'Culpar a otros servicios o al sistema para justificarse', tipo:'peligroso', puntos:-2, resp:'El paciente percibe evasión.', fb:'Trasladar la culpa deteriora la confianza institucional.' },
        { id:'c5', texto:'Minimizar el reclamo ("no es para tanto")', tipo:'peligroso', puntos:-3, critico:true, resp:'El paciente se irrita más.', fb:'Minimizar la vivencia del paciente es un error comunicacional grave.' },
      ]},
      { comp:'Manejo y destino', tipo:'multi', instruccion:'Resolver y canalizar.', opciones:[
        { id:'m1', texto:'Explicar con transparencia qué ocurrió y por qué (criterio de priorización)', tipo:'clave', puntos:2, resp:'Se explica el sistema de categorización.', fb:'La información concreta reduce la sensación de arbitrariedad.' },
        { id:'m2', texto:'Ofrecer una solución concreta y un plazo realista', tipo:'clave', puntos:3, critico:true, resp:'Se acuerda un plan de atención.', fb:'El reclamo se resuelve con acciones, no solo con empatía.' },
        { id:'m3', texto:'Informar la vía formal de reclamo (OIRS) y registrar lo ocurrido', tipo:'clave', puntos:2, resp:'Se orienta sobre el conducto formal.', fb:'Es un derecho del paciente y protege también al profesional.' },
        { id:'m4', texto:'Atender igualmente su motivo de consulta clínico', tipo:'clave', puntos:2, critico:true, resp:'Se procede a la evaluación clínica.', fb:'El conflicto no puede desplazar la evaluación médica que el paciente necesita.' },
        { id:'m5', texto:'Prometer algo que no se puede cumplir para calmarlo', tipo:'peligroso', puntos:-3, resp:'Se generará un nuevo reclamo.', fb:'Las promesas incumplibles agravan el problema.' },
      ]},
      cierre(),
    ],
    oral:[
      { q:'¿Qué hace primero ante un paciente que grita en el box?', modelo:'Regular el propio tono, asegurar un espacio privado, evaluar riesgo y dejarlo expresar el reclamo completo sin interrumpir antes de explicar nada.' },
      { q:'¿Disculparse equivale a reconocer una falta?', modelo:'No. Se puede lamentar sinceramente la experiencia y la espera sin admitir negligencia; son planos distintos y así se registra.' },
      { q:'¿Qué haría si la conducta se torna agresiva o amenazante?', modelo:'Priorizar la seguridad: mantener distancia y vía de salida, solicitar apoyo del equipo/seguridad, no quedarse a solas y dejar registro del episodio.' },
      { q:'¿Cómo cierra la estación?', modelo:'Acuerdo concreto con plazo, información sobre la vía formal de reclamo, atención del motivo clínico y verificación de que el paciente comprendió el plan.' },
    ],
    aprobacion:{ minPct:65, requiereDx:false },
  },

  /* ========== MEDICINA INTERNA — Rechazo de tratamiento ========== */
  {
    id:'mi-rechazo-tratamiento', area:'medint', titulo:'Paciente que rechaza el tratamiento indicado', nivel:'Médico general', minutos:8,
    revisionEstructura:'2026-08-03',
    fuentes:['eunacom_perfil','eunacom_sp'],
    motivo:'Paciente que se niega a una indicación necesaria y quiere retirarse.',
    puerta:'Un paciente rechaza la hospitalización que usted indica y solicita irse de alta. Maneje la situación.',
    criterios:['Explorar el motivo del rechazo','Informar riesgos en lenguaje claro','Evaluar capacidad de decidir','Respetar la autonomía si la decisión es competente','Dejar puerta abierta, registrar y ofrecer alternativas'],
    briefing:'Estación de comunicación difícil y ética. Se evalúa cómo informa, cómo evalúa la capacidad y cómo respeta la autonomía sin abandonar al paciente.',
    vineta:'Paciente de 62 años con un cuadro que usted considera de riesgo y requiere hospitalización. Está lúcido, dice que "en el hospital se muere la gente" y que tiene que cuidar a su madre.',
    etapas:[
      { comp:'Seguridad inicial', tipo:'multi', instruccion:'Apertura de la conversación.', opciones:[
        { id:'s1', texto:'Presentarse, sentarse y asegurar privacidad', tipo:'clave', puntos:2, resp:'Conversan con calma.', fb:'Condiciones mínimas para una decisión informada.' },
        { id:'s2', texto:'Evaluar si hay una condición que altere la conciencia o el juicio', tipo:'clave', puntos:3, critico:true, resp:'Paciente vigil, orientado, sin compromiso de conciencia.', fb:'La capacidad de decidir puede estar alterada por hipoxia, dolor, sepsis o intoxicación.' },
        { id:'s3', texto:'Firmar de inmediato el alta voluntaria para no perder tiempo', tipo:'peligroso', puntos:-4, critico:true, resp:'Se omite el proceso de información y evaluación.', fb:'El alta voluntaria sin informar riesgos ni evaluar capacidad es un error grave.' },
      ]},
      { comp:'Anamnesis', tipo:'multi', instruccion:'Explorar el rechazo.', opciones:[
        { id:'a1', texto:'Preguntar abiertamente por qué no desea hospitalizarse', tipo:'clave', puntos:3, critico:true, resp:'"Tengo que cuidar a mi mamá, no hay nadie más."', fb:'Detrás del rechazo suele haber un problema resoluble, no una negativa absoluta.' },
        { id:'a2', texto:'Explorar miedos y experiencias previas', tipo:'clave', puntos:2, resp:'"A mi hermano lo hospitalizaron y no salió."', fb:'El temor concreto se puede abordar; la etiqueta de "paciente difícil" no.' },
        { id:'a3', texto:'Indagar barreras prácticas (trabajo, cuidado de terceros, dinero)', tipo:'clave', puntos:2, resp:'Se identifica el problema de cuidado familiar.', fb:'Muchas negativas se resuelven gestionando la barrera real.' },
        { id:'a4', texto:'Presionar diciendo que "si se va, se muere"', tipo:'peligroso', puntos:-3, resp:'El paciente se cierra.', fb:'La coacción vulnera la autonomía y suele endurecer el rechazo.' },
      ]},
      { comp:'Comunicación y cierre', tipo:'multi', instruccion:'Informar y verificar la capacidad de decidir.', opciones:[
        { id:'c1', texto:'Explicar en lenguaje simple el diagnóstico, el riesgo de no tratarse y el beneficio esperado', tipo:'clave', puntos:3, critico:true, resp:'El paciente escucha la información.', fb:'Sin información comprensible no hay decisión válida.' },
        { id:'c2', texto:'Verificar que comprende (pedirle que repita el riesgo con sus palabras)', tipo:'clave', puntos:3, critico:true, resp:'Repite correctamente el riesgo que asume.', fb:'Comprender, razonar y expresar una decisión son los ejes de la capacidad.' },
        { id:'c3', texto:'Ofrecer alternativas y gestionar la barrera (apoyo social, red familiar, plazos)', tipo:'clave', puntos:2, resp:'Se ofrece gestión de apoyo para el cuidado.', fb:'Resolver la barrera concreta suele revertir el rechazo.' },
        { id:'c4', texto:'Involucrar a un familiar o persona de confianza, con autorización del paciente', tipo:'util', puntos:1, resp:'Se contacta a la familia con su permiso.', fb:'Apoyo en la decisión, respetando la confidencialidad.' },
      ]},
      { comp:'Manejo y destino', tipo:'multi', instruccion:'Cierre de la situación.', opciones:[
        { id:'m1', texto:'Respetar la decisión si el paciente es competente y está informado', tipo:'clave', puntos:3, critico:true, resp:'Se respeta la autonomía.', fb:'Un paciente informado y competente tiene derecho a rechazar un tratamiento.' },
        { id:'m2', texto:'Ofrecer el máximo tratamiento posible en el nuevo escenario (plan B)', tipo:'clave', puntos:2, resp:'Se acuerda un plan ambulatorio de resguardo.', fb:'Rechazar una indicación no equivale a rechazar todo cuidado.' },
        { id:'m3', texto:'Entregar signos de alarma y dejar la puerta abierta para volver', tipo:'clave', puntos:3, critico:true, resp:'Se explican los signos de alarma y el reingreso.', fb:'Nunca cerrar la puerta: el paciente debe poder volver sin sentirse juzgado.' },
        { id:'m4', texto:'Registrar en la ficha la información entregada, la capacidad y la decisión', tipo:'clave', puntos:2, resp:'Se documenta el proceso completo.', fb:'El registro protege al paciente y al profesional.' },
        { id:'m5', texto:'Retener al paciente contra su voluntad', tipo:'peligroso', puntos:-4, critico:true, resp:'Constituye una vulneración de derechos.', fb:'Salvo excepciones legales estrictas, retener a un paciente competente es ilegítimo.' },
      ]},
    ],
    oral:[
      { q:'¿Cuándo puede un paciente rechazar un tratamiento?', modelo:'Cuando está informado y es competente: comprende su situación, razona sobre riesgos y beneficios, y expresa una decisión consistente. La autonomía se respeta aunque el médico no comparta la decisión.' },
      { q:'¿Cómo evalúa la capacidad de decidir?', modelo:'Verificando que comprenda la información, la aplique a su propio caso, razone alternativas y comunique una elección estable; y descartando causas médicas que la alteren (hipoxia, sepsis, dolor, intoxicación, compromiso de conciencia).' },
      { q:'¿Qué hace si concluye que NO es competente?', modelo:'No procede el alta voluntaria: se actúa según el mejor interés del paciente, se involucra a su representante o familia y se activa el procedimiento institucional correspondiente.' },
      { q:'¿Qué registra en la ficha?', modelo:'La información entregada, la comprensión verificada, la evaluación de capacidad, las alternativas ofrecidas, los signos de alarma explicados y la decisión del paciente.' },
    ],
    aprobacion:{ minPct:65, requiereDx:false },
  },

  /* ========== MEDICINA INTERNA — Consejería breve: cese de tabaquismo ========== */
  {
    id:'mi-consejeria-tabaco', area:'medint', titulo:'Consejería breve de cese de tabaquismo', nivel:'Médico general', minutos:8,
    revisionEstructura:'2026-08-03',
    fuentes:['minsal_guias','eunacom_perfil'],
    motivo:'Paciente fumador en control, sin intención clara de dejar de fumar.',
    puerta:'Realice una consejería breve de cese de tabaquismo a un paciente fumador que consulta por otro motivo.',
    criterios:['Preguntar y registrar el consumo','Consejo claro y personalizado','Evaluar disposición al cambio','Ofrecer ayuda concreta','Acordar seguimiento'],
    briefing:'Estación de consejería (modelo de las 5 A). No se evalúa diagnóstico: se evalúa la técnica de entrevista motivacional y el plan.',
    vineta:'Paciente de 45 años, fuma desde los 20. Consulta por otro motivo. Al preguntarle, dice: "sé que hace mal, pero ahora no es el momento; además ya lo intenté una vez y no pude".',
    etapas:[
      { comp:'Seguridad inicial', tipo:'multi', instruccion:'Apertura de la consejería.', opciones:[
        { id:'s1', texto:'Presentarse y pedir permiso para conversar del tema', tipo:'clave', puntos:2, critico:true, resp:'"Sí, doctor, hablemos."', fb:'Pedir permiso aumenta la receptividad y respeta la autonomía.' },
        { id:'s2', texto:'Explicar brevemente por qué es relevante para su salud', tipo:'util', puntos:1, resp:'El paciente comprende la pertinencia.', fb:'Vincula el consejo al motivo de consulta.' },
      ]},
      { comp:'Anamnesis', tipo:'multi', instruccion:'Preguntar (Averiguar).', opciones:[
        { id:'a1', texto:'Cuantificar el consumo (cantidad, años, primer cigarrillo del día)', tipo:'clave', puntos:3, critico:true, resp:'"Como 15 al día; el primero apenas despierto."', fb:'Cuantificar el consumo y la precocidad orienta la dependencia.' },
        { id:'a2', texto:'Explorar intentos previos y qué ocurrió', tipo:'clave', puntos:3, resp:'"Estuve dos meses sin fumar y recaí en una fiesta."', fb:'Los intentos previos son aprendizaje, no fracaso; identifican gatillantes.' },
        { id:'a3', texto:'Explorar motivaciones personales y gatillantes', tipo:'clave', puntos:2, resp:'"Me gustaría poder jugar con mi hija sin cansarme."', fb:'La motivación propia es más potente que el argumento del médico.' },
        { id:'a4', texto:'Registrar el consumo en la ficha', tipo:'util', puntos:1, resp:'Se registra.', fb:'Permite seguimiento y control.' },
        { id:'a5', texto:'Retar al paciente por seguir fumando', tipo:'peligroso', puntos:-3, critico:true, resp:'El paciente se cierra y se defiende.', fb:'El tono culpabilizador genera resistencia y rompe la alianza.' },
      ]},
      { comp:'Comunicación y cierre', tipo:'multi', instruccion:'Aconsejar y evaluar disposición.', opciones:[
        { id:'c1', texto:'Dar un consejo claro, firme y personalizado para dejar de fumar', tipo:'clave', puntos:3, critico:true, resp:'"Como su médico, lo más importante que puede hacer por su salud es dejar de fumar."', fb:'El consejo breve del médico, claro y personalizado, aumenta la tasa de cese.' },
        { id:'c2', texto:'Evaluar la disposición al cambio en este momento', tipo:'clave', puntos:3, resp:'Está ambivalente, no listo para fijar fecha.', fb:'La intervención se adapta a la etapa: no forzar un plan a quien no está listo.' },
        { id:'c3', texto:'Trabajar la ambivalencia explorando pros y contras', tipo:'clave', puntos:2, resp:'El paciente verbaliza sus propias razones para dejarlo.', fb:'Entrevista motivacional: que el argumento salga del paciente.' },
        { id:'c4', texto:'Reformular la recaída previa como aprendizaje', tipo:'clave', puntos:2, resp:'"Entonces logré dos meses; no fue en vano."', fb:'Refuerza la autoeficacia, principal predictor de éxito.' },
        { id:'c5', texto:'Amenazar con las consecuencias más graves para asustarlo', tipo:'peligroso', puntos:-2, resp:'Genera rechazo defensivo.', fb:'El miedo aislado no sostiene el cambio de conducta.' },
      ]},
      { comp:'Manejo y destino', tipo:'multi', instruccion:'Asistir y acordar seguimiento.', opciones:[
        { id:'m1', texto:'Ofrecer ayuda concreta (apoyo conductual y tratamiento farmacológico disponible)', tipo:'clave', puntos:3, critico:true, resp:'Se ofrecen las alternativas de apoyo.', fb:'Ofrecer ayuda concreta distingue la consejería del simple consejo.' },
        { id:'m2', texto:'Proponer fijar una fecha de cese si está dispuesto', tipo:'clave', puntos:2, resp:'Queda abierto a pensarlo.', fb:'La fecha concreta ordena el plan cuando hay disposición.' },
        { id:'m3', texto:'Informar sobre programas de apoyo disponibles (p. ej. Salud Responde)', tipo:'util', puntos:1, resp:'Se entrega la información.', fb:'Amplía la red de apoyo más allá de la consulta.' },
        { id:'m4', texto:'Acordar un seguimiento y dejar el tema abierto para próximos controles', tipo:'clave', puntos:3, critico:true, resp:'Se agenda control y se deja el tema abierto.', fb:'La consejería es un proceso repetido en el tiempo, no un evento único.' },
        { id:'m5', texto:'Dar por perdido el caso porque "no quiere dejarlo"', tipo:'peligroso', puntos:-3, critico:true, resp:'Se pierde la oportunidad de intervención.', fb:'La ambivalencia es una etapa esperable; abandonar la consejería es un error.' },
      ]},
    ],
    oral:[
      { q:'¿Qué modelo usa para la consejería breve?', modelo:'Las 5 A: Averiguar el consumo, Aconsejar de forma clara y personalizada, Acordar según disposición, Ayudar con apoyo conductual y farmacológico, y Acompañar con seguimiento.' },
      { q:'¿Qué hace si el paciente no quiere dejar de fumar?', modelo:'No se fuerza un plan de cese: se trabaja la ambivalencia con entrevista motivacional, se deja el consejo instalado, se ofrece ayuda disponible y se reabre el tema en el siguiente control.' },
      { q:'¿Por qué importa el primer cigarrillo del día?', modelo:'Fumar poco después de despertar es un indicador de mayor dependencia a la nicotina y orienta la necesidad de apoyo farmacológico.' },
      { q:'¿Cómo aborda una recaída previa?', modelo:'Como aprendizaje: se identifican los gatillantes de la recaída, se refuerza el logro alcanzado y se planifican estrategias para esas situaciones, fortaleciendo la autoeficacia.' },
    ],
    aprobacion:{ minPct:65, requiereDx:false },
  },
);
