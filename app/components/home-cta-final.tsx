import Link from "next/link";

import type { HomeCtaFinalData } from "@/lib/home-types";

export function HomeCtaFinal({ data }: { data: HomeCtaFinalData }) {
  return (
    <section className="relative overflow-hidden border-t border-[var(--border)] py-12 sm:py-20">
      <div aria-hidden className="absolute inset-0 bg-neutral-950" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-white/[0.04] blur-3xl"
      />
      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <h2 className="font-display text-[1.375rem] font-semibold leading-snug text-white sm:text-3xl sm:leading-tight">
          {data.title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-white/85 sm:mt-4 sm:text-base">
          {data.subtitle}
        </p>
        <div className="mt-8 flex max-w-md flex-col items-stretch justify-center gap-3 sm:mx-auto sm:mt-10 sm:max-w-none sm:flex-row sm:items-center">
          <Link
            href={data.primaryCta.href}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-sm font-semibold text-neutral-950 shadow-lg transition hover:bg-neutral-100"
          >
            {data.primaryCta.label}
          </Link>
          <Link
            href={data.secondaryCta.href}
            className="inline-flex h-12 items-center justify-center rounded-lg border border-white/40 bg-transparent px-8 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {data.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
