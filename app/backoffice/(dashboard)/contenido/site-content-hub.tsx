"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useBackofficeSaveBarReporter } from "@/app/components/backoffice/backoffice-save-bar";
import type { ProductRow } from "@/lib/backoffice/products-db";
import { SITE_HOME_SECTION_META } from "@/lib/backoffice/site-content-sections-meta";
import {
  HOME_CATEGORY_TILE_ASPECT_LABEL,
  HOME_CATEGORY_TILE_IMAGE_GUIDE_ES,
  HOME_CATEGORY_TILE_RECOMMENDED_PX,
  SERVICE_CATEGORY_DEFAULT_ALT,
  SERVICE_CATEGORY_DEFAULT_IMAGE,
  type HomeCategoryTile,
} from "@/lib/home-categories";
import type {
  HomeCategoriesData,
  HomeCtaFinalData,
  HomeFaqData,
  HomeHeroData,
  HomeServiceTechData,
  HomeTestimonialsData,
  HomeWhyChooseData,
} from "@/lib/home-types";
import type { HomeContentKey } from "@/lib/home-public-content";

import { HomeCategoryTileImageUpload } from "./home-category-tile-image-upload";
import { saveHomeSection } from "./home-section-actions";

const inputClass =
  "w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:ring-2 focus:ring-violet-500/40";
const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500";
const btnGhost =
  "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 disabled:opacity-50";

const SERVICE_ICONS: { value: HomeServiceTechData["features"][0]["icon"]; label: string }[] = [
  { value: "shield", label: "Escudo (garantía)" },
  { value: "badge", label: "Insignia (certificación)" },
  { value: "puzzle", label: "Rompecabezas (repuestos)" },
  { value: "clock", label: "Reloj (tiempos)" },
];

function ModuleVisibilityToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (visible: boolean) => void;
}) {
  return (
    <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.1] bg-violet-950/25 px-4 py-3 ring-1 ring-violet-500/20">
      <input
        type="checkbox"
        className="mt-1 size-4 shrink-0 rounded border-white/20 bg-black/40 text-violet-500 focus:ring-violet-500/40"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <span className="font-medium text-white">Mostrar este bloque en la página de inicio</span>
        <span className="mt-1 block text-xs leading-relaxed text-slate-400">
          Si lo desmarcás, no aparece en el sitio público. El contenido se puede seguir editando y guardando.
        </span>
      </span>
    </label>
  );
}

function SectionCard({
  anchorId,
  title,
  description,
  hasCustomInDb,
  visibleOnSite = true,
  children,
}: {
  anchorId: string;
  title: string;
  description: string;
  hasCustomInDb: boolean;
  /** Si es false, el módulo está oculto en la home pública */
  visibleOnSite?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      id={anchorId}
      className="group scroll-mt-24 rounded-2xl border border-white/[0.08] bg-white/[0.02] open:border-violet-500/25"
    >
      <summary className="cursor-pointer list-none px-5 py-4 sm:px-6 sm:py-5 [&::-webkit-details-marker]:hidden">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {hasCustomInDb ? "Guardado en la base de datos" : "Aún no guardaste en BD (se ven valores por defecto)"}
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold text-white sm:text-xl">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">{description}</p>
            {!visibleOnSite ? (
              <p className="mt-2 inline-flex rounded-lg bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-100/95 ring-1 ring-amber-400/30">
                Oculto en la web pública
              </p>
            ) : null}
          </div>
          <span className="shrink-0 rounded-lg bg-white/[0.06] px-2.5 py-1 text-xs text-slate-400 group-open:hidden">
            Abrir
          </span>
        </div>
      </summary>
      <div className="border-t border-white/[0.06] px-5 py-5 sm:px-6 sm:py-6">
        {children}
      </div>
    </details>
  );
}

function newProductTile(): HomeCategoryTile {
  return {
    kind: "product",
    title: "",
    description: "",
    href: "/tienda",
    category: "iphone",
    image: "",
    imageAlt: "",
  };
}

function newServiceTile(): HomeCategoryTile {
  return {
    kind: "service",
    title: "",
    description: "",
    href: "/servicio-tecnico",
    image: SERVICE_CATEGORY_DEFAULT_IMAGE,
    imageAlt: SERVICE_CATEGORY_DEFAULT_ALT,
  };
}

export type SiteContentHubProps = {
  /** Cambia cuando el servidor trae datos nuevos (tras guardar / recargar) */
  revision: string;
  homeKeys: HomeContentKey[];
  /** Valores ya combinados (por defecto + lo guardado): lo que ve el visitante */
  merged: {
    hero: HomeHeroData;
    categories: HomeCategoriesData;
    featuredIds: string[];
    featuredVisible: boolean;
    serviceTech: HomeServiceTechData;
    whyChoose: HomeWhyChooseData;
    testimonials: HomeTestimonialsData;
    faq: HomeFaqData;
    ctaFinal: HomeCtaFinalData;
  };
  hasRow: Record<string, boolean>;
  products: Pick<ProductRow, "id" | "name" | "published">[];
  /** Categorías activas desde Listas → Categorías (misma fuente que la tienda). */
  productCategoryOptions: { id: string; label: string }[];
};

