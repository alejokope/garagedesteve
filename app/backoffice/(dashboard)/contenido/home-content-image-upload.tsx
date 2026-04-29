"use client";

import { useRef, useState, useTransition } from "react";

import {
  uploadHomeHeroImageAction,
  uploadHomeServiceTechImageAction,
} from "./home-content-image-upload-actions";

const UPLOAD_HINT =
  "JPG, PNG, WebP o GIF, hasta 5 MB. La URL de arriba se reemplaza por la del archivo subido (mismo almacenamiento que productos y categorías).";

type Section = "hero" | "service_tech";

const actions: Record<
  Section,
  (formData: FormData) => Promise<{ ok?: boolean; url?: string; error?: string }>
> = {
  hero: uploadHomeHeroImageAction,
  service_tech: uploadHomeServiceTechImageAction,
};

export function HomeContentImageUpload({
  section,
  labelClass,
  inputClass,
  onUploaded,
}: {
  section: Section;
  labelClass: string;
  inputClass: string;
  onUploaded: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  return (
    <div className="sm:col-span-2">
      <span className={labelClass}>O subí un archivo</span>
      <p className="mb-2 text-xs text-slate-500">{UPLOAD_HINT}</p>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={pending}
        className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-white/[0.08] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/[0.12] disabled:opacity-40`}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setFeedback(null);
          const fd = new FormData();
          fd.set("file", f);
          startTransition(async () => {
            const r = await actions[section](fd);
            if (r.ok && r.url) {
              onUploaded(r.url);
              setFeedback({ type: "ok", text: "Listo: URL actualizada. Recordá guardar cambios abajo." });
            } else {
              setFeedback({ type: "err", text: r.error ?? "No se pudo subir" });
            }
            if (fileRef.current) fileRef.current.value = "";
          });
        }}
      />
      {feedback ? (
        <p
          className={
            feedback.type === "ok" ? "mt-2 text-xs text-emerald-300/95" : "mt-2 text-xs text-red-300"
          }
        >
          {feedback.text}
        </p>
      ) : null}
    </div>
  );
}
