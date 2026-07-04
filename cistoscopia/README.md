# Dictado de Uretrocistoscopía — v7

## Dr. Juan Carlos Riera Medina — Urología

Aplicación web de una sola página para dictar informes de uretrocistoscopía **completamente manos libres**, pensada para uso intraoperatorio con guantes estériles.

## Cómo usarla en cualquier computadora

1. Copie el archivo `index.html` (de esta carpeta) a la computadora — por USB, correo o descargándolo desde GitHub.
2. Ábralo con **Google Chrome** o **Microsoft Edge** (doble clic).
3. Permita el acceso al micrófono cuando el navegador lo solicite.

**No requiere instalación, ni internet, ni ningún otro archivo.** Todo (interfaz, lógica y generador de Word) está dentro del único `index.html`.

> Si el repositorio tiene GitHub Pages activado, también puede usarse en línea desde:
> `https://jcrieram.github.io/IA-urologia/cistoscopia/`

## Flujo de trabajo

1. Presione el **botón del micrófono** (o `Ctrl + Espacio`).
2. Dicte cada campo con el formato **«[campo] [contenido]»**:
   - «nombre Juan Pérez González»
   - «rut 15678234 k» → se formatea solo: `15.678.234-K`
   - «edad 67» → `67 años`
   - «vejiga mucosa de aspecto normal coma sin lesiones punto»
3. El campo se rellena, destella en verde, suena una confirmación y la **vista previa del informe se actualiza en vivo**.
4. Diga «descargar informe» (o pulse el botón) para obtener el **Word (.docx)**, o «imprimir informe» para imprimir / guardar como **PDF**.

## Comandos de voz

| Comando | Acción |
|---|---|
| `[campo] [texto]` | Rellena el campo (reemplaza lo anterior) |
| `agregar [campo] [texto]` | Agrega texto al final del campo |
| `borrar [campo]` | Vacía ese campo |
| `examen normal` | Rellena todos los hallazgos con la plantilla de examen normal |
| `fecha hoy` | Coloca la fecha de hoy |
| `descargar informe` | Descarga el .docx |
| `imprimir informe` | Abre el diálogo de impresión (papel o PDF) |
| `limpiar todo` | Comienza un informe nuevo |
| `punto`, `coma`, `punto y coma`, `dos puntos`, `nueva línea`, `punto aparte` | Puntuación dictada |

## Campos reconocidos

nombre/paciente · rut (y alias «ruth», «root», «ruta»…) · edad · fecha · indicación/motivo · anestesia · equipo · uretra (anterior) · próstata / uretra posterior · cuello (vesical) · vejiga · diagnóstico/conclusión · conducta/sugerencia/plan.

También entiende artículos: «en la vejiga…», «la uretra…».

## Mejoras respecto a la versión anterior (v6)

- **Sin librerías externas**: el .docx se genera con un empaquetador ZIP + OOXML propio (~100 líneas), eliminando los ~200 KB de JSZip/FileSaver embebidos. 100% offline real.
- **Vista previa en vivo** del informe: lo que se ve es exactamente lo que se imprime.
- **Impresión / PDF** con formato profesional de una página (Ctrl+P o por voz).
- **Autoguardado**: el borrador se conserva en `localStorage`; si se cierra la pestaña por accidente, se recupera al reabrir.
- **Plantilla de examen normal** con un clic o por voz.
- **Puntuación dictada**, mayúsculas automáticas y formato de RUT chileno.
- **Comandos**: agregar, borrar campo, limpiar todo, descargar, imprimir.
- **Feedback sonoro** (beep) al capturar un campo — útil sin mirar la pantalla.
- **Campos nuevos**: anestesia y equipo, con valores por defecto.
- **Indicador de completitud** (campos completados X/11) y aviso de compatibilidad si el navegador no soporta dictado.
- **Selector de idioma** de reconocimiento (es-CL por defecto).
- Corrige el bug histórico de duplicación (usa solo el resultado final del reconocedor).

## Compatibilidad

- **Dictado por voz**: Chrome 33+ y Edge 79+ (la Web Speech API de Chrome requiere conexión a internet para el reconocimiento; el resto de la app funciona offline).
- **Firefox / Safari**: sin dictado, pero se puede escribir manualmente y exportar Word/PDF igual.

## Estructura del informe generado

Encabezado (Dr. Riera — Urología) → Fecha → Título → Tabla del paciente (Nombre/RUT/Edad) → Indicación + Anestesia/Equipo → Hallazgos (Uretra anterior, Uretra posterior/Próstata, Cuello vesical, Vejiga) → Diagnóstico endoscópico + Sugerencia → Firma.

El archivo se descarga como `cistoscopia_[Apellidos]_[YYYYMMDD].docx`.
