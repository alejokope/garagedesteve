/**
 * Loaders de transición del e-commerce: tipografía y colores alineados a globals.css (--brand-from, font-display).
 */

export function SiteRouteLoading() {
  return (
    <div
      className="egd-site-route-loading flex min-h-[min(56vh,28rem)] flex-col items-center justify-center gap-8 px-4 py-16"
      aria-busy="true"
      aria-live="polite"
      aria-label="Cargando página"
    >
      <div className="flex flex-col items-center gap-5">
        <div
          className="egd-site-route-loading__bar h-1 w-44 overflow-hidden rounded-full bg-neutral-100 sm:w-52"
          aria-hidden
        >
          <div className="egd-site-route-loading__bar-inner h-full w-2/5 rounded-full bg-[var(--brand-from)]" />
        </div>
        <div className="text-center">
          <p className="font-display text-sm font-semibold tracking-wide text-neutral-800">Cargando</p>
          <p className="mt-1.5 text-xs font-medium text-neutral-400">Preparando la página…</p>
        </div>
      </div>
      <div className="w-full max-w-md space-y-3">
        <div className="h-2.5 rounded-md bg-neutral-100 motion-safe:egd-site-loading-pulse" />
        <div
          className="h-2.5 w-[90%] rounded-md bg-neutral-100 motion-safe:egd-site-loading-pulse"
          style={{ animationDelay: "80ms" }}
        />
        <div
          className="h-2.5 w-[65%] rounded-md bg-neutral-100 motion-safe:egd-site-loading-pulse"
          style={{ animationDelay: "160ms" }}
        />
      </div>
    </div>
  );
}

export function SiteProductRouteLoading() {
  return (
    <div
      className="bg-[#f9fafb]"
      aria-busy="true"
      aria-live="polite"
      aria-label="Cargando producto"
    >
      <div className="border-b border-[var(--border)] bg-neutral-100/80">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-8">
          <div className="h-3 w-2/3 max-w-md rounded bg-neutral-200/80 motion-safe:egd-site-loading-pulse" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="aspect-square rounded-2xl border border-[var(--border)] bg-white motion-safe:egd-site-loading-pulse" />
          <div className="space-y-5 pt-2">
            <div className="h-3 w-24 rounded bg-neutral-200 motion-safe:egd-site-loading-pulse" />
            <div className="h-10 w-full max-w-lg rounded-lg bg-neutral-100 motion-safe:egd-site-loading-pulse" />
            <div className="h-20 w-full rounded-xl bg-neutral-100 motion-safe:egd-site-loading-pulse" />
            <div className="h-12 w-40 rounded-lg bg-neutral-200 motion-safe:egd-site-loading-pulse" />
            <div className="h-12 w-full max-w-sm rounded-xl bg-neutral-100 motion-safe:egd-site-loading-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
