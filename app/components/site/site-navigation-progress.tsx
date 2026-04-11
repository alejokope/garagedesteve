"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";

function sameDestination(href: string, pathname: string, search: string): boolean {
  try {
    const u = new URL(href, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    const path = u.pathname;
    const q = u.search.replace(/^\?/, "");
    const current = search ? `${pathname}?${search}` : pathname;
    const target = q ? `${path}?${q}` : path;
    return target === current;
  } catch {
    return false;
  }
}

/**
 * Barra fina bajo el header al navegar: feedback inmediato al clic (antes de que termine el RSC).
 */
export function SiteNavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [active, setActive] = useState(false);
  const prevKey = useRef(`${pathname}?${search}`);

  useEffect(() => {
    const key = `${pathname}?${search}`;
    if (key !== prevKey.current) {
      prevKey.current = key;
      startTransition(() => setActive(false));
    }
  }, [pathname, search]);

  useEffect(() => {
    if (!active) return;
    const max = window.setTimeout(() => setActive(false), 14_000);
    return () => window.clearTimeout(max);
  }, [active]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const el = e.target as HTMLElement | null;
      const a = el?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      if (a.target && a.target !== "" && a.target !== "_self") return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (/^https?:\/\//i.test(href)) return;
      if (sameDestination(href, pathname, search)) return;
      setActive(true);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [pathname, search]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[70] h-[2px] overflow-hidden bg-neutral-100/90"
      role="progressbar"
      aria-hidden
    >
      <div className="egd-nav-progress-indeterminate h-full w-[34%] max-w-[220px] bg-[var(--brand-from)]" />
    </div>
  );
}