export function SiteContentHub({
  revision,
  homeKeys,
  merged,
  hasRow,
  products,
  productCategoryOptions,
}: SiteContentHubProps) {
  const router = useRouter();
  const refresh = useCallback(() => router.refresh(), [router]);

  const publishedProducts = useMemo(
    () => [...products].filter((p) => p.published).sort((a, b) => a.name.localeCompare(b.name, "es")),
    [products],
  );

  const categoryOptions = useMemo(
    () =>
      productCategoryOptions.length > 0
        ? productCategoryOptions
        : [
            { id: "iphone", label: "iPhone" },
            { id: "ipad", label: "iPad" },
            { id: "mac", label: "MacBook" },
            { id: "watch", label: "Apple Watch" },
            { id: "audio", label: "AirPods" },
            { id: "desktop", label: "iMac" },
            { id: "servicio", label: "Servicio técnico" },
            { id: "otros", label: "Otros" },
          ],
    [productCategoryOptions],
  );

  const [hero, setHero] = useState<HomeHeroData>(merged.hero);
  const [categories, setCategories] = useState(merged.categories);
  const [featuredIds, setFeaturedIds] = useState<string[]>(merged.featuredIds);
  const [featuredVisible, setFeaturedVisible] = useState(merged.featuredVisible);
  const [serviceTech, setServiceTech] = useState<HomeServiceTechData>(merged.serviceTech);
  const [whyChoose, setWhyChoose] = useState<HomeWhyChooseData>(merged.whyChoose);
  const [testimonials, setTestimonials] = useState<HomeTestimonialsData>(merged.testimonials);
  const [faq, setFaq] = useState<HomeFaqData>(merged.faq);
  const [ctaFinal, setCtaFinal] = useState<HomeCtaFinalData>(merged.ctaFinal);

  useEffect(() => {
    setHero(merged.hero);
    setCategories(merged.categories);
    setFeaturedIds(merged.featuredIds);
    setFeaturedVisible(merged.featuredVisible);
    setServiceTech(merged.serviceTech);
    setWhyChoose(merged.whyChoose);
    setTestimonials(merged.testimonials);
    setFaq(merged.faq);
    setCtaFinal(merged.ctaFinal);
    // `merged` va siempre acorde a `revision` enviada desde el servidor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision]);

  const isDirty = useMemo(() => {
    if (JSON.stringify(hero) !== JSON.stringify(merged.hero)) return true;
    if (JSON.stringify(categories) !== JSON.stringify(merged.categories)) return true;
    if (JSON.stringify(featuredIds) !== JSON.stringify(merged.featuredIds)) return true;
    if (featuredVisible !== merged.featuredVisible) return true;
    if (JSON.stringify(serviceTech) !== JSON.stringify(merged.serviceTech)) return true;
    if (JSON.stringify(whyChoose) !== JSON.stringify(merged.whyChoose)) return true;
    if (JSON.stringify(testimonials) !== JSON.stringify(merged.testimonials)) return true;
    if (JSON.stringify(faq) !== JSON.stringify(merged.faq)) return true;
    if (JSON.stringify(ctaFinal) !== JSON.stringify(merged.ctaFinal)) return true;
    return false;
  }, [
    hero,
    categories,
    featuredIds,
    featuredVisible,
    serviceTech,
    whyChoose,
    testimonials,
    faq,
    ctaFinal,
    merged,
  ]);

  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const discard = useCallback(() => {
    setSaveErr(null);
    setHero(merged.hero);
    setCategories(merged.categories);
    setFeaturedIds(merged.featuredIds);
    setFeaturedVisible(merged.featuredVisible);
    setServiceTech(merged.serviceTech);
    setWhyChoose(merged.whyChoose);
    setTestimonials(merged.testimonials);
    setFaq(merged.faq);
    setCtaFinal(merged.ctaFinal);
  }, [merged]);

  const saveAll = useCallback(async () => {
    setSaveErr(null);
    setSaving(true);
    try {
      const run = async (key: HomeContentKey, payload: unknown) => {
        const r = await saveHomeSection(key, payload);
        if (!r.ok) throw new Error(r.error);
      };
      if (JSON.stringify(hero) !== JSON.stringify(merged.hero)) await run("home.hero", hero);
      if (JSON.stringify(categories) !== JSON.stringify(merged.categories)) {
        await run("home.categories", categories);
      }
      if (
        JSON.stringify(featuredIds) !== JSON.stringify(merged.featuredIds) ||
        featuredVisible !== merged.featuredVisible
      ) {
        await run("home.featured", { ids: featuredIds, visible: featuredVisible });
      }
      if (JSON.stringify(serviceTech) !== JSON.stringify(merged.serviceTech)) {
        await run("home.service_tech", serviceTech);
      }
      if (JSON.stringify(whyChoose) !== JSON.stringify(merged.whyChoose)) {
        await run("home.why_choose", whyChoose);
      }
      if (JSON.stringify(testimonials) !== JSON.stringify(merged.testimonials)) {
        await run("home.testimonials", testimonials);
      }
      if (JSON.stringify(faq) !== JSON.stringify(merged.faq)) await run("home.faq", faq);
      if (JSON.stringify(ctaFinal) !== JSON.stringify(merged.ctaFinal)) {
        await run("home.cta_final", ctaFinal);
      }
      await refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo guardar";
      setSaveErr(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  }, [
    hero,
    categories,
    featuredIds,
    featuredVisible,
    serviceTech,
    whyChoose,
    testimonials,
    faq,
    ctaFinal,
    merged,
    refresh,
  ]);

  const saveBarSnapshot = useMemo(() => {
    if (!isDirty && !saving && !saveErr) return null;
    return {
      isDirty,
      isSaving: saving,
      error: saveErr,
      onSave: saveAll,
      onDiscard: discard,
    };
  }, [isDirty, saving, saveErr, saveAll, discard]);

  useBackofficeSaveBarReporter(saveBarSnapshot);

  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-violet-500/20 bg-violet-950/20 px-4 py-3 text-sm text-slate-300">
        Los cambios en esta página quedan en borrador hasta que pulses{" "}
        <strong className="text-white">Guardar cambios</strong> en la barra inferior.
      </p>
      {homeKeys.map((key) => {
        const meta = SITE_HOME_SECTION_META[key];
        const hasCustom = Boolean(hasRow[key]);

        if (key === "home.hero") {
          return (
            <SectionCard
              key={key}
              anchorId={meta.anchorId}
              title={meta.title}
              description={meta.description}
              hasCustomInDb={hasCustom}
              visibleOnSite={hero.visible}
            >
              <ModuleVisibilityToggle checked={hero.visible} onChange={(v) => setHero({ ...hero, visible: v })} />
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="sm:col-span-2 block">
                  <span className={labelClass}>Título (parte normal)</span>
                  <input className={inputClass} value={hero.titleBefore} onChange={(e) => setHero({ ...hero, titleBefore: e.target.value })} />
                </label>
                <label className="sm:col-span-2 block">
                  <span className={labelClass}>Palabra o frase destacada (mismo renglón, más visible)</span>
                  <input className={inputClass} value={hero.titleHighlight} onChange={(e) => setHero({ ...hero, titleHighlight: e.target.value })} />
                </label>
                <label className="sm:col-span-2 block">
                  <span className={labelClass}>Texto debajo del título</span>
                  <textarea className={`${inputClass} min-h-[100px] resize-y`} value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
                </label>
                <p className="sm:col-span-2 text-sm text-slate-500">Números o datos destacados (hasta 6 filas)</p>
                {hero.stats.map((s, i) => (
                  <div key={i} className="flex flex-wrap gap-2 rounded-xl border border-white/[0.06] p-3 sm:col-span-1 sm:flex-1">
                    <label className="min-w-[5rem] flex-1">
                      <span className={labelClass}>Número o dato</span>
                      <input
                        className={inputClass}
                        value={s.value}
                        onChange={(e) => {
                          const stats = [...hero.stats];
                          stats[i] = { ...stats[i], value: e.target.value };
                          setHero({ ...hero, stats });
                        }}
                      />
                    </label>
                    <label className="min-w-[8rem] flex-[2]">
                      <span className={labelClass}>Etiqueta</span>
                      <input
                        className={inputClass}
                        value={s.label}
                        onChange={(e) => {
                          const stats = [...hero.stats];
                          stats[i] = { ...stats[i], label: e.target.value };
                          setHero({ ...hero, stats });
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      className="self-end text-xs text-red-300 hover:underline"
                      onClick={() => setHero({ ...hero, stats: hero.stats.filter((_, j) => j !== i) })}
                    >
                      Quitar
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={btnGhost}
                  disabled={hero.stats.length >= 6}
                  onClick={() => setHero({ ...hero, stats: [...hero.stats, { value: "", label: "" }] })}
                >
                  + Agregar dato destacado
                </button>
                <label className="block sm:col-span-1">
                  <span className={labelClass}>Botón principal — texto</span>
                  <input className={inputClass} value={hero.primaryCta.label} onChange={(e) => setHero({ ...hero, primaryCta: { ...hero.primaryCta, label: e.target.value } })} />
                </label>
                <label className="block sm:col-span-1">
                  <span className={labelClass}>Botón principal — enlace (ej. /tienda)</span>
                  <input className={inputClass} value={hero.primaryCta.href} onChange={(e) => setHero({ ...hero, primaryCta: { ...hero.primaryCta, href: e.target.value } })} />
                </label>
                <label className="block sm:col-span-1">
                  <span className={labelClass}>Botón secundario — texto</span>
                  <input className={inputClass} value={hero.secondaryCta.label} onChange={(e) => setHero({ ...hero, secondaryCta: { ...hero.secondaryCta, label: e.target.value } })} />
                </label>
                <label className="block sm:col-span-1">
                  <span className={labelClass}>Botón secundario — enlace</span>
                  <input className={inputClass} value={hero.secondaryCta.href} onChange={(e) => setHero({ ...hero, secondaryCta: { ...hero.secondaryCta, href: e.target.value } })} />
                </label>
                <label className="block sm:col-span-2">
                  <span className={labelClass}>Imagen — ruta en el sitio o URL completa</span>
                  <input
                    className={inputClass}
                    value={hero.imageSrc}
                    onChange={(e) => setHero({ ...hero, imageSrc: e.target.value })}
                    placeholder="/home-hero.png"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className={labelClass}>Descripción de la imagen (accesibilidad)</span>
                  <input className={inputClass} value={hero.imageAlt} onChange={(e) => setHero({ ...hero, imageAlt: e.target.value })} />
                </label>
              </div>
            </SectionCard>
          );
        }

        if (key === "home.categories") {
          return (
            <SectionCard
              key={key}
              anchorId={meta.anchorId}
              title={meta.title}
              description={meta.description}
              hasCustomInDb={hasCustom}
              visibleOnSite={categories.visible}
            >
              <ModuleVisibilityToggle
                checked={categories.visible}
                onChange={(v) => setCategories({ ...categories, visible: v })}
              />
              <label className="block">
                <span className={labelClass}>Título de la sección</span>
                <input className={inputClass} value={categories.sectionTitle} onChange={(e) => setCategories({ ...categories, sectionTitle: e.target.value })} />
              </label>
              <label className="mt-4 block">
                <span className={labelClass}>Subtítulo</span>
                <textarea className={`${inputClass} mt-1 min-h-[72px] resize-y`} value={categories.sectionSubtitle} onChange={(e) => setCategories({ ...categories, sectionSubtitle: e.target.value })} />
              </label>
              <p className="mt-6 text-sm font-medium text-slate-300">Tarjetas</p>
              <p className="mt-2 rounded-lg border border-violet-500/25 bg-violet-950/20 px-3 py-2.5 text-xs leading-relaxed text-slate-400">
                <span className="font-semibold text-slate-300">Fotos de cada tarjeta: </span>
                {HOME_CATEGORY_TILE_IMAGE_GUIDE_ES}
              </p>
              <div className="mt-3 space-y-4">
                {categories.tiles.map((tile, i) => (
                  <div key={i} className="rounded-xl border border-white/[0.08] bg-black/20 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-slate-500">Tipo de tarjeta</span>
                      <select
                        className={inputClass + " max-w-xs"}
                        value={tile.kind}
                        onChange={(e) => {
                          const k = e.target.value as "product" | "service";
                          const next = [...categories.tiles];
                          next[i] = k === "product" ? newProductTile() : newServiceTile();
                          setCategories({ ...categories, tiles: next });
                        }}
                      >
                        <option value="product">Producto (con foto y categoría)</option>
                        <option value="service">Servicio (con foto y enlace)</option>
                      </select>
                      <button type="button" className="ml-auto text-xs text-red-300 hover:underline" onClick={() => setCategories({ ...categories, tiles: categories.tiles.filter((_, j) => j !== i) })}>
                        Quitar tarjeta
                      </button>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="block sm:col-span-1">
                        <span className={labelClass}>Título</span>
                        <input className={inputClass} value={tile.title} onChange={(e) => {
                          const t = [...categories.tiles];
                          (t[i] as { title: string }).title = e.target.value;
                          setCategories({ ...categories, tiles: t });
                        }} />
                      </label>
                      <label className="block sm:col-span-1">
                        <span className={labelClass}>Enlace (página a la que lleva)</span>
                        <input className={inputClass} value={tile.href} onChange={(e) => {
                          const t = [...categories.tiles];
                          (t[i] as { href: string }).href = e.target.value;
                          setCategories({ ...categories, tiles: t });
                        }} />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className={labelClass}>Descripción corta</span>
                        <textarea className={`${inputClass} min-h-[64px] resize-y`} value={tile.description} onChange={(e) => {
                          const t = [...categories.tiles];
                          (t[i] as { description: string }).description = e.target.value;
                          setCategories({ ...categories, tiles: t });
                        }} />
                      </label>
                      {tile.kind === "product" ? (
                        <label className="block">
                          <span className={labelClass}>Categoría en la tienda</span>
                          <select
                            className={inputClass}
                            value={tile.category}
                            onChange={(e) => {
                              const t = [...categories.tiles] as HomeCategoryTile[];
                              const cur = t[i];
                              if (cur.kind === "product") {
                                t[i] = { ...cur, category: e.target.value as (typeof cur)["category"] };
                                setCategories({ ...categories, tiles: t });
                              }
                            }}
                          >
                            {categoryOptions.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                      {tile.kind === "product" || tile.kind === "service" ? (
                        <>
                          <label className="block sm:col-span-1">
                            <span className={labelClass}>URL de la imagen</span>
                            <input
                              className={inputClass}
                              placeholder={`https://… (${HOME_CATEGORY_TILE_RECOMMENDED_PX.width}×${HOME_CATEGORY_TILE_RECOMMENDED_PX.height}px, ${HOME_CATEGORY_TILE_ASPECT_LABEL})`}
                              value={tile.kind === "product" ? tile.image : tile.image ?? ""}
                              onChange={(e) => {
                                const t = [...categories.tiles] as HomeCategoryTile[];
                                const cur = t[i];
                                if (cur.kind === "product") t[i] = { ...cur, image: e.target.value };
                                else if (cur.kind === "service") t[i] = { ...cur, image: e.target.value };
                                setCategories({ ...categories, tiles: t });
                              }}
                            />
                          </label>
                          <HomeCategoryTileImageUpload
                            labelClass={labelClass}
                            inputClass={inputClass}
                            onUploaded={(url) => {
                              const t = [...categories.tiles] as HomeCategoryTile[];
                              const cur = t[i];
                              if (cur.kind === "product") t[i] = { ...cur, image: url };
                              else if (cur.kind === "service") t[i] = { ...cur, image: url };
                              setCategories({ ...categories, tiles: t });
                            }}
                          />
                          <label className="block sm:col-span-2">
                            <span className={labelClass}>Texto alternativo de la imagen</span>
                            <input
                              className={inputClass}
                              value={tile.kind === "product" ? tile.imageAlt : tile.imageAlt ?? ""}
                              onChange={(e) => {
                                const t = [...categories.tiles] as HomeCategoryTile[];
                                const cur = t[i];
                                if (cur.kind === "product") t[i] = { ...cur, imageAlt: e.target.value };
                                else if (cur.kind === "service") t[i] = { ...cur, imageAlt: e.target.value };
                                setCategories({ ...categories, tiles: t });
                              }}
                            />
                          </label>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className={btnGhost} onClick={() => setCategories({ ...categories, tiles: [...categories.tiles, newProductTile()] })}>
                  + Tarjeta de producto
                </button>
                <button type="button" className={btnGhost} onClick={() => setCategories({ ...categories, tiles: [...categories.tiles, newServiceTile()] })}>
                  + Tarjeta de servicio
                </button>
              </div>
            </SectionCard>
          );
        }

        if (key === "home.featured") {
          const addId = (id: string) => {
            if (!id || featuredIds.includes(id)) return;
            setFeaturedIds([...featuredIds, id]);
          };
          const removeId = (id: string) => setFeaturedIds(featuredIds.filter((x) => x !== id));
          const move = (from: number, to: number) => {
            if (to < 0 || to >= featuredIds.length) return;
            const next = [...featuredIds];
            const [x] = next.splice(from, 1);
            next.splice(to, 0, x);
            setFeaturedIds(next);
          };

          return (
            <SectionCard
              key={key}
              anchorId={meta.anchorId}
              title={meta.title}
              description={meta.description}
              hasCustomInDb={hasCustom}
              visibleOnSite={featuredVisible}
            >
              <ModuleVisibilityToggle checked={featuredVisible} onChange={setFeaturedVisible} />
              <p className="text-sm text-slate-400">
                Solo aparecen productos que estén <strong className="text-slate-300">publicados</strong> en Productos. El orden de la lista de abajo es el orden en la home.
              </p>
              <label className="mt-4 block max-w-md">
                <span className={labelClass}>Agregar producto</span>
                <select className={inputClass} defaultValue="" onChange={(e) => { addId(e.target.value); e.target.value = ""; }}>
                  <option value="">Elegí un producto…</option>
                  {publishedProducts.map((p) => (
                    <option key={p.id} value={p.id} disabled={featuredIds.includes(p.id)}>
                      {p.name} ({p.id})
                    </option>
                  ))}
                </select>
              </label>
              <ul className="mt-4 space-y-2">
                {featuredIds.length === 0 ? (
                  <li className="rounded-lg border border-dashed border-white/15 px-4 py-6 text-center text-sm text-slate-500">Todavía no elegiste productos. La home no mostrará destacados hasta que agregues al menos uno.</li>
                ) : (
                  featuredIds.map((id, idx) => {
                    const name = publishedProducts.find((p) => p.id === id)?.name ?? id;
                    return (
                      <li key={id} className="flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.08] bg-black/25 px-3 py-2">
                        <span className="min-w-0 flex-1 text-sm text-white">
                          <span className="text-slate-500">{idx + 1}.</span> {name}
                        </span>
                        <span className="text-xs text-slate-500">{id}</span>
                        <button type="button" className="text-xs text-slate-400 hover:text-white" onClick={() => move(idx, idx - 1)} disabled={idx === 0}>
                          Subir
                        </button>
                        <button type="button" className="text-xs text-slate-400 hover:text-white" onClick={() => move(idx, idx + 1)} disabled={idx === featuredIds.length - 1}>
                          Bajar
                        </button>
                        <button type="button" className="text-xs text-red-300 hover:underline" onClick={() => removeId(id)}>
                          Sacar
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </SectionCard>
          );
        }

        if (key === "home.service_tech") {
          return (
            <SectionCard
              key={key}
              anchorId={meta.anchorId}
              title={meta.title}
              description={meta.description}
              hasCustomInDb={hasCustom}
              visibleOnSite={serviceTech.visible}
            >
              <ModuleVisibilityToggle
                checked={serviceTech.visible}
                onChange={(v) => setServiceTech({ ...serviceTech, visible: v })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2 block">
                  <span className={labelClass}>Título de la sección</span>
                  <input className={inputClass} value={serviceTech.title} onChange={(e) => setServiceTech({ ...serviceTech, title: e.target.value })} />
                </label>
                <label className="sm:col-span-2 block">
                  <span className={labelClass}>Párrafo introductorio</span>
                  <textarea className={`${inputClass} min-h-[88px] resize-y`} value={serviceTech.intro} onChange={(e) => setServiceTech({ ...serviceTech, intro: e.target.value })} />
                </label>
                <label className="block">
                  <span className={labelClass}>URL de la imagen</span>
                  <input className={inputClass} value={serviceTech.imageUrl} onChange={(e) => setServiceTech({ ...serviceTech, imageUrl: e.target.value })} />
                </label>
                <label className="block">
                  <span className={labelClass}>Descripción de la imagen</span>
                  <input className={inputClass} value={serviceTech.imageAlt} onChange={(e) => setServiceTech({ ...serviceTech, imageAlt: e.target.value })} />
                </label>
                <label className="block">
                  <span className={labelClass}>Texto del botón</span>
                  <input className={inputClass} value={serviceTech.ctaLabel} onChange={(e) => setServiceTech({ ...serviceTech, ctaLabel: e.target.value })} />
                </label>
                <label className="block">
                  <span className={labelClass}>Enlace del botón</span>
                  <input className={inputClass} value={serviceTech.ctaHref} onChange={(e) => setServiceTech({ ...serviceTech, ctaHref: e.target.value })} />
                </label>
              </div>
              <p className="mt-6 text-sm font-medium text-slate-300">Beneficios (lista con ícono)</p>
              <div className="mt-3 space-y-3">
                {serviceTech.features.map((f, i) => (
                  <div key={i} className="rounded-xl border border-white/[0.08] p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block sm:col-span-2">
                        <span className={labelClass}>Ícono</span>
                        <select
                          className={inputClass}
                          value={f.icon}
                          onChange={(e) => {
                            const feats = [...serviceTech.features];
                            feats[i] = { ...feats[i], icon: e.target.value as (typeof f)["icon"] };
                            setServiceTech({ ...serviceTech, features: feats });
                          }}
                        >
                          {SERVICE_ICONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block sm:col-span-2">
                        <span className={labelClass}>Título del beneficio</span>
                        <input className={inputClass} value={f.title} onChange={(e) => {
                          const feats = [...serviceTech.features];
                          feats[i] = { ...feats[i], title: e.target.value };
                          setServiceTech({ ...serviceTech, features: feats });
                        }} />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className={labelClass}>Texto</span>
                        <textarea className={`${inputClass} min-h-[64px] resize-y`} value={f.body} onChange={(e) => {
                          const feats = [...serviceTech.features];
                          feats[i] = { ...feats[i], body: e.target.value };
                          setServiceTech({ ...serviceTech, features: feats });
                        }} />
                      </label>
                    </div>
                    <button type="button" className="mt-2 text-xs text-red-300 hover:underline" onClick={() => setServiceTech({ ...serviceTech, features: serviceTech.features.filter((_, j) => j !== i) })}>
                      Quitar beneficio
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className={`${btnGhost} mt-3`} onClick={() => setServiceTech({ ...serviceTech, features: [...serviceTech.features, { icon: "shield", title: "", body: "" }] })}>
                + Agregar beneficio
              </button>
            </SectionCard>
          );
        }

        if (key === "home.why_choose") {
          return (
            <SectionCard
              key={key}
              anchorId={meta.anchorId}
              title={meta.title}
              description={meta.description}
              hasCustomInDb={hasCustom}
              visibleOnSite={whyChoose.visible}
            >
              <ModuleVisibilityToggle
                checked={whyChoose.visible}
                onChange={(v) => setWhyChoose({ ...whyChoose, visible: v })}
              />
              <label className="block">
                <span className={labelClass}>Título de la sección</span>
                <input className={inputClass} value={whyChoose.sectionTitle} onChange={(e) => setWhyChoose({ ...whyChoose, sectionTitle: e.target.value })} />
              </label>
              <label className="mt-4 block">
                <span className={labelClass}>Subtítulo</span>
                <textarea className={`${inputClass} min-h-[72px] resize-y`} value={whyChoose.sectionSubtitle} onChange={(e) => setWhyChoose({ ...whyChoose, sectionSubtitle: e.target.value })} />
              </label>
              <div className="mt-6 space-y-4">
                {whyChoose.items.map((item, i) => (
                  <div key={i} className="rounded-xl border border-white/[0.08] p-4">
                    <label className="block">
                      <span className={labelClass}>Título</span>
                      <input className={inputClass} value={item.title} onChange={(e) => {
                        const items = [...whyChoose.items];
                        items[i] = { ...items[i], title: e.target.value };
                        setWhyChoose({ ...whyChoose, items });
                      }} />
                    </label>
                    <label className="mt-3 block">
                      <span className={labelClass}>Texto</span>
                      <textarea className={`${inputClass} min-h-[72px] resize-y`} value={item.body} onChange={(e) => {
                        const items = [...whyChoose.items];
                        items[i] = { ...items[i], body: e.target.value };
                        setWhyChoose({ ...whyChoose, items });
                      }} />
                    </label>
                    <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                      <input type="checkbox" checked={Boolean(item.highlight)} onChange={(e) => {
                        const items = [...whyChoose.items];
                        items[i] = { ...items[i], highlight: e.target.checked };
                        setWhyChoose({ ...whyChoose, items });
                      }} />
                      Resaltar esta tarjeta en el diseño
                    </label>
                    <button type="button" className="mt-2 text-xs text-red-300 hover:underline" onClick={() => setWhyChoose({ ...whyChoose, items: whyChoose.items.filter((_, j) => j !== i) })}>
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className={`${btnGhost} mt-3`} onClick={() => setWhyChoose({ ...whyChoose, items: [...whyChoose.items, { title: "", body: "" }] })}>
                + Agregar motivo
              </button>
            </SectionCard>
          );
        }

        if (key === "home.testimonials") {
          return (
            <SectionCard
              key={key}
              anchorId={meta.anchorId}
              title={meta.title}
              description={meta.description}
              hasCustomInDb={hasCustom}
              visibleOnSite={testimonials.visible}
            >
              <ModuleVisibilityToggle
                checked={testimonials.visible}
                onChange={(v) => setTestimonials({ ...testimonials, visible: v })}
              />
              <label className="block">
                <span className={labelClass}>Título de la sección</span>
                <input className={inputClass} value={testimonials.sectionTitle} onChange={(e) => setTestimonials({ ...testimonials, sectionTitle: e.target.value })} />
              </label>
              <label className="mt-4 block">
                <span className={labelClass}>Subtítulo</span>
                <textarea className={`${inputClass} min-h-[72px] resize-y`} value={testimonials.sectionSubtitle} onChange={(e) => setTestimonials({ ...testimonials, sectionSubtitle: e.target.value })} />
              </label>
              <div className="mt-6 space-y-4">
                {testimonials.items.map((item, i) => (
                  <div key={i} className="rounded-xl border border-white/[0.08] p-4">
                    <label className="block">
                      <span className={labelClass}>Opinión</span>
                      <textarea className={`${inputClass} min-h-[80px] resize-y`} value={item.quote} onChange={(e) => {
                        const items = [...testimonials.items];
                        items[i] = { ...items[i], quote: e.target.value };
                        setTestimonials({ ...testimonials, items });
                      }} />
                    </label>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className={labelClass}>Nombre</span>
                        <input className={inputClass} value={item.name} onChange={(e) => {
                          const items = [...testimonials.items];
                          items[i] = { ...items[i], name: e.target.value };
                          setTestimonials({ ...testimonials, items });
                        }} />
                      </label>
                      <label className="block">
                        <span className={labelClass}>Lugar o dato (ej. ciudad)</span>
                        <input className={inputClass} value={item.role} onChange={(e) => {
                          const items = [...testimonials.items];
                          items[i] = { ...items[i], role: e.target.value };
                          setTestimonials({ ...testimonials, items });
                        }} />
                      </label>
                    </div>
                    <label className="mt-3 block">
                      <span className={labelClass}>URL de la foto de perfil</span>
                      <input className={inputClass} value={item.avatar} onChange={(e) => {
                        const items = [...testimonials.items];
                        items[i] = { ...items[i], avatar: e.target.value };
                        setTestimonials({ ...testimonials, items });
                      }} />
                    </label>
                    <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                      <input type="checkbox" checked={Boolean(item.verified)} onChange={(e) => {
                        const items = [...testimonials.items];
                        items[i] = { ...items[i], verified: e.target.checked };
                        setTestimonials({ ...testimonials, items });
                      }} />
                      Mostrar insignia de “verificado”
                    </label>
                    <button type="button" className="mt-2 text-xs text-red-300 hover:underline" onClick={() => setTestimonials({ ...testimonials, items: testimonials.items.filter((_, j) => j !== i) })}>
                      Quitar testimonio
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className={`${btnGhost} mt-3`} onClick={() => setTestimonials({ ...testimonials, items: [...testimonials.items, { quote: "", name: "", role: "", avatar: "", verified: true }] })}>
                + Agregar testimonio
              </button>
            </SectionCard>
          );
        }

        if (key === "home.faq") {
          return (
            <SectionCard
              key={key}
              anchorId={meta.anchorId}
              title={meta.title}
              description={meta.description}
              hasCustomInDb={hasCustom}
              visibleOnSite={faq.visible}
            >
              <ModuleVisibilityToggle checked={faq.visible} onChange={(v) => setFaq({ ...faq, visible: v })} />
              <label className="block">
                <span className={labelClass}>Título de la sección</span>
                <input className={inputClass} value={faq.sectionTitle} onChange={(e) => setFaq({ ...faq, sectionTitle: e.target.value })} />
              </label>
              <label className="mt-4 block">
                <span className={labelClass}>Subtítulo</span>
                <textarea className={`${inputClass} min-h-[72px] resize-y`} value={faq.sectionSubtitle} onChange={(e) => setFaq({ ...faq, sectionSubtitle: e.target.value })} />
              </label>
              <div className="mt-6 space-y-4">
                {faq.items.map((item, i) => (
                  <div key={i} className="rounded-xl border border-white/[0.08] p-4">
                    <label className="block">
                      <span className={labelClass}>Pregunta</span>
                      <input className={inputClass} value={item.q} onChange={(e) => {
                        const items = [...faq.items];
                        items[i] = { ...items[i], q: e.target.value };
                        setFaq({ ...faq, items });
                      }} />
                    </label>
                    <label className="mt-3 block">
                      <span className={labelClass}>Respuesta</span>
                      <textarea className={`${inputClass} min-h-[88px] resize-y`} value={item.a} onChange={(e) => {
                        const items = [...faq.items];
                        items[i] = { ...items[i], a: e.target.value };
                        setFaq({ ...faq, items });
                      }} />
                    </label>
                    <button type="button" className="mt-2 text-xs text-red-300 hover:underline" onClick={() => setFaq({ ...faq, items: faq.items.filter((_, j) => j !== i) })}>
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className={`${btnGhost} mt-3`} onClick={() => setFaq({ ...faq, items: [...faq.items, { q: "", a: "" }] })}>
                + Agregar pregunta
              </button>
            </SectionCard>
          );
        }

        if (key === "home.cta_final") {
          return (
            <SectionCard
              key={key}
              anchorId={meta.anchorId}
              title={meta.title}
              description={meta.description}
              hasCustomInDb={hasCustom}
              visibleOnSite={ctaFinal.visible}
            >
              <ModuleVisibilityToggle
                checked={ctaFinal.visible}
                onChange={(v) => setCtaFinal({ ...ctaFinal, visible: v })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2 block">
                  <span className={labelClass}>Título</span>
                  <input className={inputClass} value={ctaFinal.title} onChange={(e) => setCtaFinal({ ...ctaFinal, title: e.target.value })} />
                </label>
                <label className="sm:col-span-2 block">
                  <span className={labelClass}>Subtítulo</span>
                  <textarea className={`${inputClass} min-h-[80px] resize-y`} value={ctaFinal.subtitle} onChange={(e) => setCtaFinal({ ...ctaFinal, subtitle: e.target.value })} />
                </label>
                <label className="block">
                  <span className={labelClass}>Botón principal — texto</span>
                  <input className={inputClass} value={ctaFinal.primaryCta.label} onChange={(e) => setCtaFinal({ ...ctaFinal, primaryCta: { ...ctaFinal.primaryCta, label: e.target.value } })} />
                </label>
                <label className="block">
                  <span className={labelClass}>Botón principal — enlace</span>
                  <input className={inputClass} value={ctaFinal.primaryCta.href} onChange={(e) => setCtaFinal({ ...ctaFinal, primaryCta: { ...ctaFinal.primaryCta, href: e.target.value } })} />
                </label>
                <label className="block">
                  <span className={labelClass}>Botón secundario — texto</span>
                  <input className={inputClass} value={ctaFinal.secondaryCta.label} onChange={(e) => setCtaFinal({ ...ctaFinal, secondaryCta: { ...ctaFinal.secondaryCta, label: e.target.value } })} />
                </label>
                <label className="block">
                  <span className={labelClass}>Botón secundario — enlace</span>
                  <input className={inputClass} value={ctaFinal.secondaryCta.href} onChange={(e) => setCtaFinal({ ...ctaFinal, secondaryCta: { ...ctaFinal.secondaryCta, href: e.target.value } })} />
                </label>
              </div>
            </SectionCard>
          );
        }

        return null;
      })}

      <p className="pt-2 text-center text-xs text-slate-600">
        Los cambios se reflejan en la página de inicio pública al guardar. Si algo no se ve, probá recargar el navegador.
      </p>
    </div>
  );
}
