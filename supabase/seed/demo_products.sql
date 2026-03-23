-- Datos demo: catálogo completo con variantes (imágenes por URL; podés reemplazarlas
-- subiendo archivos desde el backoffice a Supabase Storage).
-- Ejecutar en el SQL Editor después de las migraciones 001 y 002.

DELETE FROM public.products;

INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  $id0$mb-14-m3$id0$,
  $n0$MacBook Pro 14″ M3$n0$,
  $s0$Rendimiento pro, pantalla Liquid Retina XDR.$s0$,
  $c0$mac$c0$,
  2850000,
  $b0$Nuevo sellado$b0$,
  $img0$https://images.unsplash.com/photo-1517336714731-489689fd4ca8?w=800&q=80$img0$,
  $alt0$MacBook Pro sobre mesa$alt0$,
  $vg0$[{"id":"finish","kind":"color","label":"Acabado","pricingMode":"delta","options":[{"id":"space-gray","label":"Gris espacial","hex":"#3d3d3f","priceDelta":0},{"id":"silver","label":"Plata","hex":"#d6d6d7","priceDelta":0}]},{"id":"storage","kind":"storage","label":"SSD","pricingMode":"absolute","options":[{"id":"ssd512","label":"512 GB","price":2850000},{"id":"ssd1tb","label":"1 TB","price":3180000},{"id":"ssd2tb","label":"2 TB","price":3520000}]}]$vg0$::jsonb,
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
  $id1$mb-air-m2$id1$,
  $n1$MacBook Air 15″ M2$n1$,
  $s1$Ultrafina, silenciosa, batería de larga duración.$s1$,
  $c1$mac$c1$,
  1650000,
  $b1$Premium usado$b1$,
  $img1$https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80$img1$,
  $alt1$MacBook Air abierta$alt1$,
  $vg1$[{"id":"finish","kind":"color","label":"Color","pricingMode":"delta","options":[{"id":"midnight","label":"Medianoche","hex":"#2e2a2b","priceDelta":0},{"id":"starlight","label":"Luz estelar","hex":"#e3dcd1","priceDelta":0},{"id":"space-gray","label":"Gris espacial","hex":"#525252","priceDelta":0}]},{"id":"ram","kind":"select","label":"Memoria unificada","pricingMode":"absolute","options":[{"id":"8gb-256","label":"8 GB / 256 GB","price":1650000},{"id":"8gb-512","label":"8 GB / 512 GB","price":1820000},{"id":"16gb-512","label":"16 GB / 512 GB","price":1980000}]}]$vg1$::jsonb,
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
  $id2$ipad-pro-m4$id2$,
  $n2$iPad Pro 11″ M4$n2$,
  $s2$OLED, Apple Pencil Pro, productividad total.$s2$,
  $c2$ipad$c2$,
  1980000,
  $b2$Nuevo sellado$b2$,
  $img2$https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80$img2$,
  $alt2$iPad con teclado$alt2$,
  $vg2$[{"id":"color","kind":"color","label":"Color","pricingMode":"delta","options":[{"id":"black","label":"Negro","hex":"#1c1c1e","priceDelta":0},{"id":"silver","label":"Plata","hex":"#e8e8ed","priceDelta":0}]},{"id":"storage","kind":"storage","label":"Almacenamiento","pricingMode":"absolute","options":[{"id":"256","label":"256 GB","price":1980000},{"id":"512","label":"512 GB","price":2240000},{"id":"1tb","label":"1 TB","price":2580000},{"id":"2tb","label":"2 TB","price":2980000}]}]$vg2$::jsonb,
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
  $id3$ipad-air$id3$,
  $n3$iPad Air M2$n3$,
  $s3$Equilibrio perfecto entre potencia y portabilidad.$s3$,
  $c3$ipad$c3$,
  920000,
  NULL,
  $img3$https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&q=80$img3$,
  $alt3$iPad Air$alt3$,
  $vg3$[{"id":"color","kind":"color","label":"Color","pricingMode":"delta","options":[{"id":"blue","label":"Azul","hex":"#6b8cbc","priceDelta":0},{"id":"purple","label":"Violeta","hex":"#9b8fb8","priceDelta":0},{"id":"starlight","label":"Luz estelar","hex":"#e3dcd1","priceDelta":0},{"id":"gray","label":"Gris","hex":"#8e8e93","priceDelta":0}]},{"id":"storage","kind":"storage","label":"Capacidad","pricingMode":"absolute","options":[{"id":"128","label":"128 GB","price":920000},{"id":"256","label":"256 GB","price":1050000},{"id":"512","label":"512 GB","price":1280000}]}]$vg3$::jsonb,
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
  $id4$iphone-16-pro$id4$,
  $n4$iPhone 16 Pro$n4$,
  $s4$Titanio, cámara 48 MP, Action Button.$s4$,
  $c4$iphone$c4$,
  1420000,
  $b4$Nuevo sellado$b4$,
  $img4$https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80$img4$,
  $alt4$iPhone Pro$alt4$,
  $vg4$[{"id":"color","kind":"color","label":"Color","pricingMode":"delta","options":[{"id":"blue","label":"Azul","hex":"#3d4f6f","priceDelta":0},{"id":"gray","label":"Titanio","hex":"#3a3a3c","priceDelta":0},{"id":"silver","label":"Plata","hex":"#e3e4e6","priceDelta":0},{"id":"gold","label":"Oro","hex":"#e6d4b8","priceDelta":0}]},{"id":"storage","kind":"storage","label":"Almacenamiento","pricingMode":"absolute","options":[{"id":"128","label":"128GB","price":1420000},{"id":"256","label":"256GB","price":1540000},{"id":"512","label":"512GB","price":1780000},{"id":"1tb","label":"1TB","price":2050000}]}]$vg4$::jsonb,
  $d4${"images":["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&q=85","https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=1200&q=85","https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=1200&q=85&auto=format&fit=crop&w=800","https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=1200&q=85"],"longDescription":"El iPhone más avanzado con chasis de titanio, chip A18 Pro y sistema de cámaras profesional. Pantalla Super Retina XDR con ProMotion y la mejor batería hasta la fecha en un iPhone Pro.","specs":[{"key":"cpu","icon":"chip","title":"PROCESADOR","value":"A18 Pro","desc":"Neural Engine de 16 núcleos y GPU con trazado de rayos."},{"key":"cam","icon":"camera","title":"CÁMARA PRINCIPAL","value":"48 MP","desc":"Fusiones de píxeles y zoom óptico de hasta 5×."},{"key":"screen","icon":"display","title":"PANTALLA","value":"6.3\" XDR","desc":"ProMotion 120 Hz, Always-On y HDR extremo."},{"key":"bat","icon":"battery","title":"BATERÍA","value":"Hasta 29 h","desc":"Reproducción de video según uso y modo de bajo consumo."},{"key":"ram","icon":"memory","title":"MEMORIA","value":"8 GB RAM","desc":"Multitarea fluida y modelos de IA en dispositivo."},{"key":"water","icon":"water","title":"RESISTENCIA","value":"IP68","desc":"Hasta 6 m de profundidad durante 30 minutos."}],"relatedIds":["iphone-15","watch-ultra-2","airpods-pro-2","ipad-pro-m4"],"accessoryIds":["airpods-pro-2","acc-hub","airpods-max"],"reviews":[{"name":"Lucía M.","avatar":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&q=80","rating":5,"text":"Pantalla increíble y batería que rinde todo el día. La cámara superó expectativas."},{"name":"Martín P.","avatar":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&q=80","rating":5,"text":"Compra sellada, entrega en fecha. Atención muy clara por WhatsApp."},{"name":"Paula G.","avatar":"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&q=80","rating":4,"text":"Excelente relación calidad-precio. El titanio se siente premium."}]}$d4$,
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
  $id5$iphone-15$id5$,
  $n5$iPhone 15$n5$,
  $s5$Dynamic Island, USB-C, colores premium.$s5$,
  $c5$iphone$c5$,
  890000,
  $b5$Premium usado$b5$,
  $img5$https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=800&q=80$img5$,
  $alt5$iPhone 15$alt5$,
  $vg5$[{"id":"color","kind":"color","label":"Color","pricingMode":"delta","options":[{"id":"black","label":"Negro","hex":"#1c1c1e","priceDelta":0},{"id":"blue","label":"Azul","hex":"#4a6fa5","priceDelta":0},{"id":"green","label":"Verde","hex":"#4f6f5e","priceDelta":0},{"id":"yellow","label":"Amarillo","hex":"#e8d4a2","priceDelta":0},{"id":"pink","label":"Rosa","hex":"#e8b4b8","priceDelta":0}]},{"id":"storage","kind":"storage","label":"Almacenamiento","pricingMode":"absolute","options":[{"id":"128","label":"128 GB","price":890000},{"id":"256","label":"256 GB","price":990000},{"id":"512","label":"512 GB","price":1180000}]}]$vg5$::jsonb,
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
  $id6$watch-ultra-2$id6$,
  $n6$Apple Watch Ultra 2$n6$,
  $s6$GPS de doble frecuencia, resistencia extrema.$s6$,
  $c6$watch$c6$,
  980000,
  $b6$Nuevo sellado$b6$,
  $img6$https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80$img6$,
  $alt6$Apple Watch$alt6$,
  $vg6$[{"id":"case","kind":"color","label":"Caja titanio","pricingMode":"delta","options":[{"id":"natural","label":"Natural","hex":"#c4b8a8","priceDelta":0},{"id":"black","label":"Negro","hex":"#2c2c2e","priceDelta":0}]},{"id":"band","kind":"select","label":"Correa","pricingMode":"delta","options":[{"id":"ocean","label":"Ocean","priceDelta":0},{"id":"alpine","label":"Alpine Loop","priceDelta":25000},{"id":"trail","label":"Trail Loop","priceDelta":25000}]}]$vg6$::jsonb,
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
  $id7$watch-series-10$id7$,
  $n7$Apple Watch Series 10$n7$,
  $s7$Pantalla más grande, carga rápida.$s7$,
  $c7$watch$c7$,
  520000,
  NULL,
  $img7$https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80$img7$,
  $alt7$Apple Watch Series$alt7$,
  $vg7$[{"id":"size","kind":"select","label":"Tamaño caja","pricingMode":"absolute","options":[{"id":"42","label":"42 mm","price":520000},{"id":"46","label":"46 mm","price":560000}]},{"id":"color","kind":"color","label":"Acabado","pricingMode":"delta","options":[{"id":"silver","label":"Plata","hex":"#d1d1d6","priceDelta":0},{"id":"rose","label":"Rosa","hex":"#e8c4c0","priceDelta":0},{"id":"black","label":"Negro","hex":"#2c2c2e","priceDelta":0}]}]$vg7$::jsonb,
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
  $id8$airpods-pro-2$id8$,
  $n8$AirPods Pro 2 USB-C$n8$,
  $s8$Cancelación activa, audio espacial.$s8$,
  $c8$audio$c8$,
  320000,
  $b8$Nuevo sellado$b8$,
  $img8$https://images.unsplash.com/photo-1606220945770-b2b6c2c2bfb0?w=800&q=80$img8$,
  $alt8$AirPods Pro$alt8$,
  $vg8$[{"id":"edition","kind":"select","label":"Presentación","pricingMode":"absolute","options":[{"id":"usb-c","label":"Estuche USB-C","price":320000},{"id":"magsafe","label":"Estuche MagSafe","price":345000}]}]$vg8$::jsonb,
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
  $id9$airpods-max$id9$,
  $n9$AirPods Max$n9$,
  $s9$Sonido Hi‑Fi con cancelación de ruido.$s9$,
  $c9$audio$c9$,
  680000,
  $b9$Premium usado$b9$,
  $img9$https://images.unsplash.com/photo-1625245488600-f03c431a446c?w=800&q=80$img9$,
  $alt9$AirPods Max$alt9$,
  $vg9$[{"id":"color","kind":"color","label":"Color","pricingMode":"absolute","options":[{"id":"space-gray","label":"Gris espacial","hex":"#4a4a4c","price":680000},{"id":"silver","label":"Plata","hex":"#d6d6d8","price":680000},{"id":"blue","label":"Azul cielo","hex":"#7eb5d6","price":695000},{"id":"pink","label":"Rosa","hex":"#e8b8c8","price":695000},{"id":"green","label":"Verde","hex":"#8fbc8f","price":695000}]}]$vg9$::jsonb,
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
  $id10$imac-m3$id10$,
  $n10$iMac 24″ M3$n10$,
  $s10$Todo en uno para estudio y creatividad.$s10$,
  $c10$desktop$c10$,
  2100000,
  $b10$Nuevo sellado$b10$,
  $img10$https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80$img10$,
  $alt10$iMac en escritorio$alt10$,
  $vg10$[{"id":"color","kind":"color","label":"Color","pricingMode":"delta","options":[{"id":"blue","label":"Azul","hex":"#6b9bd1","priceDelta":0},{"id":"green","label":"Verde","hex":"#7cb88e","priceDelta":0},{"id":"pink","label":"Rosa","hex":"#e8b4b8","priceDelta":0},{"id":"silver","label":"Plata","hex":"#e8e8ed","priceDelta":0}]},{"id":"config","kind":"select","label":"Configuración","pricingMode":"absolute","options":[{"id":"8-256","label":"8 GB RAM · 256 GB SSD","price":2100000},{"id":"8-512","label":"8 GB RAM · 512 GB SSD","price":2320000},{"id":"16-512","label":"16 GB RAM · 512 GB SSD","price":2520000}]}]$vg10$::jsonb,
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
  $id11$svc-diagnostico$id11$,
  $n11$Diagnóstico técnico especializado$n11$,
  $s11$Evaluación completa + informe y presupuesto.$s11$,
  $c11$servicio$c11$,
  25000,
  NULL,
  $img11$https://images.unsplash.com/photo-1580894894513-541e068a3e2e?w=800&q=80$img11$,
  $alt11$Reparación de laptop$alt11$,
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
  $id12$svc-bateria$id12$,
  $n12$Cambio de batería certificada$n12$,
  $s12$MacBook / iPhone con piezas de calidad.$s12$,
  $c12$servicio$c12$,
  0,
  $b12$Consultar$b12$,
  $img12$https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80$img12$,
  $alt12$Herramientas de reparación$alt12$,
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
  $id13$otro-proyector$id13$,
  $n13$Proyector 4K compacto$n13$,
  $s13$Ideal para home office y entretenimiento.$s13$,
  $c13$otros$c13$,
  890000,
  NULL,
  $img13$https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80$img13$,
  $alt13$Proyector$alt13$,
  $vg13$[]$vg13$::jsonb,
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
  $id14$otro-laptop-win$id14$,
  $n14$Laptop Windows premium$n14$,
  $s14$Marcas seleccionadas, stock rotativo.$s14$,
  $c14$otros$c14$,
  0,
  $b14$Consultar$b14$,
  $img14$https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80$img14$,
  $alt14$Laptop$alt14$,
  $vg14$[]$vg14$::jsonb,
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
  $id15$acc-hub$id15$,
  $n15$Kit hub USB-C + accesorios$n15$,
  $s15$Cargadores, fundas y cables certificados.$s15$,
  $c15$otros$c15$,
  45000,
  NULL,
  $img15$https://images.unsplash.com/photo-1625948519841-62c0c4b55d80?w=800&q=80$img15$,
  $alt15$Accesorios USB-C$alt15$,
  $vg15$[{"id":"kit","kind":"select","label":"Kit","pricingMode":"absolute","options":[{"id":"basic","label":"Básico (hub + cable)","price":45000},{"id":"plus","label":"Plus (+ funda + adaptador)","price":72000},{"id":"pro","label":"Pro (todo lo anterior + teclado)","price":115000}]}]$vg15$::jsonb,
  NULL,
  NULL,
  NULL,
  true,
  15,
  now()
);
