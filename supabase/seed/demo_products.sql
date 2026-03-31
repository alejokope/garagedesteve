-- Catálogo: borra todos los productos y carga el snapshot generado desde lib/data.ts.
-- Incluye variant_groups (JSON) alineado a la tienda.
--
-- Generar de nuevo: npx tsx scripts/generate-product-seed.ts
-- Ejecutar: Supabase → SQL Editor (tras migraciones 001+). Una sola corrida.

begin;

truncate table public.products;

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id0$an-iphone-13-128gb-560-a-confirmar$id0$,
  $n0$iPhone 13 128GB$n0$,
  $s0$A confirmar según stock · Oficial 12 meses$s0$,
  $c0$iphone$c0$,
  560,
  $b0$Nuevo sellado$b0$,
  $img0$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img0$,
  $alt0$Producto$alt0$,
  $vg0$[]$vg0$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  0,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id1$an-iphone-14$id1$,
  $n1$iPhone 14$n1$,
  $s1$Elegí capacidad u opciones abajo · precios en USD$s1$,
  $c1$iphone$c1$,
  600,
  $b1$Nuevo sellado$b1$,
  $img1$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img1$,
  $alt1$Producto$alt1$,
  $vg1$[{"id":"almacenamiento","kind":"storage","uiKind":"storage","label":"Capacidad","pricingMode":"absolute","options":[{"id":"an-iphone-14-128gb-600-a-confirmar","label":"128GB","price":600},{"id":"an-iphone-14-512gb-710-a-confirmar","label":"512GB","price":710}]}]$vg1$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  1,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id2$an-iphone-15$id2$,
  $n2$iPhone 15$n2$,
  $s2$Elegí capacidad u opciones abajo · precios en USD$s2$,
  $c2$iphone$c2$,
  700,
  $b2$Nuevo sellado$b2$,
  $img2$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img2$,
  $alt2$Producto$alt2$,
  $vg2$[{"id":"almacenamiento","kind":"storage","uiKind":"storage","label":"Capacidad","pricingMode":"absolute","options":[{"id":"an-iphone-15-128gb-700-a-confirmar","label":"128GB","price":700},{"id":"an-iphone-15-256gb-770-a-confirmar","label":"256GB","price":770}]}]$vg2$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  2,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id3$an-iphone-15-plus$id3$,
  $n3$iPhone 15 PLUS$n3$,
  $s3$Elegí capacidad u opciones abajo · precios en USD$s3$,
  $c3$iphone$c3$,
  790,
  $b3$Nuevo sellado$b3$,
  $img3$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img3$,
  $alt3$Producto$alt3$,
  $vg3$[{"id":"almacenamiento","kind":"storage","uiKind":"storage","label":"Capacidad","pricingMode":"absolute","options":[{"id":"an-iphone-15-plus-128gb-790-a-confirmar","label":"128GB","price":790},{"id":"an-iphone-15-plus-512gb-880-a-confirmar","label":"512GB","price":880}]}]$vg3$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  3,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id4$an-iphone-16-128gb-780-a-confirmar$id4$,
  $n4$iPhone 16 128GB$n4$,
  $s4$A confirmar según stock · Oficial 12 meses$s4$,
  $c4$iphone$c4$,
  780,
  $b4$Nuevo sellado$b4$,
  $img4$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img4$,
  $alt4$Producto$alt4$,
  $vg4$[]$vg4$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  4,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id5$an-iphone-16-plus-128gb-920-a-confirmar$id5$,
  $n5$iPhone 16 PLUS 128GB$n5$,
  $s5$A confirmar según stock · Oficial 12 meses$s5$,
  $c5$iphone$c5$,
  920,
  $b5$Nuevo sellado$b5$,
  $img5$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img5$,
  $alt5$Producto$alt5$,
  $vg5$[]$vg5$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  5,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id6$an-iphone-16-pro-128gb-1110-a-confirmar$id6$,
  $n6$iPhone 16 PRO 128GB$n6$,
  $s6$A confirmar según stock · Oficial 12 meses$s6$,
  $c6$iphone$c6$,
  1110,
  $b6$Nuevo sellado$b6$,
  $img6$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img6$,
  $alt6$Producto$alt6$,
  $vg6$[]$vg6$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  6,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id7$an-iphone-16-pro-max-256gb-1290-a-confirmar$id7$,
  $n7$iPhone 16 PRO MAX 256GB$n7$,
  $s7$A confirmar según stock · Oficial 12 meses$s7$,
  $c7$iphone$c7$,
  1290,
  $b7$Nuevo sellado$b7$,
  $img7$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img7$,
  $alt7$Producto$alt7$,
  $vg7$[]$vg7$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  7,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id8$an-iphone-17-256gb-930-a-confirmar$id8$,
  $n8$iPhone 17 256GB$n8$,
  $s8$A confirmar según stock · Oficial 12 meses$s8$,
  $c8$iphone$c8$,
  930,
  $b8$Nuevo sellado$b8$,
  $img8$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img8$,
  $alt8$Producto$alt8$,
  $vg8$[]$vg8$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  8,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id9$an-iphone-17-pro$id9$,
  $n9$iPhone 17 PRO$n9$,
  $s9$Elegí capacidad u opciones abajo · precios en USD$s9$,
  $c9$iphone$c9$,
  1340,
  $b9$Nuevo sellado$b9$,
  $img9$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img9$,
  $alt9$Producto$alt9$,
  $vg9$[{"id":"almacenamiento","kind":"storage","uiKind":"storage","label":"Capacidad","pricingMode":"absolute","options":[{"id":"an-iphone-17-pro-256gb-1340-a-confirmar","label":"256GB","price":1340},{"id":"an-iphone-17-pro-512gb-1540-a-confirmar","label":"512GB","price":1540},{"id":"an-iphone-17-pro-1tb-1720-a-confirmar","label":"1TB","price":1720}]}]$vg9$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  9,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id10$an-iphone-17-pro-max$id10$,
  $n10$iPhone 17 PRO MAX$n10$,
  $s10$Elegí capacidad u opciones abajo · precios en USD$s10$,
  $c10$iphone$c10$,
  1490,
  $b10$Nuevo sellado$b10$,
  $img10$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img10$,
  $alt10$Producto$alt10$,
  $vg10$[{"id":"almacenamiento","kind":"storage","uiKind":"storage","label":"Capacidad","pricingMode":"absolute","options":[{"id":"an-iphone-17-pro-max-256gb-1490-a-confirmar","label":"256GB","price":1490},{"id":"an-iphone-17-pro-max-512gb-1720-a-confirmar","label":"512GB","price":1720},{"id":"an-iphone-17-pro-max-1tb-1920-a-confirmar","label":"1TB","price":1920},{"id":"an-iphone-17-pro-max-2tb-2300-a-confirmar","label":"2TB","price":2300}]}]$vg10$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  10,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id11$an-macbook-neo-256gb-ssd-870-a-confirmar$id11$,
  $n11$MacBook NEO · 256GB SSD$n11$,
  $s11$A confirmar según stock · Oficial 12 meses$s11$,
  $c11$mac$c11$,
  870,
  $b11$Nuevo sellado$b11$,
  $img11$https://images.unsplash.com/photo-1517336714731-489689fd4ca8?w=800&q=80$img11$,
  $alt11$Producto$alt11$,
  $vg11$[]$vg11$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  11,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id12$an-macbook-neo-512gb-ssd-980-a-confirmar$id12$,
  $n12$MacBook NEO · 512GB SSD$n12$,
  $s12$A confirmar según stock · Oficial 12 meses$s12$,
  $c12$mac$c12$,
  980,
  $b12$Nuevo sellado$b12$,
  $img12$https://images.unsplash.com/photo-1517336714731-489689fd4ca8?w=800&q=80$img12$,
  $alt12$Producto$alt12$,
  $vg12$[]$vg12$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  12,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id13$an-macbook-air-256gb-ssd$id13$,
  $n13$MacBook AIR · 256GB SSD$n13$,
  $s13$Varias opciones de color y precio · elegí abajo$s13$,
  $c13$mac$c13$,
  1180,
  $b13$Nuevo sellado$b13$,
  $img13$https://images.unsplash.com/photo-1517336714731-489689fd4ca8?w=800&q=80$img13$,
  $alt13$Producto$alt13$,
  $vg13$[{"id":"presentacion","kind":"select","uiKind":"select","label":"Elegí la configuración","pricingMode":"absolute","options":[{"id":"an-macbook-air-256gb-ssd-1180-a-confirmar","label":"256GB SSD · U$S 1180","price":1180},{"id":"an-macbook-air-256gb-ssd-1370-a-confirmar","label":"256GB SSD · U$S 1370","price":1370}]}]$vg13$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  13,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id14$an-macbook-air-512gb-ssd$id14$,
  $n14$MacBook AIR · 512GB SSD$n14$,
  $s14$Varias opciones de color y precio · elegí abajo$s14$,
  $c14$mac$c14$,
  1420,
  $b14$Nuevo sellado$b14$,
  $img14$https://images.unsplash.com/photo-1517336714731-489689fd4ca8?w=800&q=80$img14$,
  $alt14$Producto$alt14$,
  $vg14$[{"id":"presentacion","kind":"select","uiKind":"select","label":"Elegí la configuración","pricingMode":"absolute","options":[{"id":"an-macbook-air-512gb-ssd-1420-a-confirmar","label":"512GB SSD · U$S 1420","price":1420},{"id":"an-macbook-air-512gb-ssd-1450-a-confirmar","label":"512GB SSD · U$S 1450","price":1450},{"id":"an-macbook-air-512gb-ssd-1580-a-confirmar","label":"512GB SSD · U$S 1580","price":1580},{"id":"an-macbook-air-512gb-ssd-1650-a-confirmar","label":"512GB SSD · U$S 1650","price":1650}]}]$vg14$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  14,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id15$an-macbook-air-1tb-ssd$id15$,
  $n15$MacBook AIR · 1TB SSD$n15$,
  $s15$Varias opciones de color y precio · elegí abajo$s15$,
  $c15$mac$c15$,
  1630,
  $b15$Nuevo sellado$b15$,
  $img15$https://images.unsplash.com/photo-1517336714731-489689fd4ca8?w=800&q=80$img15$,
  $alt15$Producto$alt15$,
  $vg15$[{"id":"presentacion","kind":"select","uiKind":"select","label":"Elegí la configuración","pricingMode":"absolute","options":[{"id":"an-macbook-air-1tb-ssd-1630-a-confirmar","label":"1TB SSD · U$S 1630","price":1630},{"id":"an-macbook-air-1tb-ssd-1850-a-confirmar","label":"1TB SSD · U$S 1850","price":1850},{"id":"an-macbook-air-1tb-ssd-1870-a-confirmar","label":"1TB SSD · U$S 1870","price":1870},{"id":"an-macbook-air-1tb-ssd-2000-a-confirmar","label":"1TB SSD · U$S 2000","price":2000}]}]$vg15$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  15,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id16$an-macbook-pro-512gb-ssd$id16$,
  $n16$MacBook PRO · 512GB SSD$n16$,
  $s16$Varias opciones de color y precio · elegí abajo$s16$,
  $c16$mac$c16$,
  1820,
  $b16$Nuevo sellado$b16$,
  $img16$https://images.unsplash.com/photo-1517336714731-489689fd4ca8?w=800&q=80$img16$,
  $alt16$Producto$alt16$,
  $vg16$[{"id":"presentacion","kind":"select","uiKind":"select","label":"Elegí la configuración","pricingMode":"absolute","options":[{"id":"an-macbook-pro-512gb-ssd-1820-a-confirmar","label":"512GB SSD · U$S 1820","price":1820},{"id":"an-macbook-pro-512gb-ssd-1830-a-confirmar","label":"512GB SSD · U$S 1830","price":1830},{"id":"an-macbook-pro-512gb-ssd-2250-a-confirmar","label":"512GB SSD · U$S 2250","price":2250},{"id":"an-macbook-pro-512gb-ssd-2850-a-confirmar","label":"512GB SSD · U$S 2850","price":2850},{"id":"an-macbook-pro-512gb-ssd-3290-a-confirmar","label":"512GB SSD · U$S 3290","price":3290}]}]$vg16$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  16,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id17$an-macbook-pro-1tb-ssd$id17$,
  $n17$MacBook PRO · 1TB SSD$n17$,
  $s17$Varias opciones de color y precio · elegí abajo$s17$,
  $c17$mac$c17$,
  2050,
  $b17$Nuevo sellado$b17$,
  $img17$https://images.unsplash.com/photo-1517336714731-489689fd4ca8?w=800&q=80$img17$,
  $alt17$Producto$alt17$,
  $vg17$[{"id":"presentacion","kind":"select","uiKind":"select","label":"Elegí la configuración","pricingMode":"absolute","options":[{"id":"an-macbook-pro-1tb-ssd-2050-a-confirmar","label":"1TB SSD · U$S 2050","price":2050},{"id":"an-macbook-pro-1tb-ssd-2300-a-confirmar","label":"1TB SSD · U$S 2300","price":2300},{"id":"an-macbook-pro-1tb-ssd-2670-a-confirmar","label":"1TB SSD · U$S 2670","price":2670},{"id":"an-macbook-pro-1tb-ssd-4800-a-confirmar","label":"1TB SSD · U$S 4800","price":4800},{"id":"an-macbook-pro-1tb-ssd-5400-a-confirmar","label":"1TB SSD · U$S 5400","price":5400}]}]$vg17$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  17,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id18$an-macbook-pro-2tb-ssd-3390-a-confirmar$id18$,
  $n18$MacBook PRO · 2TB SSD$n18$,
  $s18$A confirmar según stock · Oficial 12 meses$s18$,
  $c18$mac$c18$,
  3390,
  $b18$Nuevo sellado$b18$,
  $img18$https://images.unsplash.com/photo-1517336714731-489689fd4ca8?w=800&q=80$img18$,
  $alt18$Producto$alt18$,
  $vg18$[]$vg18$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  18,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id19$an-ipad-mini-7ma-gen-128gb-620-a-confirmar$id19$,
  $n19$iPad MINI 7MA GEN 128GB$n19$,
  $s19$A confirmar según stock · Oficial 12 meses$s19$,
  $c19$ipad$c19$,
  620,
  $b19$Nuevo sellado$b19$,
  $img19$https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80$img19$,
  $alt19$Producto$alt19$,
  $vg19$[]$vg19$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  19,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id20$an-ipad-mini-7ma-gen-256gb-720-a-confirmar$id20$,
  $n20$iPad MINI 7MA GEN 256GB$n20$,
  $s20$A confirmar según stock · Oficial 12 meses$s20$,
  $c20$ipad$c20$,
  720,
  $b20$Nuevo sellado$b20$,
  $img20$https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80$img20$,
  $alt20$Producto$alt20$,
  $vg20$[]$vg20$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  20,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id21$an-ipad-a16-128gb-510-a-confirmar$id21$,
  $n21$iPad A16 128GB$n21$,
  $s21$A confirmar según stock · Oficial 12 meses$s21$,
  $c21$ipad$c21$,
  510,
  $b21$Nuevo sellado$b21$,
  $img21$https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80$img21$,
  $alt21$Producto$alt21$,
  $vg21$[]$vg21$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  21,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id22$an-ipad-a16-256gb-620-a-confirmar$id22$,
  $n22$iPad A16 256GB$n22$,
  $s22$A confirmar según stock · Oficial 12 meses$s22$,
  $c22$ipad$c22$,
  620,
  $b22$Nuevo sellado$b22$,
  $img22$https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80$img22$,
  $alt22$Producto$alt22$,
  $vg22$[]$vg22$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  22,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id23$an-ipad-air-128gb$id23$,
  $n23$iPad AIR 128GB$n23$,
  $s23$Varias opciones de color y precio · elegí abajo$s23$,
  $c23$ipad$c23$,
  700,
  $b23$Nuevo sellado$b23$,
  $img23$https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80$img23$,
  $alt23$Producto$alt23$,
  $vg23$[{"id":"presentacion","kind":"select","uiKind":"select","label":"Elegí la configuración","pricingMode":"absolute","options":[{"id":"an-ipad-air-128gb-700-a-confirmar","label":"128GB · U$S 700","price":700},{"id":"an-ipad-air-128gb-780-a-confirmar","label":"128GB · U$S 780","price":780},{"id":"an-ipad-air-128gb-920-a-confirmar","label":"128GB · U$S 920","price":920},{"id":"an-ipad-air-128gb-1000-a-confirmar","label":"128GB · U$S 1000","price":1000}]}]$vg23$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  23,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id24$an-ipad-air-256gb$id24$,
  $n24$iPad AIR 256GB$n24$,
  $s24$Varias opciones de color y precio · elegí abajo$s24$,
  $c24$ipad$c24$,
  850,
  $b24$Nuevo sellado$b24$,
  $img24$https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80$img24$,
  $alt24$Producto$alt24$,
  $vg24$[{"id":"presentacion","kind":"select","uiKind":"select","label":"Elegí la configuración","pricingMode":"absolute","options":[{"id":"an-ipad-air-256gb-850-a-confirmar","label":"256GB · U$S 850","price":850},{"id":"an-ipad-air-256gb-890-a-confirmar","label":"256GB · U$S 890","price":890},{"id":"an-ipad-air-256gb-1060-a-confirmar","label":"256GB · U$S 1060","price":1060},{"id":"an-ipad-air-256gb-1100-a-confirmar","label":"256GB · U$S 1100","price":1100}]}]$vg24$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  24,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id25$an-ipad-pro-256gb$id25$,
  $n25$iPad PRO 256GB$n25$,
  $s25$Varias opciones de color y precio · elegí abajo$s25$,
  $c25$ipad$c25$,
  1100,
  $b25$Nuevo sellado$b25$,
  $img25$https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80$img25$,
  $alt25$Producto$alt25$,
  $vg25$[{"id":"presentacion","kind":"select","uiKind":"select","label":"Elegí la configuración","pricingMode":"absolute","options":[{"id":"an-ipad-pro-256gb-1100-a-confirmar","label":"256GB · U$S 1100","price":1100},{"id":"an-ipad-pro-256gb-1120-a-confirmar","label":"256GB · U$S 1120","price":1120},{"id":"an-ipad-pro-256gb-1370-a-confirmar","label":"256GB · U$S 1370","price":1370},{"id":"an-ipad-pro-256gb-1470-a-confirmar","label":"256GB · U$S 1470","price":1470}]}]$vg25$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  25,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id26$an-ipad-pro-lte-256gb$id26$,
  $n26$iPad PRO + LTE 256GB$n26$,
  $s26$Varias opciones de color y precio · elegí abajo$s26$,
  $c26$ipad$c26$,
  1140,
  $b26$Nuevo sellado$b26$,
  $img26$https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80$img26$,
  $alt26$Producto$alt26$,
  $vg26$[{"id":"presentacion","kind":"select","uiKind":"select","label":"Elegí la configuración","pricingMode":"absolute","options":[{"id":"an-ipad-pro-lte-256gb-1140-a-confirmar","label":"256GB · U$S 1140","price":1140},{"id":"an-ipad-pro-lte-256gb-2040-a-confirmar","label":"256GB · U$S 2040","price":2040}]}]$vg26$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  26,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id27$an-ipad-pro-512gb$id27$,
  $n27$iPad PRO 512GB$n27$,
  $s27$Varias opciones de color y precio · elegí abajo$s27$,
  $c27$ipad$c27$,
  1420,
  $b27$Nuevo sellado$b27$,
  $img27$https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80$img27$,
  $alt27$Producto$alt27$,
  $vg27$[{"id":"presentacion","kind":"select","uiKind":"select","label":"Elegí la configuración","pricingMode":"absolute","options":[{"id":"an-ipad-pro-512gb-1420-a-confirmar","label":"512GB · U$S 1420","price":1420},{"id":"an-ipad-pro-512gb-1450-a-confirmar","label":"512GB · U$S 1450","price":1450},{"id":"an-ipad-pro-512gb-1790-a-confirmar","label":"512GB · U$S 1790","price":1790}]}]$vg27$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  27,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id28$an-ipad-pro-lte-512gb-2240-a-confirmar$id28$,
  $n28$iPad PRO + LTE 512GB$n28$,
  $s28$A confirmar según stock · Oficial 12 meses$s28$,
  $c28$ipad$c28$,
  2240,
  $b28$Nuevo sellado$b28$,
  $img28$https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80$img28$,
  $alt28$Producto$alt28$,
  $vg28$[]$vg28$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  28,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id29$an-ipad-pro-1tb-2390-a-confirmar$id29$,
  $n29$iPad PRO 1TB$n29$,
  $s29$A confirmar según stock · Oficial 12 meses$s29$,
  $c29$ipad$c29$,
  2390,
  $b29$Nuevo sellado$b29$,
  $img29$https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80$img29$,
  $alt29$Producto$alt29$,
  $vg29$[]$vg29$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  29,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id30$an-ipad-pro-lte-1tb-2790-a-confirmar$id30$,
  $n30$iPad PRO + LTE 1TB$n30$,
  $s30$A confirmar según stock · Oficial 12 meses$s30$,
  $c30$ipad$c30$,
  2790,
  $b30$Nuevo sellado$b30$,
  $img30$https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80$img30$,
  $alt30$Producto$alt30$,
  $vg30$[]$vg30$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  30,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id31$an-apple-watch-series-se-2$id31$,
  $n31$Apple Watch SERIES SE 2$n31$,
  $s31$Elegí capacidad u opciones abajo · precios en USD$s31$,
  $c31$watch$c31$,
  280,
  $b31$Nuevo sellado$b31$,
  $img31$https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80$img31$,
  $alt31$Producto$alt31$,
  $vg31$[{"id":"presentacion","kind":"select","uiKind":"select","label":"Elegí la configuración","pricingMode":"absolute","options":[{"id":"an-apple-watch-series-se-2-280-a-confirmar","label":"U$S 280","price":280},{"id":"an-apple-watch-series-se-2-310-a-confirmar","label":"U$S 310","price":310}]}]$vg31$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  31,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id32$an-apple-watch-series-se-2-lte-320-a-confirmar$id32$,
  $n32$Apple Watch SERIES SE 2 + LTE$n32$,
  $s32$A confirmar según stock · Oficial 12 meses$s32$,
  $c32$watch$c32$,
  320,
  $b32$Nuevo sellado$b32$,
  $img32$https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80$img32$,
  $alt32$Producto$alt32$,
  $vg32$[]$vg32$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  32,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id33$an-apple-watch-series-se-3$id33$,
  $n33$Apple Watch SERIES SE 3$n33$,
  $s33$Elegí capacidad u opciones abajo · precios en USD$s33$,
  $c33$watch$c33$,
  330,
  $b33$Nuevo sellado$b33$,
  $img33$https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80$img33$,
  $alt33$Producto$alt33$,
  $vg33$[{"id":"presentacion","kind":"select","uiKind":"select","label":"Elegí la configuración","pricingMode":"absolute","options":[{"id":"an-apple-watch-series-se-3-330-a-confirmar","label":"U$S 330","price":330},{"id":"an-apple-watch-series-se-3-370-a-confirmar","label":"U$S 370","price":370}]}]$vg33$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  33,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id34$an-apple-watch-series-10-390-a-confirmar$id34$,
  $n34$Apple Watch SERIES 10$n34$,
  $s34$A confirmar según stock · Oficial 12 meses$s34$,
  $c34$watch$c34$,
  390,
  $b34$Nuevo sellado$b34$,
  $img34$https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80$img34$,
  $alt34$Producto$alt34$,
  $vg34$[]$vg34$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  34,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id35$an-apple-watch-series-11$id35$,
  $n35$Apple Watch SERIES 11$n35$,
  $s35$Elegí capacidad u opciones abajo · precios en USD$s35$,
  $c35$watch$c35$,
  430,
  $b35$Nuevo sellado$b35$,
  $img35$https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80$img35$,
  $alt35$Producto$alt35$,
  $vg35$[{"id":"presentacion","kind":"select","uiKind":"select","label":"Elegí la configuración","pricingMode":"absolute","options":[{"id":"an-apple-watch-series-11-430-a-confirmar","label":"U$S 430","price":430},{"id":"an-apple-watch-series-11-460-a-confirmar","label":"U$S 460","price":460}]}]$vg35$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  35,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id36$an-apple-watch-ultra-2-790-a-confirmar$id36$,
  $n36$Apple Watch ULTRA 2$n36$,
  $s36$A confirmar según stock · Oficial 12 meses$s36$,
  $c36$watch$c36$,
  790,
  $b36$Nuevo sellado$b36$,
  $img36$https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80$img36$,
  $alt36$Producto$alt36$,
  $vg36$[]$vg36$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  36,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id37$an-apple-watch-ultra-3-840-a-confirmar$id37$,
  $n37$Apple Watch ULTRA 3$n37$,
  $s37$A confirmar según stock · Oficial 12 meses$s37$,
  $c37$watch$c37$,
  840,
  $b37$Nuevo sellado$b37$,
  $img37$https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80$img37$,
  $alt37$Producto$alt37$,
  $vg37$[]$vg37$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  37,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id38$an-imac$id38$,
  $n38$iMac$n38$,
  $s38$Elegí capacidad u opciones abajo · precios en USD$s38$,
  $c38$desktop$c38$,
  1990,
  $b38$Nuevo sellado$b38$,
  $img38$https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80$img38$,
  $alt38$Producto$alt38$,
  $vg38$[{"id":"presentacion","kind":"select","uiKind":"select","label":"Elegí la configuración","pricingMode":"absolute","options":[{"id":"an-imac-256gb-1990-a-confirmar","label":"256GB · U$S 1990","price":1990},{"id":"an-imac-256gb-2200-a-confirmar","label":"256GB · U$S 2200","price":2200},{"id":"an-imac-512gb-2460-a-confirmar","label":"512GB · U$S 2460","price":2460},{"id":"an-imac-512gb-2680-a-confirmar","label":"512GB · U$S 2680","price":2680},{"id":"an-imac-1tb-3350-a-confirmar","label":"1TB · U$S 3350","price":3350}]}]$vg38$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  38,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id39$an-airpods-3ra-generacion-200$id39$,
  $n39$AirPods 3RA GENERACION$n39$,
  $s39$- · Oficial 12 meses$s39$,
  $c39$audio$c39$,
  200,
  $b39$Nuevo sellado$b39$,
  $img39$https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80$img39$,
  $alt39$Producto$alt39$,
  $vg39$[]$vg39$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  39,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id40$an-airpods-4ta-generacion-180$id40$,
  $n40$AirPods 4TA GENERACION$n40$,
  $s40$- · Oficial 12 meses$s40$,
  $c40$audio$c40$,
  180,
  $b40$Nuevo sellado$b40$,
  $img40$https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80$img40$,
  $alt40$Producto$alt40$,
  $vg40$[]$vg40$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  40,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id41$an-airpods-4ta-generacion-noise-cancelling-230$id41$,
  $n41$AirPods 4TA GENERACION (NOISE CANCELLING)$n41$,
  $s41$- · Oficial 12 meses$s41$,
  $c41$audio$c41$,
  230,
  $b41$Nuevo sellado$b41$,
  $img41$https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80$img41$,
  $alt41$Producto$alt41$,
  $vg41$[]$vg41$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  41,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id42$an-airpods-pro-3ra-generacion-310$id42$,
  $n42$AirPods PRO 3RA GENERACION$n42$,
  $s42$- · Oficial 12 meses$s42$,
  $c42$audio$c42$,
  310,
  $b42$Nuevo sellado$b42$,
  $img42$https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80$img42$,
  $alt42$Producto$alt42$,
  $vg42$[]$vg42$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  42,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id43$au-iphone-12-pro-max-128gb-blue-320$id43$,
  $n43$IPHONE 12 PRO MAX 128GB$n43$,
  $s43$BLUE · Calidad A/A+ · Batería 100% · 1 mes · +3 meses con cargador original$s43$,
  $c43$iphone$c43$,
  320,
  $b43$Premium usado$b43$,
  $img43$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img43$,
  $alt43$Producto$alt43$,
  $vg43$[]$vg43$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  43,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id44$au-iphone-13-128gb$id44$,
  $n44$IPHONE 13 128GB$n44$,
  $s44$Elegí color, calidad o batería abajo · stock real$s44$,
  $c44$iphone$c44$,
  310,
  $b44$Premium usado$b44$,
  $img44$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img44$,
  $alt44$Producto$alt44$,
  $vg44$[{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"absolute","options":[{"id":"au-iphone-13-128gb-green-midnight-310","label":"GREEN, MIDNIGHT","price":310},{"id":"au-iphone-13-128gb-pink-starlight-red-midnight-350","label":"PINK, STARLIGHT, RED, MIDNIGHT","price":350}]}]$vg44$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  44,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id45$au-iphone-13-256gb-midnight-370$id45$,
  $n45$IPHONE 13 256GB$n45$,
  $s45$MIDNIGHT · Calidad A/A+ · Batería 100% · 1 mes · +3 meses con cargador original$s45$,
  $c45$iphone$c45$,
  370,
  $b45$Premium usado$b45$,
  $img45$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img45$,
  $alt45$Producto$alt45$,
  $vg45$[]$vg45$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  45,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id46$au-iphone-13-pro-128gb$id46$,
  $n46$IPHONE 13 PRO 128GB$n46$,
  $s46$Elegí color, calidad o batería abajo · stock real$s46$,
  $c46$iphone$c46$,
  430,
  $b46$Premium usado$b46$,
  $img46$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img46$,
  $alt46$Producto$alt46$,
  $vg46$[{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"absolute","options":[{"id":"au-iphone-13-pro-128gb-graphite-430","label":"GRAPHITE","price":430},{"id":"au-iphone-13-pro-128gb-graphite-blue-450","label":"GRAPHITE, BLUE","price":450}]}]$vg46$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  46,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id47$au-iphone-13-pro-256gb-graphite-blue-470$id47$,
  $n47$IPHONE 13 PRO 256GB$n47$,
  $s47$GRAPHITE, BLUE · Calidad A/A+ · Batería 100% · 1 mes · +3 meses con cargador original$s47$,
  $c47$iphone$c47$,
  470,
  $b47$Premium usado$b47$,
  $img47$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img47$,
  $alt47$Producto$alt47$,
  $vg47$[]$vg47$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  47,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id48$au-iphone-13-pro-max-128gb-green-gold-blue-silver-480$id48$,
  $n48$IPHONE 13 PRO MAX 128GB$n48$,
  $s48$GREEN, GOLD, BLUE, SILVER · Calidad A/A+ · Batería 100% · 1 mes · +3 meses con cargador original$s48$,
  $c48$iphone$c48$,
  480,
  $b48$Premium usado$b48$,
  $img48$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img48$,
  $alt48$Producto$alt48$,
  $vg48$[]$vg48$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  48,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id49$au-iphone-14-128gb-midnight-370$id49$,
  $n49$IPHONE 14 128GB$n49$,
  $s49$MIDNIGHT · Calidad A/A+ · Batería 100% · 1 mes · +3 meses con cargador original$s49$,
  $c49$iphone$c49$,
  370,
  $b49$Premium usado$b49$,
  $img49$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img49$,
  $alt49$Producto$alt49$,
  $vg49$[]$vg49$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  49,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id50$au-iphone-14-pro-128gb$id50$,
  $n50$IPHONE 14 PRO 128GB$n50$,
  $s50$Elegí color, calidad o batería abajo · stock real$s50$,
  $c50$iphone$c50$,
  440,
  $b50$Premium usado$b50$,
  $img50$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img50$,
  $alt50$Producto$alt50$,
  $vg50$[{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"absolute","options":[{"id":"au-iphone-14-pro-128gb-black-440","label":"BLACK","price":440},{"id":"au-iphone-14-pro-128gb-purple-500","label":"PURPLE","price":500},{"id":"au-iphone-14-pro-128gb-silver-580","label":"SILVER","price":580}]}]$vg50$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  50,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id51$au-iphone-14-pro-max-128gb-purple-560$id51$,
  $n51$IPHONE 14 PRO MAX 128GB$n51$,
  $s51$PURPLE · Calidad A/A+ · Batería 100% · 1 mes · +3 meses con cargador original$s51$,
  $c51$iphone$c51$,
  560,
  $b51$Premium usado$b51$,
  $img51$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img51$,
  $alt51$Producto$alt51$,
  $vg51$[]$vg51$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  51,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id52$au-iphone-14-pro-max-256gb-purple-590$id52$,
  $n52$IPHONE 14 PRO MAX 256GB$n52$,
  $s52$PURPLE · Calidad A/A+ · Batería 100% · 1 mes · +3 meses con cargador original$s52$,
  $c52$iphone$c52$,
  590,
  $b52$Premium usado$b52$,
  $img52$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img52$,
  $alt52$Producto$alt52$,
  $vg52$[]$vg52$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  52,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id53$au-iphone-15-128gb$id53$,
  $n53$IPHONE 15 128GB$n53$,
  $s53$Elegí color, calidad o batería abajo · stock real$s53$,
  $c53$iphone$c53$,
  430,
  $b53$Premium usado$b53$,
  $img53$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img53$,
  $alt53$Producto$alt53$,
  $vg53$[{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"absolute","options":[{"id":"au-iphone-15-128gb-black-430","label":"BLACK","price":430},{"id":"au-iphone-15-128gb-blue-yellow-490","label":"BLUE, YELLOW","price":490}]}]$vg53$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  53,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id54$au-iphone-15-pro-128gb-black-natural-590$id54$,
  $n54$IPHONE 15 PRO 128GB$n54$,
  $s54$BLACK, NATURAL · Calidad A/A+ · Batería 100% · 1 mes · +3 meses con cargador original$s54$,
  $c54$iphone$c54$,
  590,
  $b54$Premium usado$b54$,
  $img54$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img54$,
  $alt54$Producto$alt54$,
  $vg54$[]$vg54$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  54,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id55$au-iphone-15-pro-max-256gb-black-700$id55$,
  $n55$IPHONE 15 PRO MAX 256GB$n55$,
  $s55$BLACK · Calidad A/A+ · Batería 100% · 1 mes · +3 meses con cargador original$s55$,
  $c55$iphone$c55$,
  700,
  $b55$Premium usado$b55$,
  $img55$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img55$,
  $alt55$Producto$alt55$,
  $vg55$[]$vg55$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  55,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id56$au-iphone-16-128gb-white-black-660$id56$,
  $n56$IPHONE 16 128GB$n56$,
  $s56$WHITE, BLACK · Calidad A/A+ · Batería 93% o más · 1 mes · +3 meses con cargador original$s56$,
  $c56$iphone$c56$,
  660,
  $b56$Premium usado$b56$,
  $img56$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img56$,
  $alt56$Producto$alt56$,
  $vg56$[]$vg56$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  56,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id57$au-iphone-16-pro-128gb-black-desert-710$id57$,
  $n57$IPHONE 16 PRO 128GB$n57$,
  $s57$BLACK, DESERT · Calidad A/A+ · Batería 90% o más · 1 mes · +3 meses con cargador original$s57$,
  $c57$iphone$c57$,
  710,
  $b57$Premium usado$b57$,
  $img57$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img57$,
  $alt57$Producto$alt57$,
  $vg57$[]$vg57$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  57,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id58$au-iphone-16-pro-max-256gb-natural-870$id58$,
  $n58$IPHONE 16 PRO MAX 256GB$n58$,
  $s58$NATURAL · Calidad A/A+ · Batería 93% o más · 1 mes · +3 meses con cargador original$s58$,
  $c58$iphone$c58$,
  870,
  $b58$Premium usado$b58$,
  $img58$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img58$,
  $alt58$Producto$alt58$,
  $vg58$[]$vg58$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  58,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id59$au-iphone-17-pro-max-512gb-blue-1500$id59$,
  $n59$IPHONE 17 PRO MAX 512GB$n59$,
  $s59$BLUE · Calidad A+++ · Batería 100% · 1 mes · +3 meses con cargador original$s59$,
  $c59$iphone$c59$,
  1500,
  $b59$Premium usado$b59$,
  $img59$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img59$,
  $alt59$Producto$alt59$,
  $vg59$[]$vg59$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  59,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id60$om-parlante-sony-srs-xb13$id60$,
  $n60$Parlante Sony SRS-XB13$n60$,
  $s60$Capacidad, RAM o color según corresponda · elegí abajo$s60$,
  $c60$audio$c60$,
  60,
  $b60$Nuevo sellado$b60$,
  $img60$https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80$img60$,
  $alt60$Producto$alt60$,
  $vg60$[{"id":"presentacion","kind":"select","uiKind":"select","label":"Elegí la presentación","pricingMode":"absolute","options":[{"id":"om-parlante-sony-srs-xb13-60-0","label":"U$S 60","price":60},{"id":"om-parlante-sony-srs-xb13-60-1","label":"U$S 60","price":60},{"id":"om-parlante-sony-srs-xb13-70-2","label":"U$S 70","price":70}]}]$vg60$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  60,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id61$om-auriculares-airpods-2da-generacion-50-3$id61$,
  $n61$Auriculares AirPods 2da generación -$n61$,
  $s61$A confirmar según stock · consultá colores y stock$s61$,
  $c61$audio$c61$,
  50,
  $b61$Nuevo sellado$b61$,
  $img61$https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80$img61$,
  $alt61$Producto$alt61$,
  $vg61$[]$vg61$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  61,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id62$om-auriculares-bose-quietcomfort-360-55-4$id62$,
  $n62$Auriculares Bose QuietComfort 360 -$n62$,
  $s62$A confirmar según stock · consultá colores y stock$s62$,
  $c62$audio$c62$,
  55,
  $b62$Nuevo sellado$b62$,
  $img62$https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80$img62$,
  $alt62$Producto$alt62$,
  $vg62$[]$vg62$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  62,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id63$om-auriculares-bose-quietcomfort-45ii-55-5$id63$,
  $n63$Auriculares Bose QuietComfort 45II -$n63$,
  $s63$A confirmar según stock · consultá colores y stock$s63$,
  $c63$audio$c63$,
  55,
  $b63$Nuevo sellado$b63$,
  $img63$https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80$img63$,
  $alt63$Producto$alt63$,
  $vg63$[]$vg63$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  63,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id64$om-auriculares-jbl-tune-900-55-6$id64$,
  $n64$Auriculares JBL Tune 900 -$n64$,
  $s64$A confirmar según stock · consultá colores y stock$s64$,
  $c64$audio$c64$,
  55,
  $b64$Nuevo sellado$b64$,
  $img64$https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80$img64$,
  $alt64$Producto$alt64$,
  $vg64$[]$vg64$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  64,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id65$om-auriculares-jbl-rgb-tune-a8-55-7$id65$,
  $n65$Auriculares JBL RGB TUNE A8 -$n65$,
  $s65$A confirmar según stock · consultá colores y stock$s65$,
  $c65$audio$c65$,
  55,
  $b65$Nuevo sellado$b65$,
  $img65$https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80$img65$,
  $alt65$Producto$alt65$,
  $vg65$[]$vg65$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  65,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id66$om-parlante-jbl-xtreme-4-350-8$id66$,
  $n66$Parlante JBL Xtreme 4 -$n66$,
  $s66$Black, Blue · consultá colores y stock$s66$,
  $c66$audio$c66$,
  350,
  $b66$Nuevo sellado$b66$,
  $img66$https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80$img66$,
  $alt66$Producto$alt66$,
  $vg66$[]$vg66$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  66,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id67$om-parlante-jbl-flip-7-195-9$id67$,
  $n67$Parlante JBL Flip 7 -$n67$,
  $s67$Blue, Camuflado · consultá colores y stock$s67$,
  $c67$audio$c67$,
  195,
  $b67$Nuevo sellado$b67$,
  $img67$https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80$img67$,
  $alt67$Producto$alt67$,
  $vg67$[]$vg67$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  67,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id68$om-parlante-jbl-charge-5-190-10$id68$,
  $n68$Parlante JBL Charge 5 -$n68$,
  $s68$Red, Teal · consultá colores y stock$s68$,
  $c68$audio$c68$,
  190,
  $b68$Nuevo sellado$b68$,
  $img68$https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80$img68$,
  $alt68$Producto$alt68$,
  $vg68$[]$vg68$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  68,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id69$om-parlante-jbl-charge-6-230-11$id69$,
  $n69$Parlante JBL Charge 6 -$n69$,
  $s69$Black, Blue · consultá colores y stock$s69$,
  $c69$audio$c69$,
  230,
  $b69$Nuevo sellado$b69$,
  $img69$https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80$img69$,
  $alt69$Producto$alt69$,
  $vg69$[]$vg69$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  69,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id70$om-parlante-jbl-boombox-3-500-12$id70$,
  $n70$Parlante JBL Boombox 3 -$n70$,
  $s70$Camuflado · consultá colores y stock$s70$,
  $c70$audio$c70$,
  500,
  $b70$Nuevo sellado$b70$,
  $img70$https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80$img70$,
  $alt70$Producto$alt70$,
  $vg70$[]$vg70$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  70,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id71$om-parlante-jbl-boombox-3-wifi-540-13$id71$,
  $n71$Parlante JBL Boombox 3 WiFi -$n71$,
  $s71$Black · consultá colores y stock$s71$,
  $c71$audio$c71$,
  540,
  $b71$Nuevo sellado$b71$,
  $img71$https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80$img71$,
  $alt71$Producto$alt71$,
  $vg71$[]$vg71$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  71,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id72$om-parlante-jbl-partybox-essential-encore-2-400-14$id72$,
  $n72$Parlante JBL PartyBox Essential Encore 2 -$n72$,
  $s72$A confirmar según stock · consultá colores y stock$s72$,
  $c72$audio$c72$,
  400,
  $b72$Nuevo sellado$b72$,
  $img72$https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80$img72$,
  $alt72$Producto$alt72$,
  $vg72$[]$vg72$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  72,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id73$om-parlante-jbl-soundbar-500-pro-550-15$id73$,
  $n73$Parlante JBL Soundbar 500 Pro -$n73$,
  $s73$A confirmar según stock · consultá colores y stock$s73$,
  $c73$audio$c73$,
  550,
  $b73$Nuevo sellado$b73$,
  $img73$https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80$img73$,
  $alt73$Producto$alt73$,
  $vg73$[]$vg73$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  73,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id74$om-parlante-jbl-authentics-500-710-16$id74$,
  $n74$Parlante JBL Authentics 500 -$n74$,
  $s74$Black · consultá colores y stock$s74$,
  $c74$audio$c74$,
  710,
  $b74$Nuevo sellado$b74$,
  $img74$https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80$img74$,
  $alt74$Producto$alt74$,
  $vg74$[]$vg74$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  74,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id75$om-consolas-ps5-slim-digital-edition-1tb-600-17$id75$,
  $n75$Consolas PS5 Slim Digital Edition 1TB$n75$,
  $s75$A confirmar según stock · consultá colores y stock$s75$,
  $c75$consola$c75$,
  600,
  $b75$Nuevo sellado$b75$,
  $img75$https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80$img75$,
  $alt75$Producto$alt75$,
  $vg75$[]$vg75$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  75,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id76$om-consolas-ps5-slim-digital-fortnite-cobalt-star-bundle-1tb-615-18$id76$,
  $n76$Consolas PS5 Slim Digital "Fortnite Cobalt Star Bundle" 1TB$n76$,
  $s76$A confirmar según stock · consultá colores y stock$s76$,
  $c76$consola$c76$,
  615,
  $b76$Nuevo sellado$b76$,
  $img76$https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80$img76$,
  $alt76$Producto$alt76$,
  $vg76$[]$vg76$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  76,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id77$om-consolas-ps5-slim-digital-call-of-duty-black-ops-6-bundle-1tb-615-19$id77$,
  $n77$Consolas PS5 Slim Digital "Call of Duty: Black Ops 6" bundle 1TB$n77$,
  $s77$A confirmar según stock · consultá colores y stock$s77$,
  $c77$consola$c77$,
  615,
  $b77$Nuevo sellado$b77$,
  $img77$https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80$img77$,
  $alt77$Producto$alt77$,
  $vg77$[]$vg77$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  77,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id78$om-consolas-ps5-slim-con-lectora-1tb-670-20$id78$,
  $n78$Consolas PS5 Slim con lectora 1TB$n78$,
  $s78$A confirmar según stock · consultá colores y stock$s78$,
  $c78$consola$c78$,
  670,
  $b78$Nuevo sellado$b78$,
  $img78$https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80$img78$,
  $alt78$Producto$alt78$,
  $vg78$[]$vg78$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  78,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id79$om-consolas-ps5-slim-con-lectora-astro-bot-1tb-690-21$id79$,
  $n79$Consolas PS5 Slim con lectora + Astro Bot 1TB$n79$,
  $s79$A confirmar según stock · consultá colores y stock$s79$,
  $c79$consola$c79$,
  690,
  $b79$Nuevo sellado$b79$,
  $img79$https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80$img79$,
  $alt79$Producto$alt79$,
  $vg79$[]$vg79$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  79,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id80$om-consolas-ps5-slim-con-lectora-bundle-juegos-1tb-730-22$id80$,
  $n80$Consolas PS5 Slim con lectora (bundle juegos) 1TB$n80$,
  $s80$A confirmar según stock · consultá colores y stock$s80$,
  $c80$consola$c80$,
  730,
  $b80$Nuevo sellado$b80$,
  $img80$https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80$img80$,
  $alt80$Producto$alt80$,
  $vg80$[]$vg80$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  80,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id81$om-consolas-ps5-pro-digital-edition-2tb-1000-23$id81$,
  $n81$Consolas PS5 Pro Digital Edition 2TB$n81$,
  $s81$A confirmar según stock · consultá colores y stock$s81$,
  $c81$consola$c81$,
  1000,
  $b81$Nuevo sellado$b81$,
  $img81$https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80$img81$,
  $alt81$Producto$alt81$,
  $vg81$[]$vg81$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  81,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id82$om-consolas-ps5-portal-remote-player-400-24$id82$,
  $n82$Consolas PS5 Portal Remote Player -$n82$,
  $s82$A confirmar según stock · consultá colores y stock$s82$,
  $c82$consola$c82$,
  400,
  $b82$Nuevo sellado$b82$,
  $img82$https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80$img82$,
  $alt82$Producto$alt82$,
  $vg82$[]$vg82$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  82,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id83$om-consolas-joystick-dualsense-150-25$id83$,
  $n83$Consolas Joystick DualSense -$n83$,
  $s83$A confirmar según stock · consultá colores y stock$s83$,
  $c83$consola$c83$,
  150,
  $b83$Nuevo sellado$b83$,
  $img83$https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80$img83$,
  $alt83$Producto$alt83$,
  $vg83$[]$vg83$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  83,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id84$om-telefono-samsung-galaxy-a16-ds$id84$,
  $n84$Teléfono Samsung Galaxy A16 DS$n84$,
  $s84$Capacidad, RAM o color según corresponda · elegí abajo$s84$,
  $c84$smartphone$c84$,
  240,
  $b84$Nuevo sellado$b84$,
  $img84$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img84$,
  $alt84$Producto$alt84$,
  $vg84$[{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"absolute","options":[{"id":"om-telefono-samsung-galaxy-a16-ds-128gb-240-26","label":"Gray","price":240},{"id":"om-telefono-samsung-galaxy-a16-ds-128gb-260-27","label":"Blue, Black, Light Gray","price":260}]}]$vg84$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  84,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id85$om-telefono-samsung-galaxy-a26-ds-256gb-330-28$id85$,
  $n85$Teléfono Samsung Galaxy A26 DS 256GB · 8GB RAM$n85$,
  $s85$Black · consultá colores y stock$s85$,
  $c85$smartphone$c85$,
  330,
  $b85$Nuevo sellado$b85$,
  $img85$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img85$,
  $alt85$Producto$alt85$,
  $vg85$[]$vg85$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  85,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id86$om-telefono-samsung-galaxy-a36-ds-256gb-390-29$id86$,
  $n86$Teléfono Samsung Galaxy A36 DS 256GB · 8GB RAM$n86$,
  $s86$Black, Lime, White · consultá colores y stock$s86$,
  $c86$smartphone$c86$,
  390,
  $b86$Nuevo sellado$b86$,
  $img86$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img86$,
  $alt86$Producto$alt86$,
  $vg86$[]$vg86$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  86,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id87$om-telefono-samsung-galaxy-a56-ds-256gb-460-30$id87$,
  $n87$Teléfono Samsung Galaxy A56 DS 256GB · 8GB RAM$n87$,
  $s87$Graph, Gray · consultá colores y stock$s87$,
  $c87$smartphone$c87$,
  460,
  $b87$Nuevo sellado$b87$,
  $img87$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img87$,
  $alt87$Producto$alt87$,
  $vg87$[]$vg87$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  87,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id88$om-telefono-samsung-s24-fe-256gb-600-31$id88$,
  $n88$Teléfono Samsung S24 FE 256GB · 8GB RAM$n88$,
  $s88$A confirmar según stock · consultá colores y stock$s88$,
  $c88$smartphone$c88$,
  600,
  $b88$Nuevo sellado$b88$,
  $img88$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img88$,
  $alt88$Producto$alt88$,
  $vg88$[]$vg88$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  88,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id89$om-telefono-samsung-s24-128gb-660-32$id89$,
  $n89$Teléfono Samsung S24 128GB · 8GB RAM$n89$,
  $s89$A confirmar según stock · consultá colores y stock$s89$,
  $c89$smartphone$c89$,
  660,
  $b89$Nuevo sellado$b89$,
  $img89$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img89$,
  $alt89$Producto$alt89$,
  $vg89$[]$vg89$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  89,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id90$om-telefono-samsung-s24-ultra-256gb-890-33$id90$,
  $n90$Teléfono Samsung S24 Ultra 256GB · 12GB RAM$n90$,
  $s90$A confirmar según stock · consultá colores y stock$s90$,
  $c90$smartphone$c90$,
  890,
  $b90$Nuevo sellado$b90$,
  $img90$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img90$,
  $alt90$Producto$alt90$,
  $vg90$[]$vg90$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  90,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id91$om-telefono-samsung-s25-ds-ice-blue-128gb-710-34$id91$,
  $n91$Teléfono Samsung S25 DS Ice Blue 128GB · 12GB RAM$n91$,
  $s91$A confirmar según stock · consultá colores y stock$s91$,
  $c91$smartphone$c91$,
  710,
  $b91$Nuevo sellado$b91$,
  $img91$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img91$,
  $alt91$Producto$alt91$,
  $vg91$[]$vg91$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  91,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id92$om-telefono-samsung-s25-256gb-820-35$id92$,
  $n92$Teléfono Samsung S25 256GB · 12GB RAM$n92$,
  $s92$A confirmar según stock · consultá colores y stock$s92$,
  $c92$smartphone$c92$,
  820,
  $b92$Nuevo sellado$b92$,
  $img92$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img92$,
  $alt92$Producto$alt92$,
  $vg92$[]$vg92$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  92,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id93$om-telefono-samsung-s25-ultra-ds$id93$,
  $n93$Teléfono Samsung S25 Ultra DS$n93$,
  $s93$Capacidad, RAM o color según corresponda · elegí abajo$s93$,
  $c93$smartphone$c93$,
  1040,
  $b93$Nuevo sellado$b93$,
  $img93$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img93$,
  $alt93$Producto$alt93$,
  $vg93$[{"id":"almacenamiento","kind":"storage","uiKind":"storage","label":"Capacidad","pricingMode":"absolute","options":[{"id":"om-telefono-samsung-s25-ultra-ds-256gb-1040-36","label":"256GB","price":1040},{"id":"om-telefono-samsung-s25-ultra-ds-512gb-1150-37","label":"512GB","price":1150}]}]$vg93$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  93,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id94$om-telefono-samsung-z-flip-7-512gb-1080-38$id94$,
  $n94$Teléfono Samsung Z Flip 7 512GB · 12GB RAM$n94$,
  $s94$A confirmar según stock · consultá colores y stock$s94$,
  $c94$smartphone$c94$,
  1080,
  $b94$Nuevo sellado$b94$,
  $img94$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img94$,
  $alt94$Producto$alt94$,
  $vg94$[]$vg94$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  94,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id95$om-tablet-redmi-pad-se-1-128gb-280-39$id95$,
  $n95$Tablet Redmi Pad SE 1 128GB · 6GB RAM$n95$,
  $s95$A confirmar según stock · consultá colores y stock$s95$,
  $c95$otros$c95$,
  280,
  $b95$Nuevo sellado$b95$,
  $img95$https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80$img95$,
  $alt95$Producto$alt95$,
  $vg95$[]$vg95$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  95,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id96$om-telefono-poco-f6-pro-512gb-550-40$id96$,
  $n96$Teléfono Poco F6 Pro 512GB · 12GB RAM$n96$,
  $s96$A confirmar según stock · consultá colores y stock$s96$,
  $c96$smartphone$c96$,
  550,
  $b96$Nuevo sellado$b96$,
  $img96$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img96$,
  $alt96$Producto$alt96$,
  $vg96$[]$vg96$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  96,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id97$om-telefono-redmi-note-13-pro-plus-512gb-430-41$id97$,
  $n97$Teléfono Redmi Note 13 Pro Plus 512GB · 12GB RAM$n97$,
  $s97$A confirmar según stock · consultá colores y stock$s97$,
  $c97$smartphone$c97$,
  430,
  $b97$Nuevo sellado$b97$,
  $img97$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img97$,
  $alt97$Producto$alt97$,
  $vg97$[]$vg97$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  97,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id98$om-telefono-redmi-note-14-pro-plus-256gb-430-42$id98$,
  $n98$Teléfono Redmi Note 14 Pro Plus 256GB · 8GB RAM$n98$,
  $s98$A confirmar según stock · consultá colores y stock$s98$,
  $c98$smartphone$c98$,
  430,
  $b98$Nuevo sellado$b98$,
  $img98$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img98$,
  $alt98$Producto$alt98$,
  $vg98$[]$vg98$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  98,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id99$om-telefono-poco-x7-pro-512gb-460-43$id99$,
  $n99$Teléfono Poco X7 Pro 512GB · 12GB RAM$n99$,
  $s99$A confirmar según stock · consultá colores y stock$s99$,
  $c99$smartphone$c99$,
  460,
  $b99$Nuevo sellado$b99$,
  $img99$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img99$,
  $alt99$Producto$alt99$,
  $vg99$[]$vg99$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  99,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id100$om-telefono-motorola-g15-256gb-230-44$id100$,
  $n100$Teléfono Motorola G15 256GB · 4GB RAM$n100$,
  $s100$A confirmar según stock · consultá colores y stock$s100$,
  $c100$smartphone$c100$,
  230,
  $b100$Nuevo sellado$b100$,
  $img100$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img100$,
  $alt100$Producto$alt100$,
  $vg100$[]$vg100$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  100,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id101$om-telefono-motorola-g55-256gb-280-45$id101$,
  $n101$Teléfono Motorola G55 256GB · 8GB RAM$n101$,
  $s101$A confirmar según stock · consultá colores y stock$s101$,
  $c101$smartphone$c101$,
  280,
  $b101$Nuevo sellado$b101$,
  $img101$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img101$,
  $alt101$Producto$alt101$,
  $vg101$[]$vg101$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  101,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id102$om-telefono-motorola-g85-256gb-330-46$id102$,
  $n102$Teléfono Motorola G85 256GB · 8GB RAM$n102$,
  $s102$A confirmar según stock · consultá colores y stock$s102$,
  $c102$smartphone$c102$,
  330,
  $b102$Nuevo sellado$b102$,
  $img102$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img102$,
  $alt102$Producto$alt102$,
  $vg102$[]$vg102$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  102,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id103$om-telefono-motorola-edge-50-fusion-256gb-340-47$id103$,
  $n103$Teléfono Motorola Edge 50 Fusion 256GB · 8GB RAM$n103$,
  $s103$A confirmar según stock · consultá colores y stock$s103$,
  $c103$smartphone$c103$,
  340,
  $b103$Nuevo sellado$b103$,
  $img103$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img103$,
  $alt103$Producto$alt103$,
  $vg103$[]$vg103$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  103,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id104$om-telefono-motorola-edge-50-pro-512gb-560-48$id104$,
  $n104$Teléfono Motorola Edge 50 Pro 512GB · 12GB RAM$n104$,
  $s104$A confirmar según stock · consultá colores y stock$s104$,
  $c104$smartphone$c104$,
  560,
  $b104$Nuevo sellado$b104$,
  $img104$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img104$,
  $alt104$Producto$alt104$,
  $vg104$[]$vg104$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  104,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id105$om-telefono-motorola-razr-50-ultra-512gb-810-49$id105$,
  $n105$Teléfono Motorola Razr 50 Ultra 512GB · 12GB RAM$n105$,
  $s105$A confirmar según stock · consultá colores y stock$s105$,
  $c105$smartphone$c105$,
  810,
  $b105$Nuevo sellado$b105$,
  $img105$https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80$img105$,
  $alt105$Producto$alt105$,
  $vg105$[]$vg105$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  105,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id106$nb-notebook-gamer-asus-vivobook-k3605vu-ws96-1580-0$id106$,
  $n106$ASUS VivoBook K3605VU-WS96$n106$,
  $s106$Core i9-13900H · 16" 1920×1200 · RTX 4050 6GB · 1TB SSD · 16GB · Silver$s106$,
  $c106$notebook$c106$,
  1580,
  $b106$Gaming$b106$,
  $img106$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img106$,
  $alt106$Producto$alt106$,
  $vg106$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-asus-vivobook-k3605vu-ws96-1580-0-disco","label":"1TB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-asus-vivobook-k3605vu-ws96-1580-0-ram","label":"16GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-asus-vivobook-k3605vu-ws96-1580-0-color","label":"Silver","priceDelta":0}]}]$vg106$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  106,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id107$nb-notebook-gamer-asus-tuf-f16-fx608jmr-1950-1$id107$,
  $n107$Asus TUF F16 FX608JMR$n107$,
  $s107$Core i7-14650HX · 16" 165Hz · RTX 5060 8GB · 1TB SSD · 32GB · Jaeger Gray$s107$,
  $c107$notebook$c107$,
  1950,
  $b107$Gaming$b107$,
  $img107$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img107$,
  $alt107$Producto$alt107$,
  $vg107$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-asus-tuf-f16-fx608jmr-1950-1-disco","label":"1TB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-asus-tuf-f16-fx608jmr-1950-1-ram","label":"32GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-asus-tuf-f16-fx608jmr-1950-1-color","label":"Jaeger Gray","priceDelta":0}]}]$vg107$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  107,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id108$nb-notebook-gamer-asus-tuf-a16-fa608up-2000-2$id108$,
  $n108$Asus TUF A16 FA608UP$n108$,
  $s108$AMD Ryzen AI 9 270 · 16" 165Hz · RTX 5070 8GB · 1TB SSD · 32GB · Jaeger Gray$s108$,
  $c108$notebook$c108$,
  2000,
  $b108$Gaming$b108$,
  $img108$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img108$,
  $alt108$Producto$alt108$,
  $vg108$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-asus-tuf-a16-fa608up-2000-2-disco","label":"1TB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-asus-tuf-a16-fa608up-2000-2-ram","label":"32GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-asus-tuf-a16-fa608up-2000-2-color","label":"Jaeger Gray","priceDelta":0}]}]$vg108$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  108,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id109$nb-notebook-gamer-asus-tuf-a16-fa617nt-1450-3$id109$,
  $n109$Asus TUF A16 FA617NT$n109$,
  $s109$AMD Ryzen 7 7735HS · 16" 165Hz · RX 7700S 8GB · 512GB SSD · 16GB · Off Black$s109$,
  $c109$notebook$c109$,
  1450,
  $b109$Gaming$b109$,
  $img109$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img109$,
  $alt109$Producto$alt109$,
  $vg109$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-asus-tuf-a16-fa617nt-1450-3-disco","label":"512GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-asus-tuf-a16-fa617nt-1450-3-ram","label":"16GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-asus-tuf-a16-fa617nt-1450-3-color","label":"Off Black","priceDelta":0}]}]$vg109$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  109,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id110$nb-notebook-gamer-hp-omen-16-ap0053-1900-4$id110$,
  $n110$HP Omen 16-AP0053$n110$,
  $s110$AMD Ryzen 9 8940HX · 16" 144Hz · RTX 5060 8GB · 1TB SSD · 32GB · Shadow Black$s110$,
  $c110$notebook$c110$,
  1900,
  $b110$Gaming$b110$,
  $img110$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img110$,
  $alt110$Producto$alt110$,
  $vg110$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-hp-omen-16-ap0053-1900-4-disco","label":"1TB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-hp-omen-16-ap0053-1900-4-ram","label":"32GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-hp-omen-16-ap0053-1900-4-color","label":"Shadow Black","priceDelta":0}]}]$vg110$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  110,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id111$nb-notebook-gamer-hp-victus-15-fb2082wm-1260-5$id111$,
  $n111$HP Victus 15-fb2082wm$n111$,
  $s111$AMD Ryzen 5 8645HS · 15.6" FHD 144Hz · RTX 4050 6GB · 512GB SSD · 8GB · A confirmar según stock$s111$,
  $c111$notebook$c111$,
  1260,
  $b111$Gaming$b111$,
  $img111$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img111$,
  $alt111$Producto$alt111$,
  $vg111$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-hp-victus-15-fb2082wm-1260-5-disco","label":"512GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-hp-victus-15-fb2082wm-1260-5-ram","label":"8GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-hp-victus-15-fb2082wm-1260-5-color","label":"A confirmar según stock","priceDelta":0}]}]$vg111$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  111,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id112$nb-notebook-gamer-hp-victus-15-fa0033dx-1150-6$id112$,
  $n112$HP Victus 15-fa0033dx$n112$,
  $s112$Intel Core i5-12450H · 15.6" FHD 144Hz · RTX 3050 4GB · 512GB SSD · 8GB · A confirmar según stock$s112$,
  $c112$notebook$c112$,
  1150,
  $b112$Gaming$b112$,
  $img112$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img112$,
  $alt112$Producto$alt112$,
  $vg112$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-hp-victus-15-fa0033dx-1150-6-disco","label":"512GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-hp-victus-15-fa0033dx-1150-6-ram","label":"8GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-hp-victus-15-fa0033dx-1150-6-color","label":"A confirmar según stock","priceDelta":0}]}]$vg112$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  112,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id113$nb-notebook-gamer-hp-victus-15-fb2063-990-7$id113$,
  $n113$HP Victus 15-FB2063$n113$,
  $s113$AMD Ryzen 5 7535HS · 15.6" FHD · RX 6550M 4GB · 512GB SSD · 8GB · Mica Silver$s113$,
  $c113$notebook$c113$,
  990,
  $b113$Gaming$b113$,
  $img113$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img113$,
  $alt113$Producto$alt113$,
  $vg113$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-hp-victus-15-fb2063-990-7-disco","label":"512GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-hp-victus-15-fb2063-990-7-ram","label":"8GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-hp-victus-15-fb2063-990-7-color","label":"Mica Silver","priceDelta":0}]}]$vg113$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  113,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id114$nb-notebook-gamer-hp-victus-15-fa11633dx-1470-8$id114$,
  $n114$HP Victus 15-FA11633dx$n114$,
  $s114$Intel Core i7-12650H · - · RTX 4050 6GB · 512GB SSD · 16GB · A confirmar según stock$s114$,
  $c114$notebook$c114$,
  1470,
  $b114$Gaming$b114$,
  $img114$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img114$,
  $alt114$Producto$alt114$,
  $vg114$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-hp-victus-15-fa11633dx-1470-8-disco","label":"512GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-hp-victus-15-fa11633dx-1470-8-ram","label":"16GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-hp-victus-15-fa11633dx-1470-8-color","label":"A confirmar según stock","priceDelta":0}]}]$vg114$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  114,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id115$nb-notebook-gamer-lenovo-legion-pro-5-16iax10-2500-9$id115$,
  $n115$Lenovo Legion Pro 5 16IAX10$n115$,
  $s115$Core Ultra 7 255HX · 16" OLED 165Hz · RTX 5070 8GB · 1TB SSD · 32GB · Eclipse Gray$s115$,
  $c115$notebook$c115$,
  2500,
  $b115$Gaming$b115$,
  $img115$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img115$,
  $alt115$Producto$alt115$,
  $vg115$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-lenovo-legion-pro-5-16iax10-2500-9-disco","label":"1TB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-lenovo-legion-pro-5-16iax10-2500-9-ram","label":"32GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-lenovo-legion-pro-5-16iax10-2500-9-color","label":"Eclipse Gray","priceDelta":0}]}]$vg115$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  115,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id116$nb-notebook-gamer-lenovo-loq-15iax9e-940-10$id116$,
  $n116$Lenovo LOQ 15IAX9E$n116$,
  $s116$Core i5-12450HX · 15.6" FHD 144Hz · RTX 2050 4GB · 512GB SSD · 8GB · Luna Gray$s116$,
  $c116$notebook$c116$,
  940,
  $b116$Gaming$b116$,
  $img116$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img116$,
  $alt116$Producto$alt116$,
  $vg116$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-lenovo-loq-15iax9e-940-10-disco","label":"512GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-lenovo-loq-15iax9e-940-10-ram","label":"8GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-lenovo-loq-15iax9e-940-10-color","label":"Luna Gray","priceDelta":0}]}]$vg116$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  116,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id117$nb-notebook-gamer-lenovo-loq-15arp9-1500-11$id117$,
  $n117$Lenovo LOQ 15ARP9$n117$,
  $s117$AMD Ryzen 7 7435HS · 15.6" FHD 144Hz · RTX 4070 8GB · 512GB SSD · 16GB · Luna Gray$s117$,
  $c117$notebook$c117$,
  1500,
  $b117$Gaming$b117$,
  $img117$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img117$,
  $alt117$Producto$alt117$,
  $vg117$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-lenovo-loq-15arp9-1500-11-disco","label":"512GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-lenovo-loq-15arp9-1500-11-ram","label":"16GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-lenovo-loq-15arp9-1500-11-color","label":"Luna Gray","priceDelta":0}]}]$vg117$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  117,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id118$nb-notebook-gamer-lenovo-loq-83gs001cus-1140-12$id118$,
  $n118$Lenovo LOQ 83GS001CUS$n118$,
  $s118$Core i5-12450HX · 15.6" FHD Touch · RTX 3050 6GB · 512GB SSD · 12GB · Luna Gray$s118$,
  $c118$notebook$c118$,
  1140,
  $b118$Gaming$b118$,
  $img118$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img118$,
  $alt118$Producto$alt118$,
  $vg118$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-lenovo-loq-83gs001cus-1140-12-disco","label":"512GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-lenovo-loq-83gs001cus-1140-12-ram","label":"12GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-lenovo-loq-83gs001cus-1140-12-color","label":"Luna Gray","priceDelta":0}]}]$vg118$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  118,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id119$nb-notebook-gamer-msi-thin-15-b13vf-1180-13$id119$,
  $n119$MSI Thin 15 B13VF$n119$,
  $s119$Core i5-13420H · 15.6" FHD 144Hz · RTX 4060 6GB · 512GB SSD · 16GB · Gray$s119$,
  $c119$notebook$c119$,
  1180,
  $b119$Gaming$b119$,
  $img119$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img119$,
  $alt119$Producto$alt119$,
  $vg119$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-msi-thin-15-b13vf-1180-13-disco","label":"512GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-msi-thin-15-b13vf-1180-13-ram","label":"16GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-msi-thin-15-b13vf-1180-13-color","label":"Gray","priceDelta":0}]}]$vg119$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  119,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id120$nb-notebook-gamer-msi-cyborg-a13ve-218us-1300-14$id120$,
  $n120$MSI Cyborg A13VE-218US$n120$,
  $s120$Core i7-13620H · 15.6" FHD · RTX 4050 6GB · 512GB SSD · 16GB · Black$s120$,
  $c120$notebook$c120$,
  1300,
  $b120$Gaming$b120$,
  $img120$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img120$,
  $alt120$Producto$alt120$,
  $vg120$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-msi-cyborg-a13ve-218us-1300-14-disco","label":"512GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-msi-cyborg-a13ve-218us-1300-14-ram","label":"16GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-msi-cyborg-a13ve-218us-1300-14-color","label":"Black","priceDelta":0}]}]$vg120$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  120,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id121$nb-notebook-gamer-msi-vector-3290-15$id121$,
  $n121$MSI Vector$n121$,
  $s121$Core Ultra 9 275HX · 16" 240Hz · RTX 5080 16GB · 1TB SSD · 16GB · A confirmar según stock$s121$,
  $c121$notebook$c121$,
  3290,
  $b121$Gaming$b121$,
  $img121$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img121$,
  $alt121$Producto$alt121$,
  $vg121$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-msi-vector-3290-15-disco","label":"1TB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-msi-vector-3290-15-ram","label":"16GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-gamer-msi-vector-3290-15-color","label":"A confirmar según stock","priceDelta":0}]}]$vg121$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  121,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id122$nb-notebook-oficina-acer-aspire-3-a314-36p-680-16$id122$,
  $n122$Acer Aspire 3 A314-36P$n122$,
  $s122$Core i3-N305 · 14" FHD · - · 128GB SSD · 8GB · A confirmar según stock$s122$,
  $c122$notebook$c122$,
  680,
  $b122$Oficina$b122$,
  $img122$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img122$,
  $alt122$Producto$alt122$,
  $vg122$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-acer-aspire-3-a314-36p-680-16-disco","label":"128GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-acer-aspire-3-a314-36p-680-16-ram","label":"8GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-acer-aspire-3-a314-36p-680-16-color","label":"A confirmar según stock","priceDelta":0}]}]$vg122$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  122,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id123$nb-notebook-oficina-acer-aspire-vero-av16-51p-880-17$id123$,
  $n123$Acer Aspire Vero AV16-51P$n123$,
  $s123$Core Ultra 5 125U · 16" 1920×1200 · - · 512GB SSD · 8GB · A confirmar según stock$s123$,
  $c123$notebook$c123$,
  880,
  $b123$Oficina$b123$,
  $img123$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img123$,
  $alt123$Producto$alt123$,
  $vg123$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-acer-aspire-vero-av16-51p-880-17-disco","label":"512GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-acer-aspire-vero-av16-51p-880-17-ram","label":"8GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-acer-aspire-vero-av16-51p-880-17-color","label":"A confirmar según stock","priceDelta":0}]}]$vg123$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  123,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id124$nb-notebook-oficina-acer-swift-14-ai-sf14-61t-1430-18$id124$,
  $n124$Acer Swift 14 AI SF14-61T$n124$,
  $s124$Ryzen AI 9 365 · 14" WUXGA Touch · - · 1TB SSD · 32GB · Pure Silver$s124$,
  $c124$notebook$c124$,
  1430,
  $b124$Oficina$b124$,
  $img124$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img124$,
  $alt124$Producto$alt124$,
  $vg124$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-acer-swift-14-ai-sf14-61t-1430-18-disco","label":"1TB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-acer-swift-14-ai-sf14-61t-1430-18-ram","label":"32GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-acer-swift-14-ai-sf14-61t-1430-18-color","label":"Pure Silver","priceDelta":0}]}]$vg124$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  124,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id125$nb-notebook-oficina-asus-vivobook-f1404vap-790-19$id125$,
  $n125$Asus VivoBook F1404VAP$n125$,
  $s125$Core 5 120U · 14" FHD · - · 512GB SSD · 8GB · Quiet Blue$s125$,
  $c125$notebook$c125$,
  790,
  $b125$Oficina$b125$,
  $img125$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img125$,
  $alt125$Producto$alt125$,
  $vg125$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-asus-vivobook-f1404vap-790-19-disco","label":"512GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-asus-vivobook-f1404vap-790-19-ram","label":"8GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-asus-vivobook-f1404vap-790-19-color","label":"Quiet Blue","priceDelta":0}]}]$vg125$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  125,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id126$nb-notebook-oficina-asus-vivobook-e1504ga-wb31-660-20$id126$,
  $n126$ASUS Vivobook E1504GA-WB31$n126$,
  $s126$Core i3-N305 · 15.6" FHD · - · 128GB · 8GB · Black$s126$,
  $c126$notebook$c126$,
  660,
  $b126$Oficina$b126$,
  $img126$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img126$,
  $alt126$Producto$alt126$,
  $vg126$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-asus-vivobook-e1504ga-wb31-660-20-disco","label":"128GB","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-asus-vivobook-e1504ga-wb31-660-20-ram","label":"8GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-asus-vivobook-e1504ga-wb31-660-20-color","label":"Black","priceDelta":0}]}]$vg126$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  126,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id127$nb-notebook-oficina-asus-vivobook-core-i5-1235u-860-21$id127$,
  $n127$ASUS VivoBook (Core i5-1235U)$n127$,
  $s127$Core i5-1235U · 15.6" FHD · - · 512GB SSD · 8GB · Quiet Blue$s127$,
  $c127$notebook$c127$,
  860,
  $b127$Oficina$b127$,
  $img127$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img127$,
  $alt127$Producto$alt127$,
  $vg127$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-asus-vivobook-core-i5-1235u-860-21-disco","label":"512GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-asus-vivobook-core-i5-1235u-860-21-ram","label":"8GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-asus-vivobook-core-i5-1235u-860-21-color","label":"Quiet Blue","priceDelta":0}]}]$vg127$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  127,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id128$nb-notebook-oficina-asus-vivobook-s-16-flip-tp3604va-1400-22$id128$,
  $n128$Asus VivoBook S 16 Flip TP3604VA$n128$,
  $s128$Core i9-13900H · 16" Touch · - · 1TB SSD · 16GB · Midnight Black$s128$,
  $c128$notebook$c128$,
  1400,
  $b128$Oficina$b128$,
  $img128$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img128$,
  $alt128$Producto$alt128$,
  $vg128$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-asus-vivobook-s-16-flip-tp3604va-1400-22-disco","label":"1TB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-asus-vivobook-s-16-flip-tp3604va-1400-22-ram","label":"16GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-asus-vivobook-s-16-flip-tp3604va-1400-22-color","label":"Midnight Black","priceDelta":0}]}]$vg128$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  128,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id129$nb-notebook-oficina-dell-inspiron-14-5440-5463blk-860-23$id129$,
  $n129$Dell Inspiron 14 5440-5463BLK$n129$,
  $s129$Core i5-1334U · 14" 1920×1200 · - · 512GB SSD · 8GB · Carbon Black$s129$,
  $c129$notebook$c129$,
  860,
  $b129$Oficina$b129$,
  $img129$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img129$,
  $alt129$Producto$alt129$,
  $vg129$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-dell-inspiron-14-5440-5463blk-860-23-disco","label":"512GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-dell-inspiron-14-5440-5463blk-860-23-ram","label":"8GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-dell-inspiron-14-5440-5463blk-860-23-color","label":"Carbon Black","priceDelta":0}]}]$vg129$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  129,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id130$nb-notebook-oficina-dell-inspiron-dc15250-1020-24$id130$,
  $n130$Dell Inspiron DC15250$n130$,
  $s130$Core i7-1355U · 15.6" FHD · - · 1TB SSD · 16GB · Platinum Silver$s130$,
  $c130$notebook$c130$,
  1020,
  $b130$Oficina$b130$,
  $img130$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img130$,
  $alt130$Producto$alt130$,
  $vg130$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-dell-inspiron-dc15250-1020-24-disco","label":"1TB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-dell-inspiron-dc15250-1020-24-ram","label":"16GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-dell-inspiron-dc15250-1020-24-color","label":"Platinum Silver","priceDelta":0}]}]$vg130$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  130,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id131$nb-notebook-oficina-dell-inspiron-16-plus-7640-1420-25$id131$,
  $n131$Dell Inspiron 16 Plus 7640$n131$,
  $s131$Core Ultra 9-185H · 16" · - · 512GB SSD · 16GB · Ice Blue$s131$,
  $c131$notebook$c131$,
  1420,
  $b131$Oficina$b131$,
  $img131$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img131$,
  $alt131$Producto$alt131$,
  $vg131$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-dell-inspiron-16-plus-7640-1420-25-disco","label":"512GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-dell-inspiron-16-plus-7640-1420-25-ram","label":"16GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-dell-inspiron-16-plus-7640-1420-25-color","label":"Ice Blue","priceDelta":0}]}]$vg131$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  131,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id132$nb-notebook-oficina-hp-laptop-15-dy5131wm-750-26$id132$,
  $n132$HP Laptop 15-dy5131wm$n132$,
  $s132$Core i3-1215U · 15.6" FHD · - · 256GB SSD · 8GB · Silver$s132$,
  $c132$notebook$c132$,
  750,
  $b132$Oficina$b132$,
  $img132$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img132$,
  $alt132$Producto$alt132$,
  $vg132$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-hp-laptop-15-dy5131wm-750-26-disco","label":"256GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-hp-laptop-15-dy5131wm-750-26-ram","label":"8GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-hp-laptop-15-dy5131wm-750-26-color","label":"Silver","priceDelta":0}]}]$vg132$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  132,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id133$nb-notebook-oficina-hp-laptop-15-fc0013la-1140-27$id133$,
  $n133$HP Laptop 15-fc0013la$n133$,
  $s133$AMD Ryzen 7-7730U · 15.6" FHD · - · 512GB SSD · 16GB · Silver$s133$,
  $c133$notebook$c133$,
  1140,
  $b133$Oficina$b133$,
  $img133$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img133$,
  $alt133$Producto$alt133$,
  $vg133$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-hp-laptop-15-fc0013la-1140-27-disco","label":"512GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-hp-laptop-15-fc0013la-1140-27-ram","label":"16GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-hp-laptop-15-fc0013la-1140-27-color","label":"Silver","priceDelta":0}]}]$vg133$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  133,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id134$nb-notebook-oficina-hp-laptop-15-fc0043la-840-28$id134$,
  $n134$HP Laptop 15-fc0043la$n134$,
  $s134$AMD Ryzen 3-7320U · 15.6" FHD · - · 256GB SSD · 8GB · Gold$s134$,
  $c134$notebook$c134$,
  840,
  $b134$Oficina$b134$,
  $img134$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img134$,
  $alt134$Producto$alt134$,
  $vg134$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-hp-laptop-15-fc0043la-840-28-disco","label":"256GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-hp-laptop-15-fc0043la-840-28-ram","label":"8GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-hp-laptop-15-fc0043la-840-28-color","label":"Gold","priceDelta":0}]}]$vg134$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  134,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id135$nb-notebook-oficina-hp-omnibook-5-flip-14-fp0023dx-1080-29$id135$,
  $n135$HP OmniBook 5 Flip 14-fp0023dx$n135$,
  $s135$Core 7 150U · 14" 2K Touch · - · 512GB SSD · 16GB · -$s135$,
  $c135$notebook$c135$,
  1080,
  $b135$Oficina$b135$,
  $img135$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img135$,
  $alt135$Producto$alt135$,
  $vg135$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-hp-omnibook-5-flip-14-fp0023dx-1080-29-disco","label":"512GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-hp-omnibook-5-flip-14-fp0023dx-1080-29-ram","label":"16GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-hp-omnibook-5-flip-14-fp0023dx-1080-29-color","label":"-","priceDelta":0}]}]$vg135$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  135,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id136$nb-notebook-oficina-lenovo-ideapad-1-82vg00tyus-860-30$id136$,
  $n136$Lenovo IdeaPad 1 82VG00TYUS$n136$,
  $s136$AMD Ryzen 5 7520U · 15.6" FHD Touch · - · 256GB SSD · 8GB · Abyss Blue$s136$,
  $c136$notebook$c136$,
  860,
  $b136$Oficina$b136$,
  $img136$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img136$,
  $alt136$Producto$alt136$,
  $vg136$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-lenovo-ideapad-1-82vg00tyus-860-30-disco","label":"256GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-lenovo-ideapad-1-82vg00tyus-860-30-ram","label":"8GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-lenovo-ideapad-1-82vg00tyus-860-30-color","label":"Abyss Blue","priceDelta":0}]}]$vg136$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  136,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id137$nb-notebook-oficina-lenovo-3-14alc6-920-31$id137$,
  $n137$Lenovo 3 14ALC6$n137$,
  $s137$Ryzen 7 5700U · 14" FHD · - · 512GB SSD · 8GB · Arctic Grey$s137$,
  $c137$notebook$c137$,
  920,
  $b137$Oficina$b137$,
  $img137$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img137$,
  $alt137$Producto$alt137$,
  $vg137$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-lenovo-3-14alc6-920-31-disco","label":"512GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-lenovo-3-14alc6-920-31-ram","label":"8GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-lenovo-3-14alc6-920-31-color","label":"Arctic Grey","priceDelta":0}]}]$vg137$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  137,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id138$nb-notebook-oficina-msi-modern-c1mtg-084us-1410-32$id138$,
  $n138$MSI Modern C1MTG-084US$n138$,
  $s138$Core Ultra 9-185H · 15.6" FHD Touch · - · 1TB SSD · 32GB · Black$s138$,
  $c138$notebook$c138$,
  1410,
  $b138$Oficina$b138$,
  $img138$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img138$,
  $alt138$Producto$alt138$,
  $vg138$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-msi-modern-c1mtg-084us-1410-32-disco","label":"1TB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-msi-modern-c1mtg-084us-1410-32-ram","label":"32GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-msi-modern-c1mtg-084us-1410-32-color","label":"Black","priceDelta":0}]}]$vg138$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  138,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id139$nb-notebook-oficina-samsung-book4-360-np750qgk-1350-33$id139$,
  $n139$Samsung Book4 360 NP750QGK$n139$,
  $s139$Core 7 150U · 15.6" Touch AMOLED · - · 512GB SSD · 16GB · Grey$s139$,
  $c139$notebook$c139$,
  1350,
  $b139$Oficina$b139$,
  $img139$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img139$,
  $alt139$Producto$alt139$,
  $vg139$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-samsung-book4-360-np750qgk-1350-33-disco","label":"512GB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-samsung-book4-360-np750qgk-1350-33-ram","label":"16GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-notebook-oficina-samsung-book4-360-np750qgk-1350-33-color","label":"Grey","priceDelta":0}]}]$vg139$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  139,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id140$nb-pc-escritorio-asus-rog-strix-g16ch-rtx-4060-1800-34$id140$,
  $n140$Asus ROG Strix G16CH (RTX 4060)$n140$,
  $s140$Core i7-13700F · - · RTX 4060 8GB · 1TB SSD · 32GB · Black$s140$,
  $c140$notebook$c140$,
  1800,
  $b140$Oficina$b140$,
  $img140$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img140$,
  $alt140$Producto$alt140$,
  $vg140$[{"id":"disco","kind":"storage","uiKind":"storage","label":"Disco","pricingMode":"delta","options":[{"id":"nb-pc-escritorio-asus-rog-strix-g16ch-rtx-4060-1800-34-disco","label":"1TB SSD","priceDelta":0}]},{"id":"ram","kind":"select","uiKind":"select","label":"RAM","pricingMode":"delta","options":[{"id":"nb-pc-escritorio-asus-rog-strix-g16ch-rtx-4060-1800-34-ram","label":"32GB","priceDelta":0}]},{"id":"color","kind":"color","uiKind":"color","label":"Color","pricingMode":"delta","options":[{"id":"nb-pc-escritorio-asus-rog-strix-g16ch-rtx-4060-1800-34-color","label":"Black","priceDelta":0}]}]$vg140$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  140,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id141$acn-adaptador-carga-normal-0$id141$,
  $n141$Adaptador Carga normal 5W · Réplica exacta$n141$,
  $s141$Carga normal · Réplica exacta$s141$,
  $c141$accesorio_nuevo$c141$,
  15000,
  $b141$Nuevo$b141$,
  $img141$https://images.unsplash.com/photo-1625948519841-62c0c4b55d80?w=800&q=80$img141$,
  $alt141$Producto$alt141$,
  $vg141$[]$vg141$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  141,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id142$acn-adaptador-carga-rapida-1$id142$,
  $n142$Adaptador Carga rápida 20W · Réplica exacta$n142$,
  $s142$Carga rápida · Réplica exacta$s142$,
  $c142$accesorio_nuevo$c142$,
  20,
  $b142$Nuevo$b142$,
  $img142$https://images.unsplash.com/photo-1625948519841-62c0c4b55d80?w=800&q=80$img142$,
  $alt142$Producto$alt142$,
  $vg142$[]$vg142$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  142,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id143$acn-adaptador-carga-rapida-2$id143$,
  $n143$Adaptador Carga rápida 20W · Original$n143$,
  $s143$Carga rápida · Original$s143$,
  $c143$accesorio_nuevo$c143$,
  30,
  $b143$Original$b143$,
  $img143$https://images.unsplash.com/photo-1625948519841-62c0c4b55d80?w=800&q=80$img143$,
  $alt143$Producto$alt143$,
  $vg143$[]$vg143$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  143,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id144$acn-cable-carga-normal-l-a-l-3$id144$,
  $n144$Cable Carga normal L a L · Réplica exacta$n144$,
  $s144$Carga normal L a L · Réplica exacta$s144$,
  $c144$accesorio_nuevo$c144$,
  20000,
  $b144$Nuevo$b144$,
  $img144$https://images.unsplash.com/photo-1625948519841-62c0c4b55d80?w=800&q=80$img144$,
  $alt144$Producto$alt144$,
  $vg144$[]$vg144$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  144,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id145$acn-cable-carga-rapida-c-a-l-4$id145$,
  $n145$Cable Carga rápida C a L · Réplica exacta$n145$,
  $s145$Carga rápida C a L · Réplica exacta$s145$,
  $c145$accesorio_nuevo$c145$,
  20000,
  $b145$Nuevo$b145$,
  $img145$https://images.unsplash.com/photo-1625948519841-62c0c4b55d80?w=800&q=80$img145$,
  $alt145$Producto$alt145$,
  $vg145$[]$vg145$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  145,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id146$acn-cable-carga-rapida-c-a-c-5$id146$,
  $n146$Cable Carga rápida C a C · Réplica exacta$n146$,
  $s146$Carga rápida C a C · Réplica exacta$s146$,
  $c146$accesorio_nuevo$c146$,
  20000,
  $b146$Nuevo$b146$,
  $img146$https://images.unsplash.com/photo-1625948519841-62c0c4b55d80?w=800&q=80$img146$,
  $alt146$Producto$alt146$,
  $vg146$[]$vg146$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  146,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id147$acn-cable-carga-rapida-c-a-l-6$id147$,
  $n147$Cable Carga rápida C a L · Original$n147$,
  $s147$Carga rápida C a L · Original$s147$,
  $c147$accesorio_nuevo$c147$,
  20,
  $b147$Original$b147$,
  $img147$https://images.unsplash.com/photo-1625948519841-62c0c4b55d80?w=800&q=80$img147$,
  $alt147$Producto$alt147$,
  $vg147$[]$vg147$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  147,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id148$acn-cable-carga-rapida-c-a-c-7$id148$,
  $n148$Cable Carga rápida C a C · Original$n148$,
  $s148$Carga rápida C a C · Original$s148$,
  $c148$accesorio_nuevo$c148$,
  20,
  $b148$Original$b148$,
  $img148$https://images.unsplash.com/photo-1625948519841-62c0c4b55d80?w=800&q=80$img148$,
  $alt148$Producto$alt148$,
  $vg148$[]$vg148$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  148,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id149$acn-pencil$id149$,
  $n149$Apple Pencil$n149$,
  $s149$Pencil · Oficial 12 meses$s149$,
  $c149$accesorio_nuevo$c149$,
  150,
  $b149$Nuevo$b149$,
  $img149$https://images.unsplash.com/photo-1625948519841-62c0c4b55d80?w=800&q=80$img149$,
  $alt149$Producto$alt149$,
  $vg149$[{"id":"presentacion","kind":"select","uiKind":"select","label":"Elegí el modelo","pricingMode":"absolute","options":[{"id":"acn-pencil-apple-pencil-usb-c-8","label":"Apple Pencil USB-C · U$S 150","price":150},{"id":"acn-pencil-apple-pencil-pro-9","label":"Apple Pencil Pro · U$S 190","price":190}]}]$vg149$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  149,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id150$acn-teclado$id150$,
  $n150$Magic Keyboard$n150$,
  $s150$Teclado · Oficial 12 meses$s150$,
  $c150$accesorio_nuevo$c150$,
  390,
  $b150$Nuevo$b150$,
  $img150$https://images.unsplash.com/photo-1625948519841-62c0c4b55d80?w=800&q=80$img150$,
  $alt150$Producto$alt150$,
  $vg150$[{"id":"presentacion","kind":"select","uiKind":"select","label":"Elegí el modelo","pricingMode":"absolute","options":[{"id":"acn-teclado-magic-keyboard-air-11-m3-10","label":"Magic Keyboard Air 11″ M3 · U$S 390","price":390},{"id":"acn-teclado-magic-keyboard-pro-11-m4-m5-12","label":"Magic Keyboard Pro 11″ M4/M5 · U$S 390","price":390},{"id":"acn-teclado-magic-keyboard-air-13-m3-11","label":"Magic Keyboard Air 13″ M3 · U$S 480","price":480},{"id":"acn-teclado-magic-keyboard-pro-13-m4-m5-13","label":"Magic Keyboard Pro 13″ M4/M5 · U$S 480","price":480}]}]$vg150$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  150,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id151$acn-airtag$id151$,
  $n151$AirTag$n151$,
  $s151$AirTag · Oficial 12 meses$s151$,
  $c151$accesorio_nuevo$c151$,
  160,
  $b151$Nuevo$b151$,
  $img151$https://images.unsplash.com/photo-1625948519841-62c0c4b55d80?w=800&q=80$img151$,
  $alt151$Producto$alt151$,
  $vg151$[{"id":"presentacion","kind":"select","uiKind":"select","label":"Elegí el modelo","pricingMode":"absolute","options":[{"id":"acn-airtag-airtag-pack-x4-14","label":"AirTag pack x4 · U$S 160","price":160},{"id":"acn-airtag-airtag-pack-x4-2-gen-15","label":"AirTag pack x4 2.ª gen. · U$S 190","price":190}]}]$vg151$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  151,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id152$acu-funda-silicona-tpu-iphone-13-14-0$id152$,
  $n152$iPhone 13 / 14$n152$,
  $s152$Funda · Consultar en tienda$s152$,
  $c152$accesorio_usado$c152$,
  4500,
  $b152$Usado$b152$,
  $img152$https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80$img152$,
  $alt152$Producto$alt152$,
  $vg152$[]$vg152$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  152,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id153$acu-cable-lightning-1$id153$,
  $n153$Cable Lightning · Funcional · desgaste visible$n153$,
  $s153$Lightning · Funcional · desgaste visible$s153$,
  $c153$accesorio_usado$c153$,
  3000,
  $b153$Usado$b153$,
  $img153$https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80$img153$,
  $alt153$Producto$alt153$,
  $vg153$[]$vg153$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  153,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id154$acu-cargador-20w-usb-c-apple-20w-usb-c-2$id154$,
  $n154$Apple 20W USB-C$n154$,
  $s154$Cargador · 7 días$s154$,
  $c154$accesorio_usado$c154$,
  18,
  $b154$Usado · original$b154$,
  $img154$https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80$img154$,
  $alt154$Producto$alt154$,
  $vg154$[]$vg154$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  154,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id155$svc-diagnostico$id155$,
  $n155$Diagnóstico técnico especializado$n155$,
  $s155$Evaluación completa + informe y presupuesto.$s155$,
  $c155$servicio$c155$,
  25000,
  NULL,
  $img155$https://images.unsplash.com/photo-1580894894513-541e068a3e2e?w=800&q=80$img155$,
  $alt155$Servicio técnico$alt155$,
  $vg155$[]$vg155$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  155,
  now()
);

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id156$svc-bateria$id156$,
  $n156$Cambio de batería certificada$n156$,
  $s156$MacBook / iPhone con piezas de calidad. Cotización en tienda.$s156$,
  $c156$servicio$c156$,
  0,
  $b156$Consultar$b156$,
  $img156$https://images.unsplash.com/photo-1580894894513-541e068a3e2e?w=800&q=80$img156$,
  $alt156$Reparación$alt156$,
  $vg156$[]$vg156$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  156,
  now()
);

commit;
