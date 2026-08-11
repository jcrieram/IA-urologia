# Respuesta automática a audios de WhatsApp

Cuando alguien manda un audio dentro del horario de consulta, el sistema
contesta automáticamente que no puedes escuchar audios en ese momento.

- **Horario configurado**: lunes a viernes, 9:00–13:30 y 15:00–17:30 (hora de Madrid).
- **Fuera de ese horario**: no se contesta nada.
- **Repetición**: como máximo un aviso cada 6 horas por contacto.
- **Solo audios**: los mensajes de texto, imágenes o documentos se ignoran.

## Cómo está montado

```
api/whatsapp.js              Webhook (función serverless de Vercel)
whatsapp/config.js           Horarios, mensaje y frecuencia  <- lo que vas a tocar
whatsapp/lib/horario.js      Franjas, zona horaria y festivos
whatsapp/lib/memoria.js      Control de "ya avisé a este contacto"
whatsapp/lib/whatsapp-api.js Envío de mensajes por la Graph API
whatsapp/lib/procesar.js     Decisión: audio + horario + no repetir
whatsapp/test.js             Pruebas (node whatsapp/test.js)
```

No hay dependencias externas: todo usa el `fetch` y el `crypto` nativos de Node 18+.

## Puesta en marcha

### 1. Número de WhatsApp Business Platform

En [developers.facebook.com](https://developers.facebook.com) crea una app de tipo
**Business** y añádele el producto **WhatsApp**. Meta te da un número de pruebas
para empezar; para producción hay que registrar un número propio.

> El número tiene que ser **distinto** del que usas en la app normal de WhatsApp.
> Un número dado de alta en la Cloud API deja de funcionar en la app del móvil.

Apunta el **Phone number ID** y el **App Secret** (en Configuración → Básica).

### 2. Token permanente

Los tokens de prueba caducan en 24 horas. Para uno permanente: Business Manager →
Usuarios del sistema → crear usuario con rol de administrador → asignar la app →
generar token con los permisos `whatsapp_business_messaging` y
`whatsapp_business_management`.

### 3. Variables de entorno en Vercel

En el proyecto de Vercel, *Settings → Environment Variables*:

| Variable | Para qué sirve |
| --- | --- |
| `WHATSAPP_TOKEN` | Token permanente del paso 2 |
| `WHATSAPP_PHONE_NUMBER_ID` | ID del número emisor |
| `WHATSAPP_VERIFY_TOKEN` | Cadena que tú inventas; Meta la usa para verificar el webhook |
| `WHATSAPP_APP_SECRET` | App Secret, para validar la firma de cada evento |
| `WHATSAPP_GRAPH_VERSION` | Opcional, por defecto `v21.0` |

### 4. Memoria compartida (recomendado)

Sin esto el sistema funciona, pero cada instancia serverless lleva su propia
cuenta y algún contacto puede recibir el aviso repetido.

En Vercel: *Storage → Create Database → Upstash Redis*. Al conectarlo al proyecto
aparecen solas `KV_REST_API_URL` y `KV_REST_API_TOKEN`, que es justo lo que busca
`whatsapp/lib/memoria.js`.

### 5. Conectar el webhook

Despliega y, en la configuración de WhatsApp de tu app de Meta, en *Webhooks*:

- **Callback URL**: `https://<tu-dominio>/api/whatsapp`
- **Verify token**: el mismo valor que pusiste en `WHATSAPP_VERIFY_TOKEN`

Pulsa *Verify and save* y después suscríbete al campo **messages**. Sin esa
suscripción no llega ningún evento.

## Cambiar horarios o mensaje

Todo está en `whatsapp/config.js`. Ejemplos:

```js
// Añadir sábado por la mañana
sab: ['10:00-13:00'],

// Un festivo: ese día no se contesta
excepciones: { '2026-08-15': [] },

// Un día de congreso: aviso todo el día
excepciones: { '2026-09-10': ['08:00-22:00'] },

// Contestar solo a notas de voz grabadas, no a audios reenviados
soloNotasDeVoz: true,
```

Después de tocar la config, ejecuta las pruebas y despliega:

```bash
node whatsapp/test.js
```

## Comprobar que funciona

Manda un audio al número desde otro teléfono dentro del horario. Si no llega
respuesta, mira los logs de la función en Vercel (*Deployments → Functions →
`api/whatsapp`*). Cada evento deja una línea con la decisión tomada:

```
[whatsapp] [{"de":"34600111222","accion":"respondido"}]
[whatsapp] [{"de":"34600111222","accion":"ignorado","motivo":"ya avisado recientemente"}]
```

## Detalles que conviene saber

- **Ventana de 24 horas**: Meta solo deja enviar texto libre a quien te ha escrito
  en las últimas 24 horas. Como aquí siempre respondemos a un audio recién
  recibido, la ventana está abierta y no hacen falta plantillas.
- **Reintentos**: si el webhook falla, Meta reenvía el evento durante horas. Los
  audios con más de 10 minutos se descartan (`ignorarMensajesMasViejosQueMin`)
  para no contestar "estoy en consulta" a un audio de ayer.
- **Firma**: cada evento se valida con HMAC-SHA256 contra el `WHATSAPP_APP_SECRET`.
  Si esa variable no está puesta, la validación se salta; ponla en producción.
  Si ves `firma inválida` en los logs, revisa que el secreto sea el de la misma
  app que envía los webhooks.
- **Coste**: las conversaciones iniciadas por el usuario tienen un tramo gratuito
  mensual y a partir de ahí se facturan por conversación. Consulta las tarifas
  vigentes de Meta para España.
