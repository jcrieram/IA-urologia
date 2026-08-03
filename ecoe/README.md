# Entrenador ECOE — EUNACOM (perfil médico general)

Simulador de estaciones clínicas tipo **ECOE** para preparar la **sección
práctica del EUNACOM** (formato UC-Chile), enfocado en el perfil de **médico/a
general** (diagnosticar / estabilizar / **derivar**), en las cuatro etapas:
**Medicina Interna, Pediatría, Obstetricia y Ginecología y Cirugía**.

Alineado al *Informe Ejecutivo ECOE EUNACOM-SP (UC)*: estructura por el algoritmo
**SEGURA**, competencias transversales de alto impacto y las 10 estaciones modelo
con sus criterios mínimos.

> **Estado de validación.** Casos y pautas son material **original** de práctica.
> No son casos oficiales ni bancos filtrados de la UC. Herramienta educativa; no
> reemplaza el juicio clínico ni las guías vigentes (MINSAL/GES/UC/EUNACOM).
>
> Las 61 estaciones tienen revisada la **estructura**. Solo las **8 urológicas**
> tienen además **validación clínica** de su contenido (Dr. Juan Carlos Riera,
> urólogo). En las otras 53 nadie con experiencia vigente en el área ha
> verificado el contenido médico: entrenan el método, no acreditan la clínica.

## Dos niveles de revisión (no confundir)

| Campo en los datos | Sello en la app | Qué garantiza |
|---|---|---|
| `revisionEstructura:'AAAA-MM-DD'` | Estructura revisada (azul) | El **formato**: etapas SEGURA, pauta, ítems críticos, instrucción de puerta y tiempos. **No** verifica el contenido médico. |
| `validacionClinica:{por,fecha,fuente}` | ✓ Validado clínicamente (verde) | El **contenido clínico**, verificado por un profesional con experiencia vigente en el área, contra una fuente citable. |
| — (sin campo) | Borrador (ámbar) | Pendiente de revisión. |

| Área | Estaciones | Estructura | Contenido clínico |
|---|---|---|---|
| Cirugía | 25 | ✓ | ✓ 8 urológicas · ⏳ 17 |
| Medicina Interna | 14 | ✓ | ⏳ Pendiente |
| Pediatría | 11 | ✓ | ⏳ Pendiente |
| Obstetricia y Ginecología | 11 | ✓ | ⏳ Pendiente |
| **Total** | **61** | **61** | **8** |

## Qué hace (v2)

- **Simulacro ECOE** cronometrado, con etapas ordenadas según **SEGURA**:
  Seguridad inicial → Anamnesis → Examen físico → Exámenes e interpretación →
  Diagnóstico → Procedimiento → Manejo y destino → Comunicación y cierre.
- **Pauta de cotejo:** cada acción tiene valor; las innecesarias o **riesgosas
  restan**, y omitir un elemento **crítico** (o ejecutar uno peligroso crítico,
  o errar el diagnóstico) **reprueba** la estación. Incluye ítems críticos
  transversales: consentimiento, definir **destino del paciente**, signos de
  alarma y verificar comprensión.
- **Modo circuito:** encadena varias estaciones seguidas (completo: una por área,
  o personalizado). Puntaje global y criterio ECOE de **aprobar todas**.
- **Personalización por el alumno:** cada estación permite **agregar módulos
  (etapas) y opciones** propias, que se integran al practicar (guardado local).
- **Feedback inmediato** por etapa (hallazgo + nota) y **resultado detallado**
  con desempeño por competencia (gráfico) y revisión etapa por etapa.
- **Interrogación oral al cierre:** preguntas frecuentes del examinador con
  respuesta modelo y autoevaluación (no afecta el puntaje de la estación).
- **Cronómetro por fase:** guía la gestión del tiempo (apertura → núcleo →
  resolver → cierre) según el informe UC.
- **🧠 Modo recuerdo abierto** (activable en el inicio): antes de ver la pauta,
  escribes de memoria qué harías; recién después aparece la lista para
  autocorregirte y se muestra tu texto al lado. Sin la lista delante no hay
  pistas — entrena **evocar** en vez de reconocer, que es lo que se necesita
  frente al paciente. Se aplica a anamnesis, examen físico, exámenes,
  procedimiento y manejo.
