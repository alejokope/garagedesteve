"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/app/context/cart-context";
import { useFavorites } from "@/app/context/favorites-context";
import { useSellQuotes } from "@/app/context/sell-quotes-context";
import { useShopFeedback } from "@/app/context/shop-feedback-context";
import { siteConfig } from "@/lib/site-config";

function mobileNavItemKey(item: (typeof siteConfig.mainNav)[number]): string {
  return item.id;
}

function mainNavItemActive(id: string, pathname: string): boolean {
  switch (id) {
    case "shop":
      return pathname === "/tienda" || pathname.startsWith("/tienda/");
    case "favorites":
      return pathname === "/favoritos";
    case "cart":
      return pathname === "/carrito";
    case "service":
      return (
        pathname === "/servicio-tecnico" || pathname.startsWith("/servicio-tecnico/")
      );
    case "sell":
      return pathname === "/vende-tu-equipo" || pathname.startsWith("/vende-tu-equipo/");
    case "sedes":
    case "faq":
      return false;
    default:
      return false;
  }
}

function desktopNavLinkClass(active: boolean) {
  return [
    "relative inline-block whitespace-nowrap px-1 pb-1.5 text-[13px] font-medium leading-none tracking-tight text-neutral-500 transition-colors duration-200 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:rounded-sm",
    active
      ? "text-neutral-900 after:pointer-events-none after:absolute after:inset-x-1 after:bottom-0 after:h-px after:rounded-full after:bg-neutral-900"
      : "",
  ].join(" ");
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCart();
  const { count: favCount } = useFavorites();
  const { count: quotesCount } = useSellQuotes();
  const { cartPulseGeneration, favPulseGeneration } = useShopFeedback();
  /** Evita mismatch de hidratación si el HTML del servidor quedó cacheado (Turbopack/HMR) distinto al bundle del cliente. */
  const [desktopNavReady, setDesktopNavReady] = useState(false);

  useEffect(() => {
    setDesktopNavReady(true);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-[60] border-b border-[var(--border)] bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-1.5 pt-[max(0.5rem,env(safe-area-inset-top))] sm:gap-4 sm:px-8 sm:py-2">
          <Link
            href="/"
            className="group flex h-[40px] min-h-[40px] max-h-[40px] min-w-0 shrink-0 items-center"
            onClick={() => setMenuOpen(false)}
          >
            <Image
              src="/brand/garage-logo.png"
              alt={siteConfig.brandName}
              width={864}
              height={1080}
              className="h-[40px] max-h-[40px] w-auto min-h-0 object-contain object-left"
              priority
              unoptimized
            />
            <span className="sr-only">{siteConfig.brandName}</span>
          </Link>

          <nav
            className="hidden min-w-0 flex-1 justify-center lg:flex"
            aria-label="Principal"
          >
            {desktopNavReady ? (
              <ul className="flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:gap-x-4 lg:gap-x-5">
                {siteConfig.mainNav.map((item) => {
                  const active = mainNavItemActive(item.id, pathname);
                  return (
                    <li key={item.id}>
                      <Link href={item.href} className={desktopNavLinkClass(active)}>
                        {item.shortLabel}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div
                className="mx-auto min-h-[2.25rem] w-full max-w-3xl"
                aria-hidden
              />
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <Link
              href="/favoritos"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl text-neutral-700 transition-colors hover:bg-neutral-100"
              aria-label={`Favoritos${favCount ? `, ${favCount} guardados` : ""}`}
            >
              <span
                key={favPulseGeneration}
                className={
                  favPulseGeneration > 0
                    ? "egd-header-icon-pulse inline-flex items-center justify-center"
                    : "inline-flex items-center justify-center"
                }
              >
                <svg
                  className={`h-[22px] w-[22px] ${favCount > 0 ? "fill-red-500 text-red-500" : ""}`}
                  fill={favCount > 0 ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
              </span>
              {favCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                  {favCount > 99 ? "99+" : favCount}
                </span>
              ) : null}
            </Link>
            <Link
              href="/cotizaciones-usados"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl text-neutral-700 transition-colors hover:bg-neutral-100"
              aria-label={`Mis cotizaciones${quotesCount ? `, ${quotesCount} guardadas` : ""}`}
            >
              <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {quotesCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white shadow-sm">
                  {quotesCount > 99 ? "99+" : quotesCount}
                </span>
              ) : null}
            </Link>
            <Link
              href="/carrito"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl text-neutral-800 transition-colors hover:bg-neutral-100"
              aria-label={`Carrito${count ? `, ${count} productos` : ""}`}
            >
              <span
                key={cartPulseGeneration}
                className={
                  cartPulseGeneration > 0
                    ? "egd-header-icon-pulse inline-flex items-center justify-center"
                    : "inline-flex items-center justify-center"
                }
              >
                <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
              </span>
              {count > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--brand-from)] px-1 text-[10px] font-bold text-white shadow-sm">
                  {count > 99 ? "99+" : count}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-neutral-800 transition-colors hover:bg-neutral-100 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-nav"
        className={`fixed inset-0 z-[80] lg:hidden ${
          menuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/25 backdrop-blur-sm transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Cerrar menú"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
        />
        <nav
          className={`absolute inset-0 flex min-h-0 flex-col bg-white transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
          }}
        >
          <div className="flex shrink-0 items-center justify-end border-b border-neutral-100 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 sm:px-4">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-neutral-800 transition-colors hover:bg-neutral-100"
              aria-label="Cerrar menú"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-6 pt-4">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Menú
            </p>
            {siteConfig.mainNav.map((item) => (
              <Link
                key={mobileNavItemKey(item)}
                href={item.href}
                className="rounded-xl px-4 py-4 text-lg font-medium text-neutral-900 transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
