"use server";

import { revalidatePath } from "next/cache";

import { listVariantPricingModeLabelsAdmin } from "@/lib/backoffice/catalog-dictionaries-db";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { requireBackofficeSession } from "@/lib/backoffice/session";

function revalidate() {
  revalidatePath("/backoffice/listas/modos-precio");
  revalidatePath("/backoffice/productos");
  revalidatePath("/backoffice/productos/nuevo");
}

/** Formulario server (un solo argumento). */
export async function updatePricingModeLabel(formData: FormData): Promise<void> {
  await requireBackofficeSession();
  const mode = String(formData.get("mode") ?? "").trim() as "absolute" | "delta";
  const label = String(formData.get("label") ?? "").trim();
  const hint = String(formData.get("hint") ?? "").trim();

  if (!mode || !label) return;
  if (mode !== "absolute" && mode !== "delta") return;

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("variant_pricing_mode_labels")
    .update({
      label,
      hint: hint || null,
      updated_at: new Date().toISOString(),
    })
    .eq("mode", mode);
  if (error) throw new Error(error.message);
  revalidate();
}

export async function loadPricingModeLabelsAdmin() {
  await requireBackofficeSession();
  return listVariantPricingModeLabelsAdmin();
}
