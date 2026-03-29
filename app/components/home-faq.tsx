import type { HomeFaqData } from "@/lib/home-types";

export function HomeFaq({ data }: { data: HomeFaqData }) {
  return (
    <section id="faq" className="scroll-mt-24 border-b border-[var(--border)] bg-white py-12 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="text-left sm:text-center">
          <h2 className="font-display text-[1.375rem] font-semibold leading-snug tracking-tight text-neutral-950 sm:text-3xl">
            {data.sectionTitle}
          </h2>
          <p className="mt-2.5 text-[15px] leading-relaxed text-neutral-500 sm:mt-3 sm:text-base">
            {data.sectionSubtitle}
          </p>
        </div>

        <div className="mt-8 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[#fafafa] px-1 sm:mt-10 sm:rounded-2xl sm:px-4">
          {data.items.map((item) => (
            <details
              key={item.q}
              className="group [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 pl-3 pr-2 text-left font-semibold text-neutral-950 transition hover:text-[var(--brand-from)] sm:gap-4 sm:py-6 sm:pl-4">
                <span className="pr-1 text-[15px] leading-snug sm:text-base">{item.q}</span>
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition group-open:rotate-180"
                  aria-hidden
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <p className="px-3 pb-5 pl-3 pr-2 text-sm leading-relaxed text-neutral-600 sm:px-4 sm:pb-6">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
