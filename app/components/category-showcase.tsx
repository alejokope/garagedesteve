import type { CategoryId } from "@/lib/data";
import Image from "next/image";

const tiles: {
  title: string;
  subtitle: string;
  category: CategoryId;
  image: string;
  span?: string;
}[] = [
  {
    title: "MacBook",
    subtitle: "Pro, Air",
    category: "mac",
    image:
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1200&q=85",
    span: "sm:col-span-2",
  },
  {
    title: "iPhone",
    subtitle: "Nuevos y usados premium",
    category: "iphone",
    image:
      "https://images.unsplash.com/photo-1696446702183-cbd41c710f55?w=1000&q=85",
  },
  {
    title: "Apple Watch",
    subtitle: "Ultra, Series",
    category: "watch",
    image:
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=1000&q=85",
  },
  {
    title: "Audio & iMac",
    subtitle: "AirPods, escritorio",
    category: "audio",
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1000&q=85",
  },
  {
    title: "Servicio técnico",
    subtitle: "Diagnóstico y reparación",
    category: "servicio",
    image:
      "https://images.unsplash.com/photo-1580894894513-541e068a3e2e?w=1200&q=85",
    span: "sm:col-span-2",
  },
  {
    title: "Otras marcas",
    subtitle: "Más equipos",
    category: "otros",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1000&q=85",
  },
];

export function CategoryShowcase() {
  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2 className="font-display text-xl font-semibold text-neutral-950 sm:text-2xl">
          Categorías
        </h2>
        <p className="mt-2 text-[15px] text-neutral-600">
          Entrá directo al listado filtrado.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile) => (
            <a
              key={tile.title}
              href={`/tienda?cat=${tile.category}#catalogo`}
              className={`group relative flex min-h-[200px] overflow-hidden rounded-3xl bg-neutral-100 shadow-sm ring-1 ring-black/[0.04] transition duration-300 hover:-translate-y-0.5 hover:shadow-[var(--glow)] lg:min-h-[220px] ${tile.span ?? ""}`}
            >
              <Image
                src={tile.image}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="relative z-10 mt-auto p-6">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
                  Ver
                </p>
                <p className="font-display text-xl font-semibold text-white">
                  {tile.title}
                </p>
                <p className="mt-1 text-sm text-white/85">{tile.subtitle}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
