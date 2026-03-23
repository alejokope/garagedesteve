-- Esquema inicial: productos y contenido editable desde el backoffice.
-- Ejecutá esto en Supabase → SQL Editor o con la CLI (`supabase db push`).

-- Extensión para UUID (normalmente ya habilitada en Supabase)
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Productos: alineado con lib/data.ts (Product) + variant_groups (JSON) +
-- detail (ProductDetailBlock en lib/product-detail-data.ts)
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id text primary key,
  name text not null,
  short text not null,
  category text not null,
  price numeric(14, 2) not null check (price >= 0),
  badge text,
  image text not null,
  image_alt text not null,
  variant_groups jsonb not null default '[]'::jsonb,
  detail jsonb,
  compare_at_price numeric(14, 2),
  discount_percent smallint check (
    discount_percent is null
    or (discount_percent >= 0 and discount_percent <= 100)
  ),
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_published_sort_idx
  on public.products (published, sort_order, name);

-- ---------------------------------------------------------------------------
-- Contenido por clave (home, FAQ, textos, etc.): payload JSON flexible
-- ---------------------------------------------------------------------------
create table if not exists public.content_entries (
  key text primary key,
  label text,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS: lectura pública solo de productos publicados; contenido según políticas
-- (ajustá cuando conectes auth al BO)
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.content_entries enable row level security;

create policy "products_select_published"
  on public.products
  for select
  to anon, authenticated
  using (published = true);

-- Lectura pública del contenido (la tienda puede usar anon key; el BO escribe con service_role)
create policy "content_select_public"
  on public.content_entries
  for select
  to anon, authenticated
  using (true);

comment on table public.products is
  'Catálogo: variant_groups sigue el shape de lib/product-variants.ts (ProductVariantGroup[]).';
comment on table public.content_entries is
  'Contenido CMS por clave (ej. home.testimonials, home.faq).';
