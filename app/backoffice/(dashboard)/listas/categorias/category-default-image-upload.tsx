"use client";

import { useState } from "react";

import { uploadCategoryDefaultImageFormAction } from "./actions";

const btnClass =
  "inline-flex cursor-pointer items-center justify-center rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50";

export function CategoryDefaultImageUpload({
  categoryId,
  onUploaded,
}: {
  categoryId: string;
  onUploaded: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      <label className={btnClass}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          disabled={busy}
          onChange={async (e) => {
            const input = e.target;
            const file = input.files?.[0];
            input.value = "";
            if (!file) return;
            setErr(null);
            setBusy(true);
            try {
              const fd = new FormData();
              fd.set("categoryId", categoryId);
              fd.set("file", file);
              const r = await uploadCategoryDefaultImageFormAction(fd);
              if (r.ok) onUploaded(r.url);
              else setErr(r.error);
            } catch {
              setErr("No se pudo subir");
            } finally {
              setBusy(false);
            }
          }}
        />
        {busy ? "Subiendo…" : "Subir a Storage"}
      </label>
      {err ? <p className="text-xs text-red-300/95">{err}</p> : null}
    </div>
  );
}
