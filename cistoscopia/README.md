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
   - «cédula 15678234 k» → se formatea solo: `15678234-K`
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
| `enviar por correo` | Envía el informe por correo (adjunta el Word en el celular) |
| `imprimir informe` | Abre el diálogo de impresión (papel o PDF) |
| `terminar` / `finalizar dictado` | **Termina el dictado y apaga el micrófono** (también «listo», «detener», «apagar micrófono») |
| `limpiar todo` | Comienza un informe nuevo |
| `punto`, `coma`, `punto y coma`, `dos puntos`, `nueva línea`, `punto aparte` | Puntuación dictada |

## Campos reconocidos

nombre/paciente · cédula (también «rut», «carnet» y alias «ruth», «root», «ruta»…) · edad · fecha · indicación/motivo · anestesia · equipo · uretra (anterior) · próstata / uretra posterior · cuello (vesical) · vejiga · diagnóstico/conclusión · conducta/sugerencia/plan.

La cédula se ordena automáticamente al formato `12345678-9` (sin puntos, con guión antes del dígito verificador), descartando cualquier palabra o separador que el reconocedor haya intercalado.

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

Encabezado (Dr. Riera — Urología) → Fecha → Título → Tabla del paciente (Nombre/Cédula/Edad) → Indicación + Anestesia/Equipo → Hallazgos (Uretra anterior, Uretra posterior/Próstata, Cuello vesical, Vejiga) → Diagnóstico endoscópico + Sugerencia → **Imágenes del estudio (3 espacios)** → **Firma / timbre**.

El archivo se descarga como `cistoscopia_[Apellidos]_[YYYYMMDD].docx`.

## Firma / timbre

- Botón **"Cargar firma / timbre"**: seleccione una foto o escaneo de su firma (PNG/JPG). La app la reduce de tamaño y vuelve transparente el fondo blanco del papel para que se vea limpia.
- La firma se guarda en este computador (`localStorage`) y aparece al pie de cada informe (Word e impresión/PDF), **debajo** del espacio de imágenes.
- Si no hay firma cargada, el pie muestra en texto: **Dr. Juan Carlos Riera Medina · RUT: 25.279.729-7 · Urólogo**.

## Logo del encabezado

Botón **"Cargar logo del encabezado"**: seleccione la imagen de su logo/membrete. Aparece **arriba a la izquierda** del informe (pantalla, PDF y Word), con su nombre y especialidad a la derecha, en formato de membrete. Está ajustado para **no aumentar la altura**, de modo que el informe sigue cabiendo en una sola hoja carta. Se guarda solo en este computador (como la firma). Para quitarlo: **"Quitar logo"**.

### Firma y logo estables y portátiles — "Guardar app con mi firma y logo"

Una vez cargada la firma y/o el logo aparece el botón **"Guardar app con mi firma y logo"**. Genera un archivo `cistoscopia_con_firma.html` **con su firma y logo ya incrustados de forma permanente**:

- Úselo en **cualquier computador** (consulta, casa, pabellón) y la firma ya estará puesta, sin volver a cargarla.
- No contiene datos de pacientes (se generan en blanco).
- Es su archivo personal: guárdelo donde quiera. Este es el archivo que conviene usar en el día a día.

> Nota: el `index.html` del repositorio se mantiene **sin** la firma incrustada; la firma solo queda en el archivo que usted genera con ese botón.

## Enviar por correo

Botón **"Enviar por correo"** (o di «enviar por correo»):

- **En el celular:** abre la hoja de **Compartir** de iPhone/Android con el **Word adjunto** — eliges Mail (o WhatsApp) y lo mandas a donde lo puedas imprimir.
- **En el computador:** abre tu programa de correo con el **texto del informe ya escrito** y **descarga el Word** para que lo adjuntes. Puedes guardar un **correo de destino** en el recuadro "Correo para enviar el informe" y queda recordado.

## Imágenes del estudio

- Casilla **"Incluir espacio para 3 imágenes del estudio"** (activada por defecto): reserva, entre la conducta y la firma, una fila de 3 recuadros.
- En el **Word**, cada recuadro es un **control de contenido de imagen**: basta **hacer clic dentro del recuadro** y se abre el diálogo para elegir la foto; la imagen queda **ajustada al recuadro automáticamente**, sin tener que redimensionarla a mano.
- Si desactiva la casilla, el informe va sin ese espacio y la firma sube.
