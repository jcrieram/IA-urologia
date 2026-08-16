# Plataforma de gestión de pacientes quirúrgicos

App interna (Next.js + Supabase) para el seguimiento de solicitudes de
cirugía, pagos de honorarios y comunicación con pacientes. Ver el plan
completo de construcción en la conversación original / `docs/plan.md` si se
copia allí.

## Estado actual (Fase 1)

- Esquema completo de base de datos (`supabase/migrations/0001_init.sql`).
- Login restringido por Google OAuth + allowlist (`usuarios_permitidos`).
- Alta manual de caso, listado, ficha de caso, registro de pago.
- Dashboard con conteos por estado y las dos alertas internas (no concretada
  >18 días, pago pendiente >30 días).
- Fase 2 (OCR), Fase 3 (catálogo Fonasa), Fase 4 (Gmail/plantillas/encuesta) y
  Fase 5 (reportes) quedan marcadas "Próximamente" en la interfaz.

## Puesta en marcha

### 1. Proyecto Supabase

1. Crear un proyecto nuevo (gratis) en [supabase.com](https://supabase.com).
2. En el SQL Editor, ejecutar el contenido de
   `supabase/migrations/0001_init.sql`.
3. Insertar los dos correos permitidos:
   ```sql
   insert into usuarios_permitidos (email, nombre) values
     ('correo-doctor@gmail.com', 'Dr. Juan Carlos Riera'),
     ('correo-asistente@gmail.com', 'Asistente');
   ```
4. En Authentication → Providers, habilitar **Google** y configurar las
   credenciales OAuth (ver paso 3).
5. Copiar `Project URL`, `anon public key` y `service_role key` a las
   variables de entorno.

### 2. Variables de entorno

Copiar `.env.example` a `.env.local` y completar:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
GOOGLE_GMAIL_CLIENT_ID=
GOOGLE_GMAIL_CLIENT_SECRET=
GOOGLE_GMAIL_REDIRECT_URI=
NEXT_PUBLIC_APP_URL=
```

### 3. Credenciales de Google Cloud (dos clientes OAuth distintos)

En [console.cloud.google.com](https://console.cloud.google.com), mismo
proyecto, dos clientes OAuth "Web application":

- **Login** (usado por Supabase Auth): el `redirect URI` lo entrega el panel
  de Supabase (Authentication → Providers → Google). Client ID/secret se
  pegan ahí, no en `.env`.
- **Envío Gmail** (`gmail.send`): redirect URI
  `https://<tu-dominio>/api/gmail/oauth/callback` (Fase 4, aún no
  implementada). Client ID/secret van en `.env` como
  `GOOGLE_GMAIL_CLIENT_ID` / `GOOGLE_GMAIL_CLIENT_SECRET`.

### 4. Desarrollo local

```bash
cd pacientes
npm install
npm run dev
```

### 5. Tests

```bash
npm test
```

### 6. Despliegue en Vercel

Este subproyecto se despliega como un **proyecto Vercel separado** del sitio
estático que vive en la raíz del repo:

1. En Vercel, "Add New… → Project", importar este mismo repo de GitHub.
2. En "Root Directory" seleccionar `pacientes`.
3. Framework se autodetecta como Next.js.
4. Cargar las variables de entorno del paso 2 en la configuración del
   proyecto (Production + Preview).
5. Deploy. El sitio estático existente (`/`, `/cistoscopia`, `/ecoe`) sigue
   sirviéndose desde el otro proyecto Vercel, sin cambios.

No enlazar esta app desde el sitio público — contiene datos de pacientes.
