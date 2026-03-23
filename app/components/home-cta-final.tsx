import Link from "next/link";

import type { HomeCtaFinalData } from "@/lib/home-types";

export function HomeCtaFinal({ data }: { data: HomeCtaFinalData }) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(135deg,var(--brand-from)_0%,#4f46e5_45%,#312e81_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-8">
        <h2 className="font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
          {data.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/85 sm:text-base">
          {data.subtitle}
        </p>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            href={data.primaryCta.href}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-semibold text-[var(--brand-from)] shadow-lg transition hover:bg-neutral-100"
          >
            {data.primaryCta.label}
          </Link>
          <Link
            href={data.secondaryCta.href}
            className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-white/90 bg-transparent px-8 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {data.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
