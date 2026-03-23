/**
 * Genera supabase/seed/demo_products.sql desde lib/data.ts y lib/product-detail-data.ts
 * Ejecutar: npx tsx scripts/generate-product-seed.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { products } from "../lib/data";
import { productDetailById } from "../lib/product-detail-data";

function dq(tag: string, body: string): string {
  return `$${tag}$${body}$${tag}$`;
}

const lines: string[] = [];
lines.push("-- Datos demo: catálogo completo con variantes (imágenes por URL; podés reemplazarlas");
lines.push("-- subiendo archivos desde el backoffice a Supabase Storage).");
lines.push("-- Ejecutar en el SQL Editor después de las migraciones 001 y 002.");
lines.push("");
lines.push("DELETE FROM public.products;");
lines.push("");

for (let i = 0; i < products.length; i++) {
  const p = products[i];
  const vg = JSON.stringify(p.variantGroups ?? []);
  const detail = productDetailById[p.id] ? JSON.stringify(productDetailById[p.id]) : null;

  const badgeSql = p.badge ? `${dq(`b${i}`, p.badge)},` : "NULL,";

  const detailSql = detail ? `${dq(`d${i}`, detail)},` : "NULL,";

  lines.push(`INSERT INTO public.products (
  id, name, short, category, price, badge, image, image_alt, variant_groups, detail,
  compare_at_price, discount_percent, published, sort_order, updated_at
) VALUES (
  ${dq(`id${i}`, p.id)},
  ${dq(`n${i}`, p.name)},
  ${dq(`s${i}`, p.short)},
  ${dq(`c${i}`, p.category)},
  ${p.price},
  ${badgeSql}
  ${dq(`img${i}`, p.image)},
  ${dq(`alt${i}`, p.imageAlt)},
  ${dq(`vg${i}`, vg)}::jsonb,
  ${detailSql}
  NULL,
  NULL,
  true,
  ${i},
  now()
);`);
  lines.push("");
}

const dir = join(process.cwd(), "supabase/seed");
mkdirSync(dir, { recursive: true });
const out = join(dir, "demo_products.sql");
writeFileSync(out, lines.join("\n"), "utf8");
console.log("Escrito:", out);
