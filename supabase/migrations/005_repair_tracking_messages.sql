-- Mensajes del taller visibles para el cliente en la consulta por código de seguimiento.

create table if not exists public.repair_tracking_messages (
  id uuid primary key default gen_random_uuid(),
  repair_id uuid not null references public.repairs (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists repair_tracking_messages_repair_idx
  on public.repair_tracking_messages (repair_id, created_at asc);

alter table public.repair_tracking_messages enable row level security;

comment on table public.repair_tracking_messages is
  'Actualizaciones de texto para el cliente; lectura pública solo vía API con código (service role).';
