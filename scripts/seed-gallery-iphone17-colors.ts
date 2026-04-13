/**
 * Descarga fotos de referencia (Unsplash, uso permitido en su licencia) y las sube a R2
 * bajo `gallery/inbox/`, registrando filas en `public.media_gallery_items`.
 *
 * Están pensadas como **aproximación visual** por acabado (titanio, azul, etc.): no son
 * renders oficiales de Apple ni garantizan ser un iPhone 17 real; sirven para poblar la galería BO.
 *
 * Requiere `.env.local`:
 * - Supabase (solo DB): `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
 * - R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `NEXT_PUBLIC_MEDIA_URL_BASE`
 *
 *   npx tsx scripts/seed-gallery-iphone17-colors.ts --dry-run
 *   npx tsx scripts/seed-gallery-iphone17-colors.ts
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  getR2BucketName,
  isR2Configured,
  publicMediaUrlForKey,
  putR2PublicObject,
} from "../lib/backoffice/storage/r2-client";

const MAX_BYTES = 5 * 1024 * 1024;
const MIN_BYTES = 8 * 1024;

/** URLs comprobadas con HTTP 200 (Feb 2026). Distintos tonos / encuadres tipo smartphone. */
const COLOR_STOCK: { slug: string; label: string; url: string }[] = [
  {
    slug: "titanio-natural",
    label: "iPhone 17 — referencia titanio / oscuro",
    url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=900&q=80",
  },
  {
    slug: "plateado-claro",
    label: "iPhone 17 — referencia plateado / claro",
    url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=900&q=80",
  },
  {
    slug: "negro-mate",
    label: "iPhone 17 — referencia negro / mate",
    url: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=900&q=80",
  },
  {
    slug: "dispositivo-lateral",
    label: "iPhone 17 — referencia lateral / marco",
    url: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=900&q=80",
  },
  {
    slug: "mano-encuadre",
    label: "iPhone 17 — referencia en mano",
    url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&q=80",
  },
  {
    slug: "azul-acento",
    label: "iPhone 17 — referencia con acento azul",
    url: "https://images.unsplash.com/photo-1611472173362-3f53dbd65d80?w=900&q=80",
  },
  {
    slug: "pantalla-encendida",
    label: "iPhone 17 — referencia pantalla / UI",
    url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=900&q=80",
  },
  {
    slug: "mesa-minimal",
    label: "iPhone 17 — referencia minimal",
    url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=900&q=80",
  },
  {
    slug: "dorado-calido",
    label: "iPhone 17 — referencia tono cálido / dorado",
    url: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=900&q=80",
  },
];

function loadEnvLocal() {
  const p = join(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

function detectImageType(buf: Buffer): "image/jpeg" | "image/png" | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)
    return "image/png";
  return null;
}

function extFor(ct: "image/jpeg" | "image/png"): string {
  return ct === "image/png" ? "png" : "jpg";
}

async function fetchValidatedImage(url: string): Promise<{ buf: Buffer; contentType: string }> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar ${url}`);
  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);
  if (buf.length < MIN_BYTES) throw new Error(`Muy chico (${buf.length} B): ${url}`);
  if (buf.length > MAX_BYTES) throw new Error(`Supera 5 MB: ${url}`);
  const ct = detectImageType(buf);
  if (!ct) throw new Error(`No es JPEG ni PNG (cabecera inválida): ${url}`);
  return { buf, contentType: ct };
}

async function main() {
  loadEnvLocal();
  const dry = process.argv.includes("--dry-run");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!dry && (!url || !key)) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
    process.exit(1);
  }
  if (!dry && !isR2Configured()) {
    console.error(
      "R2 no configurado. Definí R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET y NEXT_PUBLIC_MEDIA_URL_BASE (ver env.example).",
    );
    process.exit(1);
  }

  console.log(`Modo: ${dry ? "DRY-RUN (sin subir)" : "SUBIDA REAL (R2 + registro en Supabase)"}`);
  console.log(`Ítems: ${COLOR_STOCK.length}\n`);

  for (const row of COLOR_STOCK) {
    try {
      const { buf, contentType } = await fetchValidatedImage(row.url);
      const ext = extFor(contentType as "image/jpeg" | "image/png");
      console.log(`✓ ${row.slug} (${buf.length} B, ${contentType}) — ${row.label}`);
      if (dry) continue;

      const supabase: SupabaseClient = createClient(url!, key!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const bucket = getR2BucketName();
      const uid = crypto.randomUUID();
      const path = `gallery/inbox/iphone17-${row.slug}-${uid}.${ext}`;

      await putR2PublicObject(path, buf, contentType);
      const publicUrl = publicMediaUrlForKey(path);

      const { error: insErr } = await supabase.from("media_gallery_items").insert({
        bucket,
        storage_path: path,
        public_url: publicUrl,
        bytes: buf.length,
        content_type: contentType,
        source: "media-inbox",
      });
      if (insErr) {
        if (insErr.code === "42P01" || insErr.message.includes("does not exist")) {
          console.error("Tabla media_gallery_items no existe. Aplicá la migración 009 en Supabase.");
          process.exit(1);
        }
        throw new Error(insErr.message);
      }
      console.log(`  → ${publicUrl}`);
    } catch (e) {
      console.error(`✗ ${row.slug}:`, e instanceof Error ? e.message : e);
      process.exit(1);
    }
  }

  if (dry) {
    console.log("\n[--dry-run] Nada subido. Quitá el flag para ejecutar de verdad.");
  } else {
    console.log("\nListo. Las filas quedaron en media_gallery_items (Supabase).");
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
