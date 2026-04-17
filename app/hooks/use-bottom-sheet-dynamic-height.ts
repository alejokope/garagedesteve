"use client";

import { useEffect, useRef, type RefObject, type TransitionEvent } from "react";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Anima cambios de altura del panel cuando el contenido crece o achica (p. ej. pasos de un wizard).
 * No limpia estilos al desactivar el observer: evita saltos si el sheet sigue animando el cierre.
 */
export function useBottomSheetDynamicHeight(
  panelRef: RefObject<HTMLDivElement | null>,
  /** Si el panel está montado (sheet “abierto” a nivel de estado padre). */
  open: boolean,
  /** Si conviene medir (p. ej. sheet ya visible, sin animar el slide inicial). */
  measure: boolean,
) {
  const prevHeightRef = useRef<number | null>(null);
  const lockingRef = useRef(false);
  const openRef = useRef(open);
  const measureRef = useRef(measure);
  openRef.current = open;
  measureRef.current = measure;

  useEffect(() => {
    if (!open) {
      lockingRef.current = false;
      prevHeightRef.current = null;
      const el = panelRef.current;
      if (el) el.style.height = "";
    }
  }, [open, panelRef]);

  useEffect(() => {
    if (!open || !measure) {
      return;
    }

    const panel = panelRef.current;
    if (!panel) return;

    let scheduled = 0;

    const tick = () => {
      if (!openRef.current || !measureRef.current || lockingRef.current) return;
      const el = panelRef.current;
      if (!el) return;

      const newH = Math.ceil(el.getBoundingClientRect().height);
      const prev = prevHeightRef.current;

      if (prev === null || Math.abs(newH - prev) <= 2) {
        prevHeightRef.current = newH;
        return;
      }

      if (prefersReducedMotion()) {
        prevHeightRef.current = newH;
        el.style.height = "";
        return;
      }

      lockingRef.current = true;
      el.style.transition = "height 0s";
      el.style.height = `${prev}px`;
      void el.offsetHeight;
      el.style.transition = "";
      el.style.height = `${newH}px`;
    };

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(scheduled);
      scheduled = requestAnimationFrame(tick);
    });

    prevHeightRef.current = null;
    ro.observe(panel);
    scheduled = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(scheduled);
      ro.disconnect();
    };
  }, [open, measure, panelRef]);

  function onHeightTransitionEnd(e: TransitionEvent<HTMLDivElement>) {
    if (e.propertyName !== "height") return;
    if (!openRef.current) return;
    lockingRef.current = false;
    const el = panelRef.current;
    if (el) {
      el.style.height = "";
      prevHeightRef.current = Math.ceil(el.getBoundingClientRect().height);
    }
  }

  return { onHeightTransitionEnd };
}
