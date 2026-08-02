/* ECOE — Estaciones · Obstetricia y Ginecología
   Ver data/00-core.js para el modelo de datos y el estado de validación. */
ESTACIONES.push(
  /* ========== 5 · OBS-GINE — Sangrado del primer trimestre ========== */
  {
    id:'gin-sangrado-1t', area:'gineco', titulo:'Sangrado del primer trimestre', nivel:'Médico general', minutos:8,
    fuentes:['uc_obsgin','minsal_guias','eunacom_perfil'],
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
    fuentes:['uc_obsgin','minsal_ges','eunacom_perfil'],
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
);
