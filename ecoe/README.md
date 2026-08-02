# Entrenador ECOE — EUNACOM (MVP)

Simulador de estaciones clínicas tipo **ECOE** para preparar el EUNACOM práctico
(formato UC-Chile), en las áreas de **Cirugía, Medicina Interna, Pediatría y
Gineco-Obstetricia**.

> ⚠️ **Contenido borrador.** Los casos y pautas fueron generados como punto de
> partida y **requieren validación médica** antes de uso formal. Es una herramienta
> educativa; no reemplaza el juicio clínico ni las guías vigentes (MINSAL/GES/UC).

## Qué hace (v1)

- **Modo Simulacro ECOE:** estaciones cronometradas que recorren competencias
  (Anamnesis → Examen físico → Exámenes → Diagnóstico → Manejo → Comunicación).
- **Pauta de cotejo:** cada acción tiene un valor; las acciones innecesarias o
  **riesgosas restan**, y omitir un elemento **crítico** reprueba la estación.
- **Feedback inmediato:** al confirmar cada etapa se revela el hallazgo/respuesta
  y una nota educativa.
- **Resultado detallado:** porcentaje, aprobado/no aprobado, alertas de seguridad,
  desempeño por competencia (gráfico) y revisión etapa por etapa.
- **Progreso local:** intentos y estadísticas guardados en el navegador
  (`localStorage`), sin login ni backend.

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
