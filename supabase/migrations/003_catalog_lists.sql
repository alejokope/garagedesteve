-- Listas editables: categorías de producto, tipos de opción de variantes, textos de modos de precio.

create table if not exists public.product_categories (
  id text primary key,
  label text not null,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.variant_kind_definitions (
  id text primary key,
  label text not null,
  hint text,
  ui_behavior text not null check (ui_behavior in ('color', 'storage', 'select')),
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.variant_pricing_mode_labels (
  mode text primary key check (mode in ('absolute', 'delta')),
  label text not null,
  hint text,
  updated_at timestamptz not null default now()
);

alter table public.product_categories enable row level security;
alter table public.variant_kind_definitions enable row level security;
alter table public.variant_pricing_mode_labels enable row level security;

drop policy if exists "product_categories_select_public" on public.product_categories;
create policy "product_categories_select_public"
  on public.product_categories for select to anon, authenticated using (active = true);

drop policy if exists "variant_kind_definitions_select_public" on public.variant_kind_definitions;
create policy "variant_kind_definitions_select_public"
  on public.variant_kind_definitions for select to anon, authenticated using (active = true);

drop policy if exists "variant_pricing_mode_labels_select_public" on public.variant_pricing_mode_labels;
create policy "variant_pricing_mode_labels_select_public"
  on public.variant_pricing_mode_labels for select to anon, authenticated using (true);

-- Datos iniciales (alineados al catálogo actual)
insert into public.product_categories (id, label, sort_order) values
  ('mac', 'MacBook', 0),
  ('ipad', 'iPad', 1),
  ('iphone', 'iPhone', 2),
  ('watch', 'Apple Watch', 3),
  ('audio', 'AirPods', 4),
  ('desktop', 'iMac', 5),
  ('servicio', 'Servicio técnico', 6),
  ('otros', 'Otros', 7)
on conflict (id) do nothing;

insert into public.variant_kind_definitions (id, label, hint, ui_behavior, sort_order) values
  ('color', 'Color o acabado', 'Muestra muestras de color en la tienda.', 'color', 0),
  ('storage', 'Almacenamiento o capacidad', 'Típico para GB/TB con precio por nivel.', 'storage', 1),
  ('select', 'Lista genérica', 'Correas, kits, presentaciones, etc.', 'select', 2)
on conflict (id) do nothing;

insert into public.variant_pricing_mode_labels (mode, label, hint) values
  ('absolute', 'Cada opción define el precio final', 'Al elegirla, el precio del producto pasa a ser el de esa opción.'),
  ('delta', 'Cada opción suma o resta al precio base', 'Se ajusta el precio base con el importe de cada opción.')
on conflict (mode) do update set
  label = excluded.label,
  hint = excluded.hint,
  updated_at = now();

comment on table public.product_categories is 'Categorías del catálogo (slug = products.category).';
comment on table public.variant_kind_definitions is 'Tipos de grupo de variantes; ui_behavior define cómo se muestra en tienda.';
comment on table public.variant_pricing_mode_labels is 'Textos UI para modos absolute/delta (solo 2 filas).';
