/* ECOE — Estaciones · Cirugía y Urología
   Ver data/00-core.js para el modelo de datos y el estado de validación. */
ESTACIONES.push(
  /* ========== 7 · CIRUGÍA — Abdomen agudo ========== */
  {
    id:'cir-abdomen-agudo', area:'cirugia', titulo:'Abdomen agudo', nivel:'Médico general', minutos:8,
    fuentes:['minsal_guias','eunacom_perfil'],
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
    fuentes:['atls','minsal_ges','eunacom_perfil'],
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
    fuentes:['minsal_guias','eunacom_perfil'],
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
);
