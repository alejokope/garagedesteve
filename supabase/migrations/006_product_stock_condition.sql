-- Condición de stock: nuevo vs usado (NULL = sin clasificar, ej. servicios)
alter table public.products
  add column if not exists stock_condition text
  check (stock_condition is null or stock_condition in ('new', 'used'));

create index if not exists products_stock_condition_idx
  on public.products (stock_condition)
  where stock_condition is not null;
