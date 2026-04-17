-- Combinaciones vendibles explícitas por producto (vacío = modo cartesiano legacy).
alter table public.products
  add column if not exists sellable_variants jsonb not null default '[]'::jsonb;

comment on column public.products.sellable_variants is
  'SellableVariant[]: solo esas tuplas grupo→opción son válidas en tienda. [] = cualquier combinación de variant_groups.';
