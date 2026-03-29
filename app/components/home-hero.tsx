import Image from "next/image";
import Link from "next/link";

import type { HomeHeroData } from "@/lib/home-types";

export function HomeHero({ data }: { data: HomeHeroData }) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(180deg,#ffffff_0%,#fafafa_100%)]">
      <div className="relative mx-auto grid max-w-6xl gap-7 px-5 pb-12 pt-8 sm:gap-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-2 lg:items-center lg:gap-14">
        <div className="motion-safe:fade-up order-2 max-w-xl lg:order-1">
          <h1 className="font-display text-balance text-[clamp(1.625rem,5.2vw+0.5rem,2.75rem)] font-semibold leading-[1.12] tracking-tight text-neutral-950">
            {data.titleBefore}{" "}
            <span className="font-semibold text-neutral-950">{data.titleHighlight}</span>
          </h1>
          <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-neutral-500 sm:mt-5 sm:text-base">
            {data.subtitle}
          </p>
          <div className="mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
            <Link
              href={data.primaryCta.href}
              className="inline-flex h-12 w-full min-w-0 items-center justify-center rounded-xl bg-neutral-950 px-8 text-sm font-semibold text-white shadow-[0_12px_40px_-16px_rgba(0,0,0,0.25)] transition hover:bg-neutral-800 active:scale-[0.99] sm:w-auto sm:min-w-[9.5rem] sm:rounded-lg"
            >
              {data.primaryCta.label}
            </Link>
            <Link
              href={data.secondaryCta.href}
              className="group inline-flex h-11 w-full items-center justify-center gap-1.5 text-sm font-semibold text-neutral-700 underline-offset-4 transition hover:text-neutral-950 hover:underline sm:h-auto sm:w-auto"
            >
              {data.secondaryCta.label}
              <span aria-hidden className="transition group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
          <dl className="mt-10 border-t border-[var(--border)] pt-8 sm:mt-14 sm:pt-12">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-6">
              {data.stats.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-white/80 px-4 py-3.5 sm:block sm:border-0 sm:bg-transparent sm:p-0"
                >
                  <dt className="font-display text-xl font-bold tabular-nums text-neutral-950 sm:text-xl">
                    {s.value}
                  </dt>
                  <dd className="max-w-[65%] text-right text-xs font-medium leading-snug text-neutral-500 sm:mt-1 sm:max-w-none sm:text-left sm:text-sm">
                    {s.label}
                  </dd>
                </div>
              ))}
            </div>
          </dl>
        </div>

        <div className="relative order-1 flex justify-center lg:order-2 lg:justify-end">
          <div
            aria-hidden
            className="absolute -right-8 top-1/2 hidden h-[min(90vw,28rem)] w-[min(90vw,28rem)] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.06)_0%,transparent_68%)] sm:block"
          />
          <div className="relative aspect-square w-full max-w-[15.5rem] min-[380px]:max-w-[17rem] sm:max-w-md lg:max-w-none">
            <Image
              src={data.imageSrc}
              alt={data.imageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 480px"
              className="object-contain object-center drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