- **🫆 Mapa corporal** en el examen físico: en vez de leer la lista completa de
  maniobras, tocas la región del cuerpo (cabeza, cuello, tórax, abdomen, pelvis,
  extremidades o general) y solo ves las maniobras de esa zona. Entrena decidir
  *dónde* examinar. Cada opción se asigna por su campo `region` o, si no lo
  declara, infiriéndola del texto (`REGLAS_REGION` en `index.html`).
- **🖥️ Monitor de signos vitales dinámico** en estaciones de urgencia: los
  vitales se **deterioran con el tiempo** si no se ejecutan las medidas
  estabilizadoras, y se recuperan al hacerlas. Los valores críticos se marcan en
  rojo. Declarado por estación en el campo `monitor`.
- **🔢 Etapas de secuencia**: donde el orden importa (ABCDE del politrauma), se
  ordenan los pasos tocándolos en la secuencia en que se ejecutarían. Se evalúa
  la posición, no solo el conjunto: un desorden menor cuesta puntos, pero
  invertir una prioridad vital (circulación antes que vía aérea) **reprueba**.
- **📈 Material de interpretación** en la etapa de diagnóstico: trazados de ECG
  dibujados por código (SVG original, sin material de terceros) y paneles de
  laboratorio. Obligan a **interpretar** para llegar al diagnóstico, que es una
  de las dimensiones que evalúa el examen.
  Los ECG son **esquemáticos** y así se rotulan en pantalla: sirven para
  reconocer el patrón (ST, ritmo, ondas P), no sustituyen el entrenamiento con
  trazados reales de 12 derivaciones.
- **Progreso local** (intentos y circuitos) en `localStorage`, sin login ni backend.

### Etapa de secuencia

```js
{ comp:'Examen físico', tipo:'secuencia', puntos:10,
  criticos:['A','B'],                    // su posición exacta es crítica
  instruccion:'Ordene la secuencia…',
  pasos:[                                // el orden declarado ES el correcto
    { id:'A', texto:'A — Vía aérea con control cervical', fb:'Por qué va primero.' },
    { id:'B', texto:'B — Ventilación y oxigenación',      fb:'…' },
  ] }
```

El puntaje es proporcional a los pasos ubicados en su posición correcta. Los
`pasos` cuyo id figure en `criticos` reprueban la estación si quedan fuera de su
posición: en el ABCDE, hacer circulación antes que vía aérea no es un desorden
menor, es el error que mata.

### Campo `monitor` (estaciones de urgencia)

```js
monitor:{
  vitales:{ PA:'92/58', FC:128, FR:28, SatO2:93, T:'36,1' },  // estado inicial
  deterioro:[                                  // se aplica si NO se estabiliza
    { seg:90,  vitales:{ PA:'86/50', FC:136 }, aviso:'La hemorragia continúa.' },
    { seg:180, vitales:{ PA:'78/44', FC:142 }, aviso:'Shock progresivo.' },
  ],
  estabiliza:['a1','b1','c1'],                 // ids de opciones que lo detienen
  estable:{ vitales:{ PA:'106/68', FC:110 }, aviso:'Responde a la reanimación.' },
}
```

`seg` son segundos transcurridos desde el inicio. El deterioro se detiene en
cuanto se han confirmado **todas** las opciones de `estabiliza`. Lo llevan
politrauma, sepsis de foco urinario, hemorragia digestiva alta y shock por
deshidratación en el niño.

## Estaciones incluidas (61)

✓ = contenido clínico validado · 🖥️ = monitor de signos vitales · 🔢 = etapa de secuencia

En Cirugía se indica la frecuencia observada del tema en el examen: **[R]** se repite · **[N]** caso reciente · **[T]** en el temario.

### 🔪 Cirugía (25)

