import Image from "next/image";
import Link from "next/link";

import {
  SERVICE_CATEGORY_DEFAULT_ALT,
  SERVICE_CATEGORY_DEFAULT_IMAGE,
  type HomeCategoryTile,
} from "@/lib/home-categories";
import type { HomeCategoriesData } from "@/lib/home-types";

const carouselTrack =
  "-mx-5 flex touch-scroll-x snap-x snap-mandatory items-stretch gap-4 overflow-x-auto overscroll-x-contain scroll-pl-5 scroll-pr-5 pb-2 pt-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-scroll-x";

/** Mínimo ≈ tarjeta con foto (4/3 + texto); solo se usa en el carrusel móvil. */
const carouselSlide =
  "flex min-h-[24rem] w-[min(19rem,calc(100vw-2.75rem))] shrink-0 snap-start flex-col";

function CtaLink({ label }: { label: string }) {
  return (
    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-from)] transition group-hover:gap-1.5">
      {label}
      <span aria-hidden>→</span>
    </span>
  );
}

function productCategoryHref(tile: HomeCategoryTile & { kind: "product" }): string {
  return `/tienda?cat=${encodeURIComponent(tile.category)}#catalogo`;
}

function tileImage(tile: HomeCategoryTile): { src: string; alt: string } {
  if (tile.kind === "product") {
    return {
      src: tile.image.trim() || SERVICE_CATEGORY_DEFAULT_IMAGE,
      alt: tile.imageAlt.trim() || tile.title,
    };
  }
  return {
    src: tile.image?.trim() || SERVICE_CATEGORY_DEFAULT_IMAGE,
    alt: tile.imageAlt?.trim() || SERVICE_CATEGORY_DEFAULT_ALT,
  };
}

function HomeCategoryTileCard({ tile }: { tile: HomeCategoryTile }) {
  const { src, alt } = tileImage(tile);
  const isService = tile.kind === "service";
  const href = isService ? tile.href : productCategoryHref(tile);
  const ctaLabel = isService ? "Saber más" : "Ver productos";

  return (
    <Link
      href={href}
      className="group flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-[var(--glow)] sm:h-full sm:flex-none"
    >
      {/* Proporción alineada con HOME_CATEGORY_TILE_* en lib/home-categories.ts */}
      <div className="relative aspect-[4/3] bg-neutral-100">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 85vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-base font-semibold text-neutral-950 sm:text-lg">
          {tile.title}
        </h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-neutral-500 sm:mt-2">
          {tile.description}
        </p>
        <CtaLink label={ctaLabel} />
      </div>
    </Link>
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

        <div className="mt-8 sm:mt-12">
          <div
            className={`${carouselTrack} sm:hidden`}
            role="region"
            aria-roledescription="carrusel"
            aria-label="Categorías, deslizá para ver más"
          >
            {data.tiles.map((tile) => (
              <div key={tile.title} className={carouselSlide}>
                <HomeCategoryTileCard tile={tile} />
              </div>
            ))}
          </div>

          <div className="hidden gap-4 sm:mt-0 sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {data.tiles.map((tile) => (
              <HomeCategoryTileCard key={tile.title} tile={tile} />
            ))}
          </div>
        </div>

        <p className="mt-3 text-center text-xs font-medium tracking-wide text-neutral-400 sm:hidden">
          Deslizá para ver más
        </p>
      </div>
    </section>
  );
}
