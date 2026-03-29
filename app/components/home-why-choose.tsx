import type { HomeWhyChooseData } from "@/lib/home-types";

function CardIcon({ highlight }: { highlight?: boolean }) {
  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
        highlight
          ? "bg-white/20 text-white"
          : "bg-[var(--brand-from)]/10 text-[var(--brand-from)]"
      }`}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );
}

export function HomeWhyChoose({ data }: { data: HomeWhyChooseData }) {
  return (
    <section className="border-b border-[var(--border)] bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
            {data.sectionTitle}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-500 sm:text-base">
            {data.sectionSubtitle}
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {data.items.map((item) => (
            <div
              key={item.title}
              className={`rounded-2xl border p-7 transition ${
                item.highlight
                  ? "border-neutral-900 bg-neutral-950 text-white shadow-[var(--glow-lg)]"
                  : "border-[var(--border)] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] hover:shadow-[var(--glow)]"
              }`}
            >
              <CardIcon highlight={item.highlight} />
              <h3
                className={`font-display mt-5 text-lg font-semibold ${
                  item.highlight ? "text-white" : "text-neutral-950"
                }`}
              >
                {item.title}
              </h3>
              <p
                className={`mt-2 text-sm leading-relaxed ${
                  item.highlight ? "text-white/90" : "text-neutral-500"
                }`}
              >
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