- Abdomen agudo **[R]**
- Cólico biliar (colelitiasis sintomática) **[R]**
- ✓ Cólico renal y litiasis ureteral **[R]**
- Coxartrosis (artrosis de cadera) **[R]**
- Gonartrosis (artrosis de rodilla) **[R]**
- Síndrome de hombro doloroso y lesión del manguito rotador **[R]**
- Lumbago mecánico inespecífico **[N]**
- Lumbociatalgia con radiculopatía **[N]**
- ✓ Prostatitis aguda **[N]**
- Claudicación intermitente (enfermedad arterial periférica crónica) **[T]**
- Coledocolitiasis **[T]**
- Isquemia arterial aguda de extremidad inferior **[T]**
- Litiasis vesicular hallada en ecografía: manejo y criterios quirúrgicos **[T]**
- ✓ Síndrome obstructivo urinario bajo por hiperplasia prostática benigna **[T]**
- Trombosis venosa profunda de extremidad inferior **[T]**
- Colecistitis y colangitis aguda
- ✓ Escroto agudo y torsión testicular
- ✓ Hematuria macroscópica
- Manejo de herida y profilaxis antitetánica
- Obstrucción intestinal
- Paciente enojado o reclamo por la atención
- ✓ Pielonefritis obstructiva y urosepsis
- Politrauma (manejo ABCDE) 🖥️ 🔢
- ✓ Retención urinaria aguda y sondaje
- ✓ Trauma genitourinario: cuándo NO sondear

### 🫀 Medicina Interna (14)

- Cetoacidosis diabética
- Comunicación de un diagnóstico grave
- Consejería breve de cese de tabaquismo
- Crisis convulsiva y estado post-ictal con sospecha de meningitis
- Crisis hipertensiva — urgencia vs emergencia
- Déficit neurológico focal agudo
- Disnea aguda — Insuficiencia cardíaca descompensada
- Dolor torácico agudo
- Exacerbación de EPOC
- Hemorragia digestiva alta 🖥️
- Neumonía adquirida en la comunidad — ¿hospitalizar?
- Paciente que rechaza el tratamiento indicado
- Sepsis de foco urinario — pielonefritis aguda 🖥️
- Síncope — estratificación de riesgo

### 🧒 Pediatría (11)

- Control del niño sano: crecimiento, desarrollo y vacunas
- Convulsión febril
- Crisis obstructiva bronquial y técnica inhalatoria
- Deshidratación grave y shock en el niño 🖥️
- Diarrea y deshidratación
- Ictericia neonatal
- Lactante con dificultad respiratoria
- Neumonía adquirida en la comunidad en el niño
- Síndrome febril sin foco en lactante
- Sospecha de maltrato infantil
- Sospecha de meningitis en el niño

### 🤰 Obstetricia y Ginecología (11)

- Anticoncepción: consejería, elegibilidad y decisión compartida
- Control prenatal: primera consulta
- Diabetes gestacional: pesquisa y manejo inicial
- Flujo vaginal e infección de transmisión sexual
- Hemorragia posparto
- Preeclampsia
- Proceso inflamatorio pelviano
- Rotura prematura de membranas
- Sangrado del primer trimestre
- Sangrado uterino anormal con sospecha de cáncer cervicouterino
- Trabajo de parto: evaluación inicial y derivación

Orden de estudio sugerido (plan de 4 semanas del informe): **Semana 1 Medicina
Interna → 2 Pediatría → 3 Obs-Gine → 4 Cirugía + circuito completo.**

## Estructura

| Archivo | Rol |
|---|---|
| `index.html` | App completa (UI + motor + circuito + edición). Vanilla JS + Tailwind + Chart.js por CDN. |
| `data/00-core.js` | Configuración: áreas, competencias (SEGURA), helpers de etapas, catálogo `FUENTES`, `ESTACIONES = []`. |
| `data/medint.js` | Estaciones de Medicina Interna. |
| `data/pediatria.js` | Estaciones de Pediatría. |
| `data/gineco.js` | Estaciones de Obstetricia y Ginecología. |
| `data/cirugia.js` | Estaciones de Cirugía (incluye los temas urológicos del temario). |
| `data/cirugia-musculoesqueletico.js` | Cirugía: artrosis, hombro doloroso, lumbago y lumbociatalgia. |
| `data/cirugia-biliar-urologia.js` | Cirugía: patología biliar y urología ambulatoria. |
| `data/cirugia-vascular.js` | Cirugía: patología vascular periférica. |
| `data/comunicacion.js` | Estaciones de comunicación y consejería (declaran su área entre las 4). |

