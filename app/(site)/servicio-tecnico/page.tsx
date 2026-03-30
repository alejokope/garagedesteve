import type { Metadata } from "next";
import Link from "next/link";

import { RepairPricingView } from "@/app/components/repair-pricing-view";
import { RepairsTrackView } from "@/app/components/repairs-track-view";
import { ServicioTecnicoSubnav } from "@/app/components/servicio-tecnico-subnav";
import { SiteFooter } from "@/app/components/site-footer";
import { getRepairPricingConfig } from "@/lib/repair-content-server";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Servicio técnico · ${siteConfig.brandName}`,
  description:
    "Seguimiento de reparaciones con código, coordinación por WhatsApp y precios orientativos.",
};

export default async function ServicioTecnicoPage() {
  const pricingConfig = await getRepairPricingConfig();

  return (
    <main className="bg-[#f9fafb]">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-[3.5rem] sm:px-8 sm:pt-16">
        <nav className="text-sm text-neutral-500" aria-label="Migas de pan">
          <Link href="/" className="hover:text-[var(--brand-from)]">
            Inicio
          </Link>
          <span className="mx-2 text-neutral-300">/</span>
          <span className="font-medium text-neutral-700">Servicio técnico</span>
        </nav>

        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Servicio técnico
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-neutral-600 sm:text-base">
          Coordiná el trámite por WhatsApp, consultá el estado con tu código de seguimiento y revisá
          precios orientativos más abajo.
        </p>

        <ServicioTecnicoSubnav />

        <section id="seguimiento" className="scroll-mt-36">
          <RepairsTrackView variant="section" />
        </section>

        <div className="my-14 h-px bg-neutral-200/90" aria-hidden />

        <section id="precios" className="scroll-mt-36">
          <RepairPricingView config={pricingConfig} variant="section" />
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
