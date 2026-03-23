"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/app/context/cart-context";
import { siteConfig } from "@/lib/site-config";

function mobileNavItemKey(
  item:
    | (typeof siteConfig.shopNav)[number]
    | (typeof siteConfig.nav)[number],
): string {
  if ("id" in item && item.id) return item.id;
  if ("href" in item) return `${item.href}::${item.label}`;
  return "nav";
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [favOn, setFavOn] = useState(false);
  const { count } = useCart();

  const isShop = pathname.startsWith("/tienda") || pathname === "/carrito";
  const catalogActive = pathname === "/tienda";
  const detailActive = pathname.startsWith("/tienda/") && pathname !== "/tienda";
  const cartActive = pathname === "/carrito";

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

  const navLinkClass = (active: boolean) =>
    `relative pb-0.5 text-sm font-medium transition-colors ${
      active
        ? "text-[var(--brand-from)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-[var(--brand-from)]"
        : "text-neutral-600 hover:text-[var(--brand-from)]"
    }`;

  return (
    <>
      <header className="sticky top-0 z-[60] border-b border-[var(--border)] bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8">
          <Link
            href="/"
            className="group flex min-w-0 shrink-0 items-center gap-2"
            onClick={() => setMenuOpen(false)}
          >
            {isShop ? (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-white shadow-sm">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                </svg>
              </span>
            ) : null}
            <span className="font-display text-lg font-bold tracking-tight text-[#4c1d95] transition-opacity group-hover:opacity-90 sm:text-xl">
              {siteConfig.brandName}
            </span>
          </Link>

          {isShop ? (
            <nav className="hidden items-center justify-center gap-4 text-sm lg:flex xl:gap-6">
              <Link
                href="/tienda"
                className={navLinkClass(catalogActive)}
              >
                Catálogo de Productos
              </Link>
              <Link
                href={siteConfig.shopExampleProductPath}
                className={navLinkClass(detailActive)}
              >
                Detalle de Producto
              </Link>
              <Link href="/carrito" className={navLinkClass(cartActive)}>
                Carrito
              </Link>
              <Link href="/#servicio-tecnico" className={navLinkClass(false)}>
                Servicio Técnico
              </Link>
              <Link href="/tienda" className={navLinkClass(false)}>
                Seguimiento de Pedido
              </Link>
              <Link href="/#faq" className={navLinkClass(false)}>
                Ayuda &amp; FAQ
              </Link>
            </nav>
          ) : (
            <nav className="hidden items-center justify-center gap-7 text-sm font-medium text-neutral-600 lg:flex xl:gap-9">
              {siteConfig.nav.map((item) => (
                <Link
                  key={`${item.href}::${item.label}`}
                  href={item.href}
                  className="transition-colors hover:text-[var(--brand-from)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            {isShop ? (
              <>
                <button
                  type="button"
                  onClick={() => setFavOn((v) => !v)}
                  className="hidden h-11 w-11 items-center justify-center rounded-xl text-neutral-700 transition-colors hover:bg-neutral-100 sm:flex"
                  aria-label={favOn ? "Quitar de favoritos" : "Favoritos"}
                  aria-pressed={favOn}
                >
                  <svg
                    className={`h-[22px] w-[22px] ${favOn ? "fill-red-500 text-red-500" : ""}`}
                    fill={favOn ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                </button>
                <Link
                  href="/carrito"
                  className="relative flex h-11 w-11 items-center justify-center rounded-xl text-neutral-800 transition-colors hover:bg-neutral-100"
                  aria-label={`Carrito${count ? `, ${count} productos` : ""}`}
                >
                  <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                  </svg>
                  {count > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--brand-from)] px-1 text-[10px] font-bold text-white shadow-sm">
                      {count > 99 ? "99+" : count}
                    </span>
                  ) : null}
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-neutral-700 transition-colors hover:bg-neutral-100"
                  aria-label="Cuenta"
                >
                  <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </button>
                <Link
                  href="/carrito"
                  className="relative flex h-11 w-11 items-center justify-center rounded-xl text-neutral-800 transition-colors hover:bg-neutral-100"
                  aria-label={`Carrito${count ? `, ${count} productos` : ""}`}
                >
                  <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                  </svg>
                  {count > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-neutral-950 px-1 text-[10px] font-bold text-white">
                      {count > 99 ? "99+" : count}
                    </span>
                  ) : null}
                </Link>
              </>
            )}
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
        className={`fixed inset-0 z-50 lg:hidden ${
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
          className={`absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            paddingTop: "max(1rem, env(safe-area-inset-top))",
            paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
          }}
        >
          <div className="flex flex-1 flex-col gap-1 px-6 pt-4">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Menú
            </p>
            {(isShop ? siteConfig.shopNav : siteConfig.nav).map((item) => (
              <Link
                key={mobileNavItemKey(item)}
                href={"href" in item ? item.href : "/"}
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
