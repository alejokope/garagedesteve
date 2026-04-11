-- Quita la imagen placeholder que aplicaba `set_missing_product_images.sql`
-- (photo-1696446702183). Después, en la tienda vuelve a usarse
-- `product_categories.default_image` para productos sin imagen propia.
--
-- `products.image` es NOT NULL en el esquema: usamos '' (vacío), que el sitio
-- trata igual que “sin imagen” (ver `applyProductCategoryImageFallback`).
--
-- Ejecutar en SQL Editor de Supabase o: psql … -f supabase/seed/clear_placeholder_product_images.sql

UPDATE public.products
SET
  image = ''
WHERE trim(image) <> ''
  AND trim(image) LIKE 'https://images.unsplash.com/photo-1696446702183-cbd41c710f55%';