Cada archivo registra sus estaciones con `ESTACIONES.push(...)` y debe estar
listado en los `<script>` de `index.html`.

## Fuentes y trazabilidad

Cada estación declara `fuentes: ['clave', ...]` con claves del catálogo `FUENTES`
(`data/00-core.js`): guías GES/MINSAL, manual de Obstetricia y Ginecología UC,
ATLS, AHA, Perfil de Conocimientos EUNACOM. Se muestran en el briefing.

Son **referencias contra las que contrastar** el contenido, no textos que la
estación reproduzca. Sirven para que quien estudie —o quien valide— pueda
verificar cada criterio en la guía vigente en lugar de confiar en el material.

Por diseño, las pautas evalúan **decisiones clínicas** (qué priorizar, qué examen
primero, cuándo derivar, qué es peligroso) y **no incluyen dosis de fármacos**:
la posología es donde un error es más dañino y más difícil de mantener vigente.

## Reporte de dudas

Cada estación tiene un botón **🚩 Reportar duda**: registra la observación en el
navegador y permite exportar todas las dudas a un `.txt` desde el inicio, para
revisarlas y corregir el contenido.

## Cómo agregar una estación

Añade un objeto al `ESTACIONES.push(...)` del archivo de su área (`data/<area>.js`):

```js
{
  id: 'cir-hernia',                 // único
  area: 'cirugia',                  // cirugia | medint | pediatria | gineco
  titulo: 'Título de la estación',
  nivel: 'Internado',
  minutos: 8,                       // tiempo de la estación
  motivo: 'Resumen de una línea.',
  briefing: 'Instrucciones al alumno.',
  vineta: 'Viñeta clínica que se muestra al iniciar.',
  etapas: [
    {
      comp: 'Anamnesis',            // competencia (ver COMPETENCIAS)
      tipo: 'multi',                // 'multi' (varias) | 'unica' (una correcta)
      instruccion: '¿Qué preguntas realiza?',
      opciones: [
        { id:'a1', texto:'…', tipo:'clave', puntos:3, critico:true,
          resp:'Lo que responde el paciente / hallazgo.',
          fb:'Por qué es importante.' },
        // tipo: 'clave' | 'util' | 'neutro' | 'peligroso'
        // puntos: aporte (los 'peligroso' deben ir en negativo)
        // critico:true  -> omitir una 'clave' crítica, o hacer una 'peligroso'
        //                  crítica, reprueba la estación
      ]
    }
    // … una etapa por competencia
  ],
  aprobacion: { minPct: 60, requiereDx: true }
}
```

La etapa de **Diagnóstico** debe ser `tipo:'unica'` y su opción correcta debe
tener `tipo:'clave'` (define si el diagnóstico se considera acertado).

## Reglas de puntaje

- Puntaje = puntos ganados / suma de puntos positivos posibles.
- Las opciones `peligroso` restan; el total no baja de 0.
- **Reprueba** si: `pct < minPct`, o diagnóstico incorrecto (si `requiereDx`),
  o se seleccionó una acción `peligroso` **crítica**, o se omitió una `clave`
  **crítica**.

## Desarrollo local

Es estático: abre `index.html` en el navegador, o sirve la carpeta
(`npx serve` / `python -m http.server`). Se despliega en Vercel junto al resto
del sitio (ruta `/ecoe`).

## Roadmap sugerido (siguientes fases)

1. Más estaciones por área (validadas).
2. Filtro por área y modo "examen" (varias estaciones seguidas, tipo circuito).
3. Paciente simulado con IA (chat) + evaluador automático de la rúbrica.
4. Cuentas y progreso en la nube + analítica por competencia.
