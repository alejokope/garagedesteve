import Image from "next/image";
import Link from "next/link";

import type { HomeServiceTechData } from "@/lib/home-types";
import type { HomeServiceFeature } from "@/lib/home-content";

function ServiceIcon({ icon }: { icon: HomeServiceFeature["icon"] }) {
  const common = "h-5 w-5";
  switch (icon) {
    case "shield":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      );
    case "badge":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      );
    case "puzzle":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21a2.652 2.652 0 002.663-.07c.18-.07.37-.12.57-.15a2.25 2.25 0 002.12-2.19V9.75a2.25 2.25 0 00-2.25-2.25h-5.379a2.25 2.25 0 00-1.59.659l-3 3a2.25 2.25 0 000 3.182l5.378 5.378" />
        </svg>
      );
    case "clock":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
}

export function HomeServiceTech({ data }: { data: HomeServiceTechData }) {
  return (
    <section
      id="servicio-tecnico"
      className="scroll-mt-24 border-b border-[var(--border)] bg-[#fafafa] py-12 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <h2 className="font-display text-[1.375rem] font-semibold leading-snug tracking-tight text-neutral-950 sm:text-3xl">
              {data.title}
            </h2>
            <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-neutral-500 sm:mt-4 sm:text-base">
              {data.intro}
            </p>
            <ul className="mt-8 space-y-5 sm:mt-10 sm:space-y-6">
              {data.features.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--brand-from)]/12 text-[var(--brand-from)]">
                    <ServiceIcon icon={item.icon} />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-neutral-950">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href={data.ctaHref}
              className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-neutral-950 px-8 text-sm font-semibold text-white shadow-[0_12px_40px_-16px_rgba(0,0,0,0.2)] transition hover:bg-neutral-800 sm:mt-10 sm:w-auto sm:rounded-lg"
            >
              {data.ctaLabel}
            </Link>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-xl bg-neutral-200 shadow-[var(--glow-lg)] ring-1 ring-black/[0.04] sm:rounded-2xl">
              <div className="relative aspect-[16/11] sm:aspect-[4/3] lg:aspect-[5/4]">
                <Image
                  src={data.imageUrl}
                  alt={data.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
