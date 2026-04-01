"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { toggleProductPublished } from "./actions";

export function ProductPublishedToggle({
  productId,
  published: publishedProp,
}: {
  productId: string;
  published: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [checked, setChecked] = useState(publishedProp);

  useEffect(() => {
    setChecked(publishedProp);
  }, [publishedProp]);

  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.checked;
          const prev = checked;
          setChecked(next);
          startTransition(async () => {
            const r = await toggleProductPublished(productId, next);
            if (!r.ok) setChecked(prev);
            else router.refresh();
          });
        }}
        className="h-4 w-4 shrink-0 rounded border-white/25 bg-black/40 text-violet-600 focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50"
      />
      <span className="text-xs leading-snug text-slate-300">
        Visible en la web
        {pending ? <span className="ml-1 text-slate-500">…</span> : null}
      </span>
    </label>
  );
}
