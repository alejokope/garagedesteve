"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { SellQuoteWizard } from "@/app/components/sell-quote-wizard";
import { useBottomSheetDynamicHeight } from "@/app/hooks/use-bottom-sheet-dynamic-height";
import type { SellPricingPayload } from "@/lib/sell-pricing-schema";

type Props = {
  config: SellPricingPayload;
  whatsappHref: string | null;
};

type SheetPhase = "closed" | "opening" | "open" | "closing";

export function SellQuoteExperience(props: Props) {
  const [phase, setPhase] = useState<SheetPhase>("closed");
  const panelRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const sheetOpen = phase !== "closed";
  const sheetMeasureHeights = phase === "open";
  const sheetHeight = useBottomSheetDynamicHeight(panelRef, sheetOpen, sheetMeasureHeights);

  const closeSheet = useCallback(() => {
    setPhase((p) => {
      if (p === "opening") return "closed";
      if (p === "open") return "closing";
      return p;
    });
  }, []);

  useEffect(() => {
    if (phase !== "opening") return;
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setPhase("open"));
    });
    return () => window.cancelAnimationFrame(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "closing") return;
    const t = window.setTimeout(() => setPhase("closed"), 380);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "closed") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "open" && phase !== "opening") return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSheet();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, closeSheet]);

  const sheetMounted = phase !== "closed";
  const sheetPaintedOpen = phase === "open";

  function handleSheetPanelTransitionEnd(e: React.TransitionEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (phaseRef.current === "open" && e.propertyName === "height") {
      sheetHeight.onHeightTransitionEnd(e);
      return;
    }
    if (phaseRef.current === "closing" && e.propertyName === "transform") {
      setPhase("closed");
    }
  }

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setPhase((p) => (p === "closed" ? "opening" : p))}
          className="group flex w-full items-center gap-4 rounded-2xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 p-4 text-left shadow-[var(--glow)] transition active:scale-[0.99] hover:border-neutral-300"
        >
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              Cotización guiada
            </span>
            <span className="font-display text-lg font-semibold text-neutral-950">
              Cotizá tu iPhone
            </span>
            <span className="text-sm leading-snug text-neutral-600">
              Tres preguntas rápidas · referencia · guardá o usá en el carrito
            </span>
          </span>
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white transition-transform duration-200 group-hover:-translate-y-0.5"
            aria-hidden
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </span>
        </button>
      </div>

      {sheetMounted ? (
        <div
          className="fixed inset-0 z-[85] flex flex-col justify-end lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sell-quote-sheet-title"
        >
          <button
            type="button"
            className={`absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ease-out motion-reduce:transition-none ${
              sheetPaintedOpen ? "opacity-100" : "opacity-0"
            }`}
            aria-label="Cerrar cotizador"
            onClick={closeSheet}
          />
          <div
            ref={panelRef}
            onTransitionEnd={handleSheetPanelTransitionEnd}
            className={`relative flex max-h-[min(92dvh,56rem)] w-full flex-col rounded-t-[1.25rem] bg-neutral-100 shadow-[0_-12px_48px_rgba(0,0,0,0.28)] transition-[transform,height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
              sheetPaintedOpen ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="shrink-0 rounded-t-[1.25rem] border-b border-neutral-200/90 bg-white px-4 pb-3 pt-2">
              <div className="mx-auto mb-2 h-1 w-11 rounded-full bg-neutral-300" aria-hidden />
              <div className="flex items-center justify-between gap-3">
                <p id="sell-quote-sheet-title" className="font-display text-base font-semibold text-neutral-950">
                  Cotizar iPhone
                </p>
                <button
                  type="button"
                  onClick={closeSheet}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
                  aria-label="Cerrar"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
              <SellQuoteWizard {...props} variant="bottomSheet" />
            </div>
          </div>
        </div>
      ) : null}

      <div className="hidden lg:block">
        <SellQuoteWizard {...props} variant="page" />
      </div>
    </>
  );
}
