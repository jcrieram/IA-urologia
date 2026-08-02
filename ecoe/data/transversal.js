/* ECOE — Estaciones · Transversales
   Ver data/00-core.js para el modelo de datos y el estado de validación. */
ESTACIONES.push(
  /* ========== 10 · TRANSVERSAL — Comunicación de diagnóstico grave ========== */
  {
    id:'tx-malas-noticias', area:'transversal', titulo:'Comunicación de un diagnóstico grave', nivel:'Médico general', minutos:8,
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
);
