-- Marca comercial del producto (texto libre: Apple, Samsung, JBL, etc.)
alter table public.products
  add column if not exists brand text;

comment on column public.products.brand is 'Marca mostrada en ficha y catálogo; opcional.';
