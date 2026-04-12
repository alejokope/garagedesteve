import "server-only";

import { siteConfig } from "@/lib/site-config";

function isLocalHostname(host: string): boolean {
  const h = host.toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h.endsWith(".local");
}

/**
 * Base URL para enlaces en correos (seguimiento de reparaciones, etc.).
 * Si `NEXT_PUBLIC_SITE_URL` apunta a localhost, se ignora y se usa `siteConfig.siteUrl`
 * para que los mails no lleven a desarrollo.
 */
export function publicSiteUrlForEmail(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      const u = new URL(withProto);
      if (u.protocol === "https:" || u.protocol === "http:") {
        if (!isLocalHostname(u.hostname)) {
          return u.origin.replace(/\/$/, "");
        }
      }
    } catch {
      /* usar fallback */
    }
  }

  let base = siteConfig.siteUrl.trim().replace(/\/$/, "");
  if (!/^https?:\/\//i.test(base)) {
    base = `https://${base}`;
  }
  return base;
}
