-- Etiqueta más amplia para parlantes / auriculares no solo AirPods.
update public.product_categories
set label = 'Audio', updated_at = now()
where id = 'audio';

-- Categorías para equipos nuevos de otras marcas (consolas, celulares, tablets).
insert into public.product_categories (id, label, sort_order) values
  ('consolas', 'Consolas y gaming', 8),
  ('smartphones', 'Celulares', 9),
  ('tablets', 'Tablets', 10)
on conflict (id) do nothing;

update public.product_categories
set
  default_image = 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=900&q=88&auto=format&fit=crop',
  default_image_alt = 'Consola y videojuegos'
where id = 'consolas';

update public.product_categories
set
  default_image = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&q=88&auto=format&fit=crop',
  default_image_alt = 'Smartphone'
where id = 'smartphones';

update public.product_categories
set
  default_image = 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=900&q=88&auto=format&fit=crop',
  default_image_alt = 'Tablet'
where id = 'tablets';
