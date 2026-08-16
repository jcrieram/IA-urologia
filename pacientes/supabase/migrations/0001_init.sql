-- Plataforma de gestion de pacientes quirurgicos
-- Migracion inicial: esquema completo (pacientes, casos, pagos, catalogo fonasa,
-- plantillas, encuestas, log de emails, tokens gmail, usuarios permitidos)

create extension if not exists pgcrypto;

create type caso_estado as enum
  ('solicitud', 'agendada', 'operada', 'alta', 'no_concretada', 'cerrada');

create type caso_rol as enum ('cirujano', 'ayudante');

-- ---------------------------------------------------------------------------
-- Pacientes
-- ---------------------------------------------------------------------------
create table pacientes (
  id uuid primary key default gen_random_uuid(),
  rut text unique not null,
  nombre text not null,
  edad int,
  telefono text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Catalogo Fonasa MLE/PAD (urologia)
-- ---------------------------------------------------------------------------
create table catalogo_fonasa (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  tipo text,                          -- 'MLE' | 'PAD'
  nombre_procedimiento text not null,
  monto_cirujano numeric(12, 0),
  monto_ayudante numeric(12, 0),
  vigente boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Casos (un caso = una cirugia / episodio quirurgico de un paciente)
-- ---------------------------------------------------------------------------
create table casos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id) on delete restrict,
  estado caso_estado not null default 'solicitud',
  rol caso_rol not null,
  cirujano_principal text,            -- solo si rol = 'ayudante' (nombre del cirujano tratante)

  clinica_derivada text,
  clinica_final text,

  fecha_solicitud date,               -- null en casos creados directo desde protocolo (ayudante)
  fecha_cirugia_programada date,
  fecha_cirugia_real date,
  numero_ingreso text,
  fecha_alta date,

  foto_solicitud_path text,
  foto_protocolo_path text,

  observaciones text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index casos_estado_idx on casos (estado);
create index casos_fecha_solicitud_idx on casos (fecha_solicitud);
create index casos_fecha_cirugia_real_idx on casos (fecha_cirugia_real);
create index casos_paciente_id_idx on casos (paciente_id);

-- Un caso puede facturar mas de un codigo Fonasa (procedimiento principal + secundario)
create table caso_codigos_fonasa (
  caso_id uuid not null references casos(id) on delete cascade,
  codigo_fonasa text not null references catalogo_fonasa(codigo),
  orden int not null default 1,       -- 1 = principal, 2 = secundario, etc.
  primary key (caso_id, codigo_fonasa)
);

-- ---------------------------------------------------------------------------
-- Pagos (uno por caso, monto completo, sin abonos)
-- ---------------------------------------------------------------------------
create table pagos (
  id uuid primary key default gen_random_uuid(),
  caso_id uuid not null unique references casos(id) on delete cascade,
  monto numeric(12, 0) not null,
  fecha_pago date not null,
  observaciones text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Plantillas de preparacion quirurgica (PDF)
-- ---------------------------------------------------------------------------
create table documentos_plantilla (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria text,
  codigo_fonasa text references catalogo_fonasa(codigo),
  storage_path text not null,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Encuestas post-alta
-- ---------------------------------------------------------------------------
create table encuestas (
  id uuid primary key default gen_random_uuid(),
  caso_id uuid not null references casos(id) on delete cascade,
  token text unique not null,
  enviada_at timestamptz,
  respondida_at timestamptz,
  respuestas jsonb,
  created_at timestamptz not null default now()
);

create index encuestas_caso_id_idx on encuestas (caso_id);

-- ---------------------------------------------------------------------------
-- Log de correos enviados
-- ---------------------------------------------------------------------------
create table email_log (
  id uuid primary key default gen_random_uuid(),
  caso_id uuid references casos(id) on delete set null,
  tipo text,                          -- 'plantilla' | 'encuesta'
  destinatario text,
  asunto text,
  gmail_message_id text,
  estado text,                        -- 'enviado' | 'error'
  error_detalle text,
  enviado_por text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Token OAuth de Gmail (envio en nombre del doctor)
-- ---------------------------------------------------------------------------
create table gmail_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  refresh_token text not null,
  access_token text,
  expiry timestamptz,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Usuarios permitidos (allowlist de acceso)
-- ---------------------------------------------------------------------------
create table usuarios_permitidos (
  email text primary key,
  nombre text
);

-- ---------------------------------------------------------------------------
-- Vistas de alertas (calculadas al vuelo, sin cron)
-- ---------------------------------------------------------------------------
create view v_no_concretada as
select c.*, p.nombre as paciente_nombre, p.rut as paciente_rut
from casos c
join pacientes p on p.id = c.paciente_id
where c.estado = 'solicitud'
  and c.fecha_solicitud < (now() - interval '18 days');

create view v_pago_pendiente as
select c.*, p.nombre as paciente_nombre, p.rut as paciente_rut
from casos c
join pacientes p on p.id = c.paciente_id
left join pagos pg on pg.caso_id = c.id
where c.estado in ('operada', 'alta', 'cerrada')
  and c.fecha_cirugia_real < (now() - interval '30 days')
  and pg.id is null;

-- ---------------------------------------------------------------------------
-- RLS: default-deny en todas las tablas. El acceso real pasa exclusivamente
-- por rutas del servidor Next.js usando la service role key (bypassa RLS).
-- RLS queda como defensa en profundidad ante cualquier llamada accidental
-- desde el cliente con la anon key.
-- ---------------------------------------------------------------------------
alter table pacientes enable row level security;
alter table catalogo_fonasa enable row level security;
alter table casos enable row level security;
alter table caso_codigos_fonasa enable row level security;
alter table pagos enable row level security;
alter table documentos_plantilla enable row level security;
alter table encuestas enable row level security;
alter table email_log enable row level security;
alter table gmail_tokens enable row level security;
alter table usuarios_permitidos enable row level security;

-- updated_at helpers
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger pacientes_set_updated_at before update on pacientes
  for each row execute function set_updated_at();
create trigger casos_set_updated_at before update on casos
  for each row execute function set_updated_at();
create trigger catalogo_fonasa_set_updated_at before update on catalogo_fonasa
  for each row execute function set_updated_at();
