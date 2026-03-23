import { homeFaq } from "@/lib/home-content";

export function HomeFaq() {
  return (
    <section id="faq" className="scroll-mt-24 border-b border-[var(--border)] bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-8">
        <div className="text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
            Preguntas frecuentes
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-500 sm:text-base">
            Resolvemos las dudas más comunes sobre nuestros productos y
            servicios
          </p>
        </div>

        <div className="mt-10 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[#fafafa] px-2 sm:px-4">
          {homeFaq.map((item) => (
            <details
              key={item.q}
              className="group [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 pl-3 pr-2 text-left font-semibold text-neutral-950 transition hover:text-[var(--brand-from)] sm:py-6 sm:pl-4">
                <span className="text-[15px] sm:text-base">{item.q}</span>
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
