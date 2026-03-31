"use client";

import { useMemo, useState, useTransition } from "react";

import type { ProductDetailBlock, ProductSpec } from "@/lib/product-detail-data";

import { uploadGalleryImageAction } from "./upload-actions";

const SPEC_ICONS: { value: ProductSpec["icon"]; label: string }[] = [
  { value: "chip", label: "Procesador / chip" },
  { value: "camera", label: "Cámara" },
  { value: "display", label: "Pantalla" },
  { value: "battery", label: "Batería" },
  { value: "memory", label: "Memoria" },
  { value: "water", label: "Resistencia / agua" },
];

function emptySpec(): ProductSpec {
  return {
    key: `spec-${crypto.randomUUID().slice(0, 8)}`,
    title: "TÍTULO",
    value: "—",
    desc: "",
    icon: "chip",
  };
}

function parseDetail(raw: unknown): ProductDetailBlock {
  if (!raw || typeof raw !== "object") {
    return {
      images: [],
      longDescription: "",
      descriptionItems: [""],
      warranty: "",
      specs: [],
      relatedIds: [],
      accessoryIds: [],
      reviews: [],
    };
  }
  const r = raw as Record<string, unknown>;
  const longDescription = String(r.longDescription ?? "");
  let descriptionItems: string[];
  if (Array.isArray(r.descriptionItems) && r.descriptionItems.length > 0) {
    descriptionItems = (r.descriptionItems as unknown[])
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.replace(/\r\n/g, "\n").trimEnd());
  } else if (longDescription.trim()) {
    descriptionItems = [longDescription.trim()];
  } else {
    descriptionItems = [""];
  }
  return {
    images: Array.isArray(r.images) ? (r.images as string[]).filter(Boolean) : [],
    longDescription,
    descriptionItems,
    warranty: typeof r.warranty === "string" ? r.warranty : "",
    specs: Array.isArray(r.specs) ? (r.specs as ProductSpec[]) : [],
    relatedIds: Array.isArray(r.relatedIds) ? (r.relatedIds as string[]) : [],
    accessoryIds: Array.isArray(r.accessoryIds) ? (r.accessoryIds as string[]) : [],
    reviews: Array.isArray(r.reviews) ? (r.reviews as ProductDetailBlock["reviews"]) : [],
  };
}

function ProductIdPicker({
  title,
  description,
  selectedIds,
  onChange,
  options,
  excludeId,
}: {
  title: string;
  description: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  options: { id: string; name: string }[];
  excludeId?: string;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const base = options.filter((o) => !excludeId || o.id !== excludeId);
    const qq = q.trim().toLowerCase();
    if (!qq) return base;
    return base.filter(
      (o) =>
        o.name.toLowerCase().includes(qq) ||
        o.id.toLowerCase().includes(qq),
    );
  }, [options, q, excludeId]);

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
      <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nombre o ID…"
        className="mt-4 w-full rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
      />
      <div className="mt-3 max-h-56 overflow-y-auto rounded-xl border border-white/[0.08] bg-black/25">
        {filtered.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-slate-500">No hay coincidencias.</p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {filtered.map((o) => (
              <li key={o.id}>
                <label className="flex cursor-pointer items-start gap-3 px-3 py-2.5 hover:bg-white/[0.04]">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(o.id)}
                    onChange={() => toggle(o.id)}
                    className="mt-1 h-4 w-4 rounded border-white/20"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-slate-200">{o.name}</span>
                    <span className="font-mono text-[11px] text-slate-500">{o.id}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
      {selectedIds.length > 0 ? (
        <p className="mt-3 text-xs text-slate-500">
          Seleccionados: {selectedIds.length} — se guardan como lista en la ficha.
        </p>
      ) : null}
    </section>
  );
}

