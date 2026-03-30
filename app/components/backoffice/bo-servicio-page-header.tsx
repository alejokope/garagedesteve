import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  kicker: string;
  title: string;
  description: ReactNode;
  publicHref: string;
  publicLabel: string;
};

export function BoServicioPageHeader({
  kicker,
  title,
  description,
  publicHref,
  publicLabel,
}: Props) {
  return (
    <header className="space-y-4 border-b border-white/[0.06] pb-6 sm:space-y-0 sm:pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{kicker}</p>
          <h1 className="mt-1 font-display text-xl font-semibold text-white sm:text-2xl md:text-3xl">
            {title}
          </h1>
          <div className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">{description}</div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Link
            href={publicHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-violet-600/25 px-4 py-2.5 text-center text-sm font-semibold text-violet-200 ring-1 ring-violet-500/30 transition hover:bg-violet-600/35 hover:text-white"
          >
            {publicLabel} ↗
          </Link>
          <Link
            href="/backoffice"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            ← Panel
          </Link>
        </div>
      </div>
    </header>
  );
}
