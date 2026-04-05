"use client";

import { useCallback, type ReactNode } from "react";

export type ProductFormSectionId = "datos" | "variantes" | "ficha";

export type ProductFormSection = {
  id: ProductFormSectionId;
  step: string;
  title: string;
  subtitle: string;
  optional?: boolean;
  content: ReactNode;
};

export function ProductFormSections({ sections }: { sections: ProductFormSection[] }) {
  const scrollTo = useCallback((id: ProductFormSectionId) => {
    document.getElementById(`bo-section-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return (
    <div className="space-y-10">
      <nav
        className="sticky top-0 z-30 -mx-4 border-b border-white/[0.1] bg-slate-950/95 px-4 py-3 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border sm:border-white/[0.08] sm:shadow-none"
        aria-label="Secciones del formulario"
      >
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Saltar a
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-left transition hover:bg-white/[0.08] sm:min-w-0 sm:flex-1 sm:px-4"
            >
              <span className="text-xs font-semibold text-violet-300">{s.step}</span>
              <span className="mt-0.5 block text-sm font-medium text-slate-100">{s.title}</span>
              {s.optional ? (
                <span className="mt-0.5 block text-[11px] text-slate-500">Opcional en la mayoría de casos</span>
              ) : (
                <span className="mt-0.5 block text-[11px] text-slate-500">Necesario para publicar</span>
              )}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Es <span className="text-slate-300">un solo formulario</span>: no hace falta guardar en cada paso. Al final
          pulsá <span className="text-slate-300">Guardar producto</span> y se guarda todo junto.
        </p>
      </nav>

      {sections.map((s) => (
        <section
          key={s.id}
          id={`bo-section-${s.id}`}
          className="scroll-mt-[5.5rem]"
        >
          <header className="mb-5 border-b border-white/[0.08] pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-300/90">{s.step}</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <h2 className="font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {s.title}
              </h2>
              {s.optional ? (
                <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-slate-400">
                  Podés dejarlo vacío
                </span>
              ) : null}
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">{s.subtitle}</p>
          </header>
          {s.content}
        </section>
      ))}
    </div>
  );
}
