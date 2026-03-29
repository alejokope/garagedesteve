/** Placeholder para `dynamic({ ssr: false })` — dos tracks como FeaturedProductCardsGrid. */
const carouselTrack =
  "-mx-5 flex touch-scroll-x snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-pl-5 scroll-pr-5 pb-2 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-scroll-x";

const carouselSlide =
  "flex h-full w-[min(19rem,calc(100vw-2.75rem))] shrink-0 snap-start flex-col";

function SkeletonCard() {
  return (
    <div className="flex min-h-[300px] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-neutral-50 animate-pulse">
      <div className="aspect-[5/4] bg-neutral-100 sm:aspect-square" />
      <div className="flex flex-1 flex-col gap-2 p-4 pt-3 sm:p-5 sm:pt-4">
        <div className="h-4 w-[75%] rounded-md bg-neutral-200" />
        <div className="h-3 w-full rounded-md bg-neutral-100" />
        <div className="h-3 w-[66%] rounded-md bg-neutral-100" />
        <div className="mt-2 h-6 w-28 rounded-md bg-neutral-200" />
        <div className="mt-auto h-11 w-full rounded-xl bg-neutral-200" />
      </div>
    </div>
  );
}

export function FeaturedGridSkeleton({ count = 8 }: { count?: number }) {
  const n = Math.min(Math.max(count, 1), 12);
  return (
    <>
      <div className={`${carouselTrack} sm:hidden`} aria-hidden>
        {Array.from({ length: n }).map((_, i) => (
          <div key={`m-${i}`} className={carouselSlide}>
            <SkeletonCard />
          </div>
        ))}
      </div>

      <div
        className="hidden w-full min-w-0 gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
        aria-hidden
      >
        {Array.from({ length: n }).map((_, i) => (
          <SkeletonCard key={`d-${i}`} />
        ))}
      </div>
    </>
  );
}
