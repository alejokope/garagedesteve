import { isSupabaseConfigured } from "@/lib/supabase/config";

export function BackofficeEnvBanner() {
  if (isSupabaseConfigured()) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-500/25 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-100/95"
    >
      Completá{" "}
      <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs text-amber-50">
        .env.local
      </code>{" "}
      con las variables de Supabase para habilitar la conexión a la base de datos.
    </div>
  );
}
