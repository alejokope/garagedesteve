import { listVariantPricingModeLabelsAdmin } from "@/lib/backoffice/catalog-dictionaries-db";

import { ModosPrecioEditor } from "./modos-precio-editor";

export default async function ModosPrecioPage() {
  const rows = await listVariantPricingModeLabelsAdmin();
  const revision = rows.map((r) => `${r.mode}:${r.label}:${r.hint ?? ""}`).join("|");

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        Solo hay dos modos técnicos (<code className="rounded bg-white/[0.06] px-1 font-mono text-xs">absolute</code>{" "}
        y <code className="rounded bg-white/[0.06] px-1 font-mono text-xs">delta</code>). Podés cambiar los
        textos que ve el equipo al cargar productos; no se pueden eliminar filas.
      </p>
      <ModosPrecioEditor rows={rows} revision={revision} />
    </div>
  );
}
