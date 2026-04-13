import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const CACHE_CONTROL_YEAR = `${60 * 60 * 24 * 365}`;

let cachedClient: S3Client | null = null;

const R2_ENV_KEYS = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "NEXT_PUBLIC_MEDIA_URL_BASE",
] as const;

/** Nombres de variables que faltan o están vacías (tras trim). Útil para diagnosticar prod. */
export function missingR2EnvKeys(): (typeof R2_ENV_KEYS)[number][] {
  return R2_ENV_KEYS.filter((k) => !process.env[k]?.trim());
}

/** True si hay credenciales y bucket R2 + base pública para armar URLs. */
export function isR2Configured(): boolean {
  return missingR2EnvKeys().length === 0;
}

function r2ConfigErrorMessage(): string {
  const missing = missingR2EnvKeys();
  const list = missing.length ? missing.join(", ") : "(ninguna detectada; revisá espacios o redeploy)";
  return [
    "R2 no está configurado.",
    `Variables sin valor efectivo: ${list}.`,
    "En Vercel/hosting: revisá que existan para el entorno Production (no solo Preview), sin comillas extra, y hacé redeploy después de agregarlas.",
    "Referencia: env.example.",
  ].join(" ");
}

function assertR2(): void {
  if (!isR2Configured()) {
    throw new Error(r2ConfigErrorMessage());
  }
}

function client(): S3Client {
  if (cachedClient) return cachedClient;
  assertR2();
  const accountId = process.env.R2_ACCOUNT_ID!.trim();
  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!.trim(),
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!.trim(),
    },
  });
  return cachedClient;
}

/** Nombre del bucket R2 (se guarda en `media_gallery_items.bucket` para ítems nuevos). */
export function getR2BucketName(): string {
  assertR2();
  return process.env.R2_BUCKET!.trim();
}

/** Base pública (custom domain o `*.r2.dev` con acceso público al bucket). */
export function getPublicMediaUrlBase(): string {
  assertR2();
  return process.env.NEXT_PUBLIC_MEDIA_URL_BASE!.trim().replace(/\/$/, "");
}

/** URL absoluta del objeto para persistir en DB y `<img src>`. */
export function publicMediaUrlForKey(key: string): string {
  const base = getPublicMediaUrlBase();
  const k = key.replace(/^\/+/, "");
  return `${base}/${k}`;
}

export async function putR2PublicObject(key: string, body: Buffer, contentType: string): Promise<void> {
  const c = client();
  const bucket = getR2BucketName();
  const objectKey = key.replace(/^\/+/, "");
  await c.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: body,
      ContentType: contentType || "image/jpeg",
      CacheControl: CACHE_CONTROL_YEAR,
    }),
  );
}

/** Elimina un objeto del bucket R2 configurado en env (mismo bucket que las subidas). */
export async function deleteR2Object(key: string): Promise<void> {
  const c = client();
  const bucket = getR2BucketName();
  const objectKey = key.replace(/^\/+/, "");
  await c.send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey }));
}
