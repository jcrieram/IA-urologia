# Exportador Mibiodata

Script para exportar **nombre, RUT, teléfono, correo** (más fecha de nacimiento y previsión) de los pacientes que **tú** atendiste en los últimos **24 meses** en `mibiodata.hospitalclinico.cl`.

> **Ámbito:** sólo pacientes con atenciones en estados distintos a *Cancelado* y *No asistió*. Datos del profesional logueado.

## Requisitos

- Python 3.10+
- Conexión a la red donde se accede a Mibiodata.
- Credenciales válidas del médico tratante.

## Instalación (una vez)

```bash
python -m venv .venv
source .venv/bin/activate          # en Windows: .venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
```

## Uso

```bash
python scraper.py
```

1. Se abrirá una ventana de Chromium.
2. Inicia sesión **manualmente** en Mibiodata (usuario + médico + clave).
3. Cuando veas tu agenda, vuelve al terminal y presiona `ENTER`.
4. El script recorrerá día por día hacia atrás 730 días, agendado por agendado.
5. Cada paciente único se abre una sola vez (deduplicación por número de ficha).
6. El progreso se guarda en `out/progress.json` — si se interrumpe, basta volver a correrlo y retoma.
7. Al final pregunta si quieres cifrar el CSV con contraseña.

Tiempo estimado para ~12-15 atenciones/día durante 2 años: **2-4 horas**.

## Salida

- `out/pacientes_YYYY-MM-DD.csv` (o `.csv.enc` si lo cifras)
- Columnas: `ficha, rut, nombre, telefono, correo, fecha_nacimiento, prevision, fecha_referencia`
- `out/scraper.log` con el detalle de la corrida.
- `out/progress.json` con el estado para poder reanudar.

## Descifrar

```bash
python encryptor.py decrypt out/pacientes_YYYY-MM-DD.csv.enc
```

Te pide la misma contraseña que pusiste al cifrar y deja `out/pacientes_YYYY-MM-DD.csv`.

## Si los selectores no calzan

Mibiodata puede cambiar pequeños detalles del HTML. Si ves errores tipo *"No pude setear la fecha"* o *"No encontré dropdown de estados"*, hay tres puntos en `scraper.py` que típicamente hay que ajustar:

- `find_date_input()` — detecta el input de fecha por su patrón `dd-mm-yyyy`.
- `find_state_select()` — detecta el `<select>` de estado por las palabras clave en sus opciones.
- `extract_field()` — busca el valor justo debajo de cada label en la ficha.

Abre Chromium con DevTools (F12), inspecciona el elemento que falla, y ajusta el selector.

## Seguridad

- Las credenciales **nunca** quedan en código ni en disco. Las escribes a mano en el navegador.
- El CSV resultante contiene datos sensibles de pacientes. **Cífralo siempre** y guárdalo en almacenamiento personal seguro (no en Drive corporativo, no en chats).
- Borra `out/progress.json` cuando termines la migración: contiene los datos en JSON plano.
- Esta exportación se ejecuta bajo **tu** sesión y se limita a tus pacientes en tu rol de tratante. No accede a fichas de otros profesionales.

## Aviso legal

Sólo úsalo con tu propia cuenta y para datos sobre los que tienes vínculo de tratante. La Ley 19.628 (y la 21.719 vigente desde diciembre 2026) te hace responsable del tratamiento de estos datos: cifrado en reposo, acceso restringido, plazo de conservación definido.
