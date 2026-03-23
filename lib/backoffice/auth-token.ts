const enc = new TextEncoder();

/** Token de sesión estable (HMAC-SHA256). Usado en middleware Edge y en login. */
export async function createBackofficeSessionToken(): Promise<string> {
  const password = process.env.BACKOFFICE_PASSWORD?.trim() ?? "";
  const secret = process.env.BACKOFFICE_AUTH_SECRET?.trim() ?? "";
  if (!password || !secret) return "";
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(password));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}
