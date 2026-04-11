-- Imagen por defecto por categoría: si un producto no tiene `image`, la tienda usa esta URL.

alter table public.product_categories
  add column if not exists default_image text null,
  add column if not exists default_image_alt text null;

comment on column public.product_categories.default_image is 'URL pública (ej. Supabase Storage o externa) cuando el producto no tiene imagen.';
comment on column public.product_categories.default_image_alt is 'Texto alternativo para la imagen por defecto de la categoría.';

-- Imágenes por categoría (Unsplash): una foto que represente bien el tipo de producto / servicio.
-- Si ya aplicaste esta migración antes, podés volver a ejecutar solo este bloque de UPDATE.

update public.product_categories
set
  default_image = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&q=88&auto=format&fit=crop',
  default_image_alt = 'Smartphone Apple iPhone'
where id = 'iphone';

update public.product_categories
set
  default_image = 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=900&q=88&auto=format&fit=crop',
  default_image_alt = 'Tablet Apple iPad'
where id = 'ipad';

update public.product_categories
set
  default_image = 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=900&q=88&auto=format&fit=crop',
  default_image_alt = 'Accesorios y fundas para dispositivos'
where id = 'otros';

update public.product_categories
set
  default_image = 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=900&q=88&auto=format&fit=crop',
  default_image_alt = 'Reloj inteligente Apple Watch'
where id = 'watch';

update public.product_categories
set
  default_image = 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=900&q=88&auto=format&fit=crop',
  default_image_alt = 'Auriculares Apple AirPods'
where id = 'audio';

update public.product_categories
set
  default_image = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900&q=88&auto=format&fit=crop',
  default_image_alt = 'Notebook Apple MacBook'
where id = 'mac';

update public.product_categories
set
  default_image = 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=900&q=88&auto=format&fit=crop',
  default_image_alt = 'Computadora de escritorio Apple iMac'
where id = 'desktop';

update public.product_categories
set
  default_image = 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=900&q=88&auto=format&fit=crop',
  default_image_alt = 'Reparación y servicio técnico de electrónica'
where id = 'servicio';
