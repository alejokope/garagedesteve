-- Reparaciones: seguimiento para clientes (código) y gestión en backoffice (service role).

create type public.repair_status as enum (
  'pendiente',
  'revision',
  'reparando',
  'finalizado'
);

create table if not exists public.repairs (
  id uuid primary key default gen_random_uuid(),
  tracking_code text not null,
  email text not null,
  description text not null,
  status public.repair_status not null default 'pendiente',
  estimated_ready_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint repairs_tracking_code_len check (char_length(tracking_code) >= 6)
);

create unique index if not exists repairs_tracking_code_key on public.repairs (tracking_code);

create table if not exists public.repair_status_history (
  id uuid primary key default gen_random_uuid(),
  repair_id uuid not null references public.repairs (id) on delete cascade,
  from_status public.repair_status,
  to_status public.repair_status not null,
  changed_at timestamptz not null default now()
);

create index if not exists repair_status_history_repair_idx
  on public.repair_status_history (repair_id, changed_at desc);

alter table public.repairs enable row level security;
alter table public.repair_status_history enable row level security;

comment on table public.repairs is
  'Reparaciones con código de seguimiento; acceso solo vía service role o RPC controlada.';
comment on table public.repair_status_history is
  'Historial de cambios de estado (from → to, timestamp).';
