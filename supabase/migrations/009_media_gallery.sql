-- Índice de imágenes subidas al bucket público (galería BO + registro automático al subir).
-- Lecturas solo desde servidor con service role (sin políticas públicas).

create table if not exists public.media_gallery_items (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  storage_path text not null,
  public_url text not null,
  bytes int not null default 0,
  content_type text,
  source text not null default 'product',
  created_at timestamptz not null default now(),
  constraint media_gallery_items_bucket_path_key unique (bucket, storage_path)
);

create index if not exists media_gallery_items_created_id_desc_idx
  on public.media_gallery_items (created_at desc, id desc);

comment on table public.media_gallery_items is 'URLs de Storage registradas para la galería del backoffice; paginación por cursor (created_at, id).';

alter table public.media_gallery_items enable row level security;

-- Sin políticas de lectura/escritura para roles JWT: solo service_role en servidor.
