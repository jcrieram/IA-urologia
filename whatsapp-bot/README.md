# Respuesta automática a audios de WhatsApp

Cuando alguien te manda un audio dentro del horario de consulta, contesta
automáticamente que no puedes escucharlo en ese momento.

Funciona con **tu número de siempre**: se vincula a tu WhatsApp como un
dispositivo más, igual que WhatsApp Web. No hace falta un número aparte y
sigues usando el móvil con normalidad.

- **Horario**: lunes a viernes, 9:00–13:30 y 15:00–17:30 (hora de Madrid).
- **Fuera de ese horario**: no contesta nada.
- **Repetición**: como máximo un aviso cada 6 horas por contacto.
- **Solo audios**: texto, fotos y documentos se ignoran.
- **Grupos**: ignorados (se puede activar).

## Lo que hay que saber antes de empezar

Esto **no es una integración oficial de WhatsApp**. Usa el mismo protocolo que
WhatsApp Web, pero Meta no lo autoriza formalmente para bots. En la práctica,
para un uso como este (responder a quien te escribe, un mensaje corto, pocas
veces al día) el riesgo es bajo, pero conviene saberlo:

- No mandes mensajes masivos ni escribas a gente que no te ha escrito antes.
  Eso es lo que dispara los bloqueos.
- Deja el mensaje corto y personal, como está configurado.
- Si algún día WhatsApp bloquea la cuenta, se recupera desde el móvil, pero
  puede haber unas horas sin servicio.

Necesita **un ordenador encendido las 24 horas**. Si el bot está apagado no
contesta nada, y los audios que hayan llegado mientras tanto se descartan (no
querrás contestar a las 3 de la madrugada un audio de por la mañana).

## Dónde ponerlo a correr

| Opción | Coste | Comentario |
| --- | --- | --- |
| Raspberry Pi en casa o en la consulta | ~60 € una vez | Lo más barato a la larga. Depende de tu luz y tu wifi. |
| VPS pequeño (Hetzner, DigitalOcean, Contabo) | 4–6 €/mes | Lo más estable. 1 GB de RAM sobra. |
| Ordenador de la consulta | 0 € | Vale para probar, pero si se apaga o se suspende, deja de contestar. |

No sirve Vercel ni ningún hosting de funciones: hace falta un proceso vivo con
conexión permanente.

## Instalación

Con Node.js 20 o superior instalado:

```bash
git clone https://github.com/jcrieram/IA-urologia.git
cd IA-urologia/whatsapp-bot
npm install
node bot.js
```

La primera vez aparece un código QR en la terminal. En el móvil:
**WhatsApp → Ajustes → Dispositivos vinculados → Vincular un dispositivo**, y
escaneas. A partir de ahí la sesión queda guardada en `datos/sesion/` y no
vuelve a pedir el QR aunque reinicies.

Cuando veas `Conectado como 34...` ya está escuchando.

## Dejarlo funcionando siempre

Con `node bot.js` a secas, el bot muere al cerrar la terminal. Dos formas de
mantenerlo vivo:

**systemd** (recomendado en un VPS o una Raspberry con Linux). El fichero
`whatsapp-bot.service` de esta carpeta ya está preparado; solo hay que ajustar
la ruta y el usuario:

```bash
sudo cp whatsapp-bot.service /etc/systemd/system/
sudo nano /etc/systemd/system/whatsapp-bot.service
sudo systemctl daemon-reload
sudo systemctl enable --now whatsapp-bot
sudo journalctl -u whatsapp-bot -f      # ver qué está haciendo
```

Escanea el QR la primera vez ejecutando `node bot.js` a mano; después arranca
el servicio, que ya encontrará la sesión guardada.

**pm2**, si prefieres algo más rápido de montar:

```bash
npm install -g pm2
pm2 start bot.js --name whatsapp-bot
pm2 save && pm2 startup
pm2 logs whatsapp-bot
```

## Cambiar horarios o mensaje

Todo está en `config.js`. Ejemplos:

```js
// Añadir sábado por la mañana
sab: ['10:00-13:00'],

// Un festivo: ese día no se contesta
excepciones: { '2026-08-15': [] },

// Un día de congreso: aviso todo el día
excepciones: { '2026-09-10': ['08:00-22:00'] },

// No contestar nunca a estos contactos (familia, compañeros...)
contactosExcluidos: ['34600111222'],

// Contestar solo a notas de voz grabadas, no a audios reenviados
soloNotasDeVoz: true,
```

Después de tocar la configuración, compruébala y reinicia:

```bash
node bot.js --revisar        # valida horarios y mensaje sin conectarse
node test.js                 # 35 pruebas de la lógica
sudo systemctl restart whatsapp-bot
```

## Qué verás en los registros

```
[mar 2026-08-11 10:14] Conectado como 34600999888. Escuchando audios.
[mar 2026-08-11 10:31] Audio de 34600111222 -> respondido
[mar 2026-08-11 10:32] Audio de 34600111222 -> ignorado (ya avisado recientemente)
[mar 2026-08-11 14:05] Audio de 34600333444 -> ignorado (fuera del horario de consulta)
```

## Estructura

```
bot.js                  Conexión con WhatsApp, QR, reconexión
config.js               Horarios, mensaje y frecuencia  <- lo que vas a tocar
lib/horario.js          Franjas, zona horaria y festivos
lib/memoria.js          Control de "ya avisé a este contacto", guardado en disco
lib/procesar.js         Decisión: audio + horario + no repetir
test.js                 Pruebas de toda la lógica, sin conectarse a WhatsApp
whatsapp-bot.service    Unidad de systemd lista para copiar
datos/                  Sesión y avisos (no se sube al repositorio)
```

## Detalles que conviene saber

- **Tus notificaciones siguen llegando al móvil**: el bot se conecta sin
  marcarse como "en línea" (`markOnlineOnConnect: false`). Si no fuese así,
  WhatsApp le mandaría a él los avisos y el teléfono dejaría de sonar.
- **Nunca se responde a sí mismo** ni a estados, canales ni grupos.
- **Al arrancar**, WhatsApp entrega de golpe lo recibido mientras estaba
  apagado. Los audios de más de 10 minutos se descartan
  (`ignorarMensajesMasViejosQueMin`).
- **La carpeta `datos/sesion/` es tu sesión de WhatsApp**: cualquiera que la
  copie puede leer y escribir por ti. No la subas a ningún sitio ni la dejes en
  un servidor compartido. Ya está excluida del repositorio.
- **Para desvincular**: en el móvil, Dispositivos vinculados → cerrar la sesión
  de "Consulta". Para volver a empezar, borra `datos/sesion/` y arranca de nuevo.
