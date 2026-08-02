# Entrenador ECOE — EUNACOM (perfil médico general)

Simulador de estaciones clínicas tipo **ECOE** para preparar la **sección
práctica del EUNACOM** (formato UC-Chile), enfocado en el perfil de **médico/a
general** (diagnosticar / estabilizar / **derivar**), en las cuatro etapas:
**Medicina Interna, Pediatría, Obstetricia y Ginecología y Cirugía**.

Alineado al *Informe Ejecutivo ECOE EUNACOM-SP (UC)*: estructura por el algoritmo
**SEGURA**, competencias transversales de alto impacto y las 10 estaciones modelo
con sus criterios mínimos.

> ⚠️ **Contenido borrador.** Casos y pautas son material **original** de práctica,
> generados como punto de partida y **pendientes de validación médica**. No son
> casos oficiales ni bancos filtrados de la UC. Herramienta educativa; no reemplaza
> el juicio clínico ni las guías vigentes (MINSAL/GES/UC/EUNACOM).

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
- **Progreso local** (intentos y circuitos) en `localStorage`, sin login ni backend.

## Estaciones incluidas (borrador)

| # | Área | Estación |
|---|------|----------|
| 1 | Medicina Interna | Dolor torácico agudo (IAMCEST) |
| 2 | Medicina Interna | Déficit neurológico focal (ACV) |
| 3 | Pediatría | Lactante con dificultad respiratoria |
| 4 | Pediatría | Diarrea y deshidratación |
| 5 | Obstetricia y Ginecología | Sangrado del primer trimestre |
| 6 | Obstetricia y Ginecología | Preeclampsia |
| 7 | Cirugía | Abdomen agudo |
| 8 | Cirugía | Politrauma (ABCDE) |
| 9 | Cirugía / Urología | Retención urinaria y sondaje (con procedimiento) |
| 10 | Transversal | Comunicación de un diagnóstico grave (SPIKES) |

Orden de estudio sugerido (plan de 4 semanas del informe): **Semana 1 Medicina
Interna → 2 Pediatría → 3 Obs-Gine → 4 Cirugía + circuito completo.**

## Estructura

| Archivo | Rol |
|---|---|
| `index.html` | App completa (UI + motor de estaciones). Vanilla JS + Tailwind + Chart.js por CDN. |
| `data.js` | Banco de estaciones. **Aquí se agrega/edita el contenido clínico.** |

## Cómo agregar una estación

Añade un objeto al arreglo `ESTACIONES` en `data.js`:

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
