/* ECOE — Estaciones · Pediatría
   Ver data/00-core.js para el modelo de datos y el estado de validación. */
ESTACIONES.push(
  /* ========== 3 · PEDIATRÍA — Lactante con dificultad respiratoria ========== */
  {
    id:'ped-dificultad-resp', area:'pediatria', titulo:'Lactante con dificultad respiratoria', nivel:'Médico general', minutos:8,
    fuentes:['minsal_guias','aiepi','eunacom_perfil'],
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
    fuentes:['minsal_guias','aiepi','eunacom_perfil'],
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
);
