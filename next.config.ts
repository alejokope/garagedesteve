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

const host = supabaseHost();

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
      ...(host
        ? [
            {
              protocol: "https" as const,
              hostname: host,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
