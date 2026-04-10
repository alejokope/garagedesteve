/**
 * Fallback de navegación (loading.js) del backoffice: mismo aspecto en dashboard y sub-rutas.
 */
export function BackofficeRouteLoading() {
  return (
    <div
      className="flex min-h-[min(52vh,30rem)] flex-col items-center justify-center gap-5 px-4 py-12"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="relative size-11" aria-hidden>
        <div className="absolute inset-0 rounded-full border-2 border-white/[0.08]" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-violet-400 border-r-violet-400/40" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-200">Cargando</p>
        <p className="mt-1 text-xs text-slate-500">Un momento…</p>
      </div>
      <div className="w-full max-w-lg space-y-2.5">
        <div className="h-2.5 animate-pulse rounded-md bg-white/[0.07]" />
        <div className="h-2.5 w-[88%] animate-pulse rounded-md bg-white/[0.05]" />
        <div className="h-2.5 w-[72%] animate-pulse rounded-md bg-white/[0.04]" />
      </div>
    </div>
  );
}
