import type { NextConfig } from "next";

function supabaseHost(): string | null {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!u) return null;
  try {
    return new URL(u).hostname;
  } catch {
    return null;
  }
}

function mediaPublicHost(): string | null {
  const u = process.env.NEXT_PUBLIC_MEDIA_URL_BASE?.trim();
  if (!u) return null;
  try {
    return new URL(u).hostname;
  } catch {
    return null;
  }
}

const host = supabaseHost();
const mediaHost = mediaPublicHost();

const nextConfig: NextConfig = {
  // En dev, sin esto las respuestas de red (p. ej. Supabase) pueden quedar
  // cacheadas entre refrescos por HMR y parece que “no actualiza” hasta `next build`.
  experimental: {
    serverComponentsHmrCache: false,
  },
  images: {
    /** Menos revalidaciones del optimizador → menos fetch al origen (p. ej. Supabase). */
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      /** URLs públicas tipo `https://pub-xxxx.r2.dev/...` (aunque el dominio custom en env sea otro). */
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
      ...(host
        ? [
            {
              protocol: "https" as const,
              hostname: host,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      ...(mediaHost
        ? [
            {
              protocol: "https" as const,
              hostname: mediaHost,
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
