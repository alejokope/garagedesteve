import Image from "next/image";
import Link from "next/link";

import type { HomeCategoriesData } from "@/lib/home-types";

function ArrowLink() {
  return (
    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-from)] transition group-hover:gap-1.5">
      Ver productos
      <span aria-hidden>→</span>
    </span>
  );
}

export function HomeCategoriesGrid({ data }: { data: HomeCategoriesData }) {
  return (
    <section className="border-b border-[var(--border)] bg-[#fafafa] py-12 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-left sm:text-center">
          <h2 className="font-display text-[1.375rem] font-semibold leading-snug tracking-tight text-neutral-950 sm:text-3xl">
            {data.sectionTitle}
          </h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-neutral-500 sm:mt-3 sm:text-base">
            {data.sectionSubtitle}
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {data.tiles.map((tile) =>
            tile.kind === "service" ? (
              <Link
                key={tile.title}
                href={tile.href}
                className="group relative flex min-h-0 flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950 p-6 text-left shadow-[var(--glow-lg)] transition hover:bg-neutral-900 sm:min-h-[18rem] sm:gap-0 sm:p-8"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-white/10">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.121 14.121L19 19m-2-2l1.414-1.414a2 2 0 00-2.828-2.828l-1.414 1.414m2 2L14.12 14.12m-2.829-2.828L4 4m5.657 5.657l6.364 6.364"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-white sm:text-xl">
                    {tile.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/90">
                    {tile.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-white/95">
                    Saber más
                    <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            ) : (
              <Link
                key={tile.title}
                href={tile.href}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-[var(--glow)]"
              >
                <div className="relative aspect-[4/3] bg-neutral-100">
                  <Image
                    src={tile.image}
                    alt={tile.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="font-display text-base font-semibold text-neutral-950 sm:text-lg">
                    {tile.title}
                  </h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-neutral-500 sm:mt-2">
                    {tile.description}
                  </p>
                  <ArrowLink />
                </div>
              </Link>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
