-- Permite condiciones de stock además de new/used (slugs en minúsculas, ej. refurb, open_box).
alter table public.products
  drop constraint if exists products_stock_condition_check;

alter table public.products
  add constraint products_stock_condition_check
  check (
    stock_condition is null
    or (
      length(stock_condition) between 1 and 40
      and stock_condition ~ '^[a-z0-9][a-z0-9_-]*$'
    )
  );

comment on column public.products.stock_condition is
  'Slug: new, used u otros (refurb, open_box, …). NULL = sin clasificar (ej. servicios).';
