import Image from "next/image";

import type { HomeTestimonialsData } from "@/lib/home-types";

function Stars() {
  return (
    <div className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="h-4 w-4 text-amber-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function HomeTestimonials({ data }: { data: HomeTestimonialsData }) {
  return (
    <section className="border-b border-[var(--border)] bg-[#f8f9fa] py-12 sm:py-20 lg:py-24">
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
          {data.items.map((t, i) => (
            <blockquote
              key={`${t.name}-${i}`}
              className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)] sm:p-7"
            >
              <Stars />
              <p className="mt-4 flex-1 text-[15px] leading-relaxed text-neutral-600">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-6 flex items-center gap-3 border-t border-[var(--border)] pt-5">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-neutral-100 ring-2 ring-white">
                  <Image
                    src={t.avatar}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-semibold text-neutral-950">
                    {t.name}
                  </p>
                  <p className="truncate text-xs text-neutral-500">{t.role}</p>
                  {t.verified !== false ? (
                    <span className="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                      Comprador verificado
                    </span>
                  ) : null}
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
