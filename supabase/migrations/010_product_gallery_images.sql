-- Carrusel del producto: URLs adicionales (JSON array de strings). La primera imagen sigue siendo `products.image`.
alter table public.products
  add column if not exists gallery_images jsonb not null default '[]'::jsonb;

comment on column public.products.gallery_images is 'JSON array de URLs públicas (R2); imágenes extra del carrusel además de `image`.';
