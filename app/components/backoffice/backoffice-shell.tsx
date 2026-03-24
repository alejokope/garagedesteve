"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

import { LogoutButton } from "@/app/components/backoffice/logout-button";

function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const nav = [
  { href: "/backoffice", label: "Inicio", icon: HomeIcon },
  { href: "/backoffice/contenido", label: "Contenido", icon: ContentIcon },
  { href: "/backoffice/productos", label: "Productos", icon: BoxIcon },
  { href: "/backoffice/servicio-tecnico/precios", label: "Servicio — Precios", icon: WrenchIcon },
  { href: "/backoffice/servicio-tecnico/solicitud", label: "Servicio — Solicitud", icon: WrenchIcon },
  { href: "/backoffice/listas/categorias", label: "Listas", icon: ListIcon },
] as const;

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ContentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 5h12M8 12h12M8 19h12M4 5h.01M4 12h.01M4 19h.01"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l9 4.5v9L12 21l-9-4.5v-9L12 3z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M12 12l9-4.5M12 12v9M12 12L3 7.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function BackofficeShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0c0e14] text-slate-100">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[#08090d] lg:flex">
        <div className="border-b border-white/[0.06] px-5 py-6">
          <p className="font-display text-lg font-semibold tracking-tight text-white">
            Garage
          </p>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
            Backoffice
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Principal">
          {nav.map((item) => {
            const active =
              item.href === "/backoffice"
                ? pathname === "/backoffice"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0 opacity-90" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 border-t border-white/[0.06] p-4 text-xs leading-relaxed text-slate-500">
          <p>Sesión protegida por contraseña (service role solo en servidor).</p>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex min-h-screen flex-1 flex-col lg:min-h-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/[0.06] bg-[#0c0e14]/95 px-4 py-3 backdrop-blur lg:hidden">
          <div>
            <p className="font-display text-base font-semibold text-white">Backoffice</p>
            <p className="text-[11px] text-slate-500">El Garage de Steve</p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-200"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
            aria-label="Abrir menú"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </header>

        {mobileOpen ? (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navegación"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/60"
              aria-label="Cerrar menú"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute right-0 top-0 flex h-full w-[min(100%,18rem)] flex-col border-l border-white/[0.08] bg-[#08090d] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4">
                <span className="font-display text-sm font-semibold text-white">Menú</span>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Cerrar"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 p-3">
                {nav.map((item) => {
                  const active =
                    item.href === "/backoffice"
                      ? pathname === "/backoffice"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                        active
                          ? "bg-white/[0.08] text-white"
                          : "text-slate-400 hover:bg-white/[0.04]"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        ) : null}

        <main className="relative flex-1">{children}</main>
      </div>
    </div>
  );
}
