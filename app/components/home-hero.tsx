import Image from "next/image";
import Link from "next/link";

import type { HomeHeroData } from "@/lib/home-types";

export function HomeHero({ data }: { data: HomeHeroData }) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(180deg,#ffffff_0%,#f8f9fa_100%)]">
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 sm:gap-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-2 lg:items-center lg:gap-14">
        <div className="motion-safe:fade-up order-2 max-w-xl lg:order-1">
          <h1 className="font-display text-balance text-[clamp(1.75rem,4vw+0.75rem,2.75rem)] font-semibold leading-[1.1] tracking-tight text-neutral-950">
            {data.titleBefore}{" "}
            <span className="text-gradient-brand">{data.titleHighlight}</span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-neutral-500 sm:text-base">
            {data.subtitle}
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href={data.primaryCta.href}
              className="inline-flex h-12 min-w-[9.5rem] items-center justify-center rounded-xl bg-gradient-brand px-8 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgba(124,58,237,0.55)] transition hover:opacity-[0.97] active:scale-[0.99]"
            >
              {data.primaryCta.label}
            </Link>
            <Link
              href={data.secondaryCta.href}
              className="group inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-neutral-800 transition hover:text-[var(--brand-from)]"
            >
              {data.secondaryCta.label}
              <span aria-hidden className="transition group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
          <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-10 sm:mt-14 sm:gap-6 sm:pt-12">
            {data.stats.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-lg font-bold tabular-nums text-neutral-950 sm:text-xl">
                  {s.value}
                </dt>
                <dd className="mt-1 text-xs font-medium text-neutral-500 sm:text-sm">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative order-1 flex justify-center lg:order-2 lg:justify-end">
          <div
            aria-hidden
            className="absolute -right-8 top-1/2 h-[min(90vw,28rem)] w-[min(90vw,28rem)] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.12)_0%,transparent_68%)]"
          />
          <div className="relative aspect-square w-full max-w-[min(100%,22rem)] sm:max-w-md lg:max-w-none">
            <Image
              src={data.imageSrc}
              alt={data.imageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 480px"
              className="object-contain object-center drop-shadow-[0_24px_48px_rgba(15,23,42,0.12)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