export function ProductDetailEditor({
  productId,
  initialDetail,
  catalogProductOptions,
  currentProductId,
}: {
  productId: string;
  initialDetail: unknown;
  catalogProductOptions: { id: string; name: string }[];
  currentProductId?: string;
}) {
  const base = useMemo(() => parseDetail(initialDetail), [initialDetail]);

  const [descriptionItems, setDescriptionItems] = useState<string[]>(base.descriptionItems ?? [""]);
  const [warranty, setWarranty] = useState(base.warranty ?? "");
  const [gallery, setGallery] = useState<string[]>(base.images);
  const [specs, setSpecs] = useState<ProductSpec[]>(base.specs.length ? base.specs : []);
  const [relatedIds, setRelatedIds] = useState<string[]>(base.relatedIds);
  const [accessoryIds, setAccessoryIds] = useState<string[]>(base.accessoryIds);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const detailJson = useMemo(() => {
    const trimmed = descriptionItems.map((s) => s.trim()).filter(Boolean);
    const block: ProductDetailBlock = {
      images: gallery,
      longDescription: trimmed.join("\n\n"),
      specs,
      relatedIds,
      accessoryIds,
      reviews: [],
    };
    if (trimmed.length > 0) block.descriptionItems = trimmed;
    const w = warranty.trim();
    if (w) block.warranty = w;
    return JSON.stringify(block);
  }, [gallery, descriptionItems, warranty, specs, relatedIds, accessoryIds]);

  function addGalleryFromFile(file: File) {
    setGalleryError(null);
    if (!productId.trim()) {
      setGalleryError("Definí el ID del producto antes de subir fotos a la galería.");
      return;
    }
    const fd = new FormData();
    fd.append("productId", productId.trim());
    fd.append("file", file);
    startTransition(async () => {
      const r = await uploadGalleryImageAction(null, fd);
      if (r.error) {
        setGalleryError(r.error);
        return;
      }
      const url = r.url;
      if (url) {
        setGallery((g) => [...g, url]);
      }
    });
  }

  return (
    <div className="space-y-6">
      <input type="hidden" name="detail" value={detailJson} readOnly />

      <section className="rounded-2xl border-2 border-emerald-500/25 bg-gradient-to-br from-emerald-950/40 to-black/20 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <h2 className="font-display text-lg font-semibold text-emerald-100">Garantía</h2>
        <p className="mt-1 text-sm text-emerald-200/70">
          Se muestra en la ficha pública en un recuadro destacado (verde). Dejalo vacío si no aplica.
        </p>
        <textarea
          value={warranty}
          onChange={(e) => setWarranty(e.target.value)}
          rows={3}
          className="mt-4 w-full resize-y rounded-xl border border-emerald-500/30 bg-black/40 px-3 py-2.5 text-sm leading-relaxed text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/40"
          placeholder="Ej. Oficial 12 meses · factura y caja sellada"
        />
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">Descripción</h2>
            <p className="mt-1 text-sm text-slate-500">
              Un ítem por fila: en la tienda se listan con viñetas, más ordenado que un solo bloque de texto.
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg bg-white/[0.08] px-3 py-2 text-xs font-medium text-white hover:bg-white/[0.12]"
            onClick={() => setDescriptionItems((rows) => [...rows, ""])}
          >
            + Agregar ítem
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {descriptionItems.map((line, i) => (
            <div key={i} className="flex gap-2">
              <span className="mt-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-xs font-bold text-violet-200">
                {i + 1}
              </span>
              <textarea
                value={line}
                onChange={(e) => {
                  const v = e.target.value;
                  setDescriptionItems((rows) => {
                    const next = [...rows];
                    next[i] = v;
                    return next;
                  });
                }}
                rows={2}
                className="min-h-[3.25rem] flex-1 resize-y rounded-xl border border-white/[0.1] bg-black/30 px-3 py-2.5 text-sm leading-relaxed text-white outline-none focus:ring-2 focus:ring-violet-500/40"
                placeholder="Ej. Incluye cable USB-C y documentación original."
              />
              <button
                type="button"
                className="mt-1 shrink-0 self-start rounded-lg border border-white/[0.1] px-2 py-2 text-xs text-slate-400 hover:border-red-500/40 hover:text-red-300"
                onClick={() =>
                  setDescriptionItems((rows) => {
                    if (rows.length <= 1) return [""];
                    return rows.filter((_, j) => j !== i);
                  })
                }
                aria-label="Quitar ítem"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-white">Galería de fotos</h2>
        <p className="mt-1 text-sm text-slate-500">
          Subí imágenes extra; se guardan en Supabase Storage.
        </p>
        {galleryError ? (
          <p className="mt-2 text-sm text-amber-200/95">{galleryError}</p>
        ) : null}
        <div className="mt-4 space-y-3">
          {gallery.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
              </div>
              <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-slate-400">{url}</p>
              <button
                type="button"
                className="rounded-lg border border-white/[0.1] px-2 py-1 text-xs text-slate-300 hover:bg-white/[0.06]"
                onClick={() => setGallery((g) => g.filter((_, j) => j !== i))}
              >
                Quitar
              </button>
            </div>
          ))}
          <label className="inline-flex cursor-pointer flex-wrap items-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-black/20 px-4 py-3 text-sm text-violet-200/95 hover:bg-white/[0.04]">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              disabled={pending || !productId.trim()}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) addGalleryFromFile(f);
              }}
            />
            {pending ? "Subiendo…" : "+ Agregar foto a la galería"}
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">Fichas técnicas</h2>
            <p className="mt-1 text-sm text-slate-500">Filas con icono, título, valor y detalle corto.</p>
          </div>
          <button
            type="button"
            className="rounded-lg bg-white/[0.08] px-3 py-2 text-xs font-medium text-white hover:bg-white/[0.12]"
            onClick={() => setSpecs((s) => [...s, emptySpec()])}
          >
            + Agregar fila
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {specs.map((sp, i) => (
            <div
              key={sp.key}
              className="grid gap-3 rounded-xl border border-white/[0.06] bg-black/25 p-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <label className="block sm:col-span-2 lg:col-span-1">
                <span className="mb-1 block text-[11px] text-slate-500">Icono</span>
                <select
                  value={sp.icon}
                  onChange={(e) => {
                    const icon = e.target.value as ProductSpec["icon"];
                    setSpecs((prev) => {
                      const n = [...prev];
                      n[i] = { ...n[i], icon };
                      return n;
                    });
                  }}
                  className="w-full rounded-lg border border-white/[0.1] bg-black/40 px-2 py-2 text-sm text-white"
                >
                  {SPEC_ICONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] text-slate-500">Título (ej. PANTALLA)</span>
                <input
                  value={sp.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setSpecs((prev) => {
                      const n = [...prev];
                      n[i] = {
                        ...n[i],
                        title,
                        key: n[i].key || `spec-${title}`,
                      };
                      return n;
                    });
                  }}
                  className="w-full rounded-lg border border-white/[0.1] bg-black/40 px-2 py-2 text-sm text-white"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] text-slate-500">Valor destacado</span>
                <input
                  value={sp.value}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSpecs((prev) => {
                      const n = [...prev];
                      n[i] = { ...n[i], value };
                      return n;
                    });
                  }}
                  className="w-full rounded-lg border border-white/[0.1] bg-black/40 px-2 py-2 text-sm text-white"
                />
              </label>
              <label className="block sm:col-span-2 lg:col-span-3">
                <span className="mb-1 block text-[11px] text-slate-500">Descripción</span>
                <input
                  value={sp.desc}
                  onChange={(e) => {
                    const desc = e.target.value;
                    setSpecs((prev) => {
                      const n = [...prev];
                      n[i] = { ...n[i], desc };
                      return n;
                    });
                  }}
                  className="w-full rounded-lg border border-white/[0.1] bg-black/40 px-2 py-2 text-sm text-white"
                />
              </label>
              <div className="sm:col-span-2 lg:col-span-3">
                <button
                  type="button"
                  className="text-xs text-red-300/90 hover:text-red-200"
                  onClick={() => setSpecs((prev) => prev.filter((_, j) => j !== i))}
                >
                  Quitar fila
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ProductIdPicker
        title="Productos relacionados"
        description="Marcá otros ítems del catálogo que quieras sugerir en la ficha."
        selectedIds={relatedIds}
        onChange={setRelatedIds}
        options={catalogProductOptions}
        excludeId={currentProductId}
      />

      <ProductIdPicker
        title="Accesorios sugeridos"
        description="Misma idea: elegí de la lista sin tener que acordarte del ID."
        selectedIds={accessoryIds}
        onChange={setAccessoryIds}
        options={catalogProductOptions}
        excludeId={currentProductId}
      />
    </div>
  );
}
