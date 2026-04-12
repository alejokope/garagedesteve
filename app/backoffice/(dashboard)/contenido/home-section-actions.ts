"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { upsertContentEntryAdmin } from "@/lib/backoffice/content-db";
import {
  homeCategoriesPayloadSchema,
  homeCtaFinalPayloadSchema,
  homeFaqPayloadSchema,
  homeFeaturedPayloadSchema,
  homeHeroPayloadSchema,
  homeServiceTechPayloadSchema,
  homeTestimonialsPayloadSchema,
  homeWhyPayloadSchema,
} from "@/lib/backoffice/home-section-schemas";
import { requireBackofficeSession } from "@/lib/backoffice/session";
import { SITE_HOME_SECTION_META } from "@/lib/backoffice/site-content-sections-meta";
import type { HomeContentAdminKey, HomeContentKey } from "@/lib/home-public-content";

export type SaveHomeSectionResult = { ok: true } | { ok: false; error: string };

function formatZodError(e: z.ZodError): string {
  return e.issues.map((i) => `${i.path.map(String).join(".") || "dato"}: ${i.message}`).join(" · ");
}

function withHomeVisible<T extends { visible?: boolean }>(data: T): T & { visible: boolean } {
  return { ...data, visible: data.visible !== false };
}

export async function saveHomeSection(
  key: HomeContentKey,
  payload: unknown,
): Promise<SaveHomeSectionResult> {
  await requireBackofficeSession();

  const dbLabel =
    key === "home.testimonials"
      ? "Inicio — Testimonios"
      : SITE_HOME_SECTION_META[key as HomeContentAdminKey].dbLabel;
  let payloadToSave: unknown;

  switch (key) {
    case "home.hero": {
      const r = homeHeroPayloadSchema.safeParse(payload);
      if (!r.success) return { ok: false, error: formatZodError(r.error) };
      payloadToSave = withHomeVisible(r.data);
      break;
    }
    case "home.categories": {
      const r = homeCategoriesPayloadSchema.safeParse(payload);
      if (!r.success) return { ok: false, error: formatZodError(r.error) };
      payloadToSave = withHomeVisible(r.data);
      break;
    }
    case "home.featured": {
      const r = homeFeaturedPayloadSchema.safeParse(payload);
      if (!r.success) return { ok: false, error: formatZodError(r.error) };
      payloadToSave = withHomeVisible(r.data);
      break;
    }
    case "home.service_tech": {
      const r = homeServiceTechPayloadSchema.safeParse(payload);
      if (!r.success) return { ok: false, error: formatZodError(r.error) };
      payloadToSave = withHomeVisible(r.data);
      break;
    }
    case "home.why_choose": {
      const r = homeWhyPayloadSchema.safeParse(payload);
      if (!r.success) return { ok: false, error: formatZodError(r.error) };
      payloadToSave = withHomeVisible(r.data);
      break;
    }
    case "home.testimonials": {
      const r = homeTestimonialsPayloadSchema.safeParse(payload);
      if (!r.success) return { ok: false, error: formatZodError(r.error) };
      payloadToSave = withHomeVisible(r.data);
      break;
    }
    case "home.faq": {
      const r = homeFaqPayloadSchema.safeParse(payload);
      if (!r.success) return { ok: false, error: formatZodError(r.error) };
      payloadToSave = withHomeVisible(r.data);
      break;
    }
    case "home.cta_final": {
      const r = homeCtaFinalPayloadSchema.safeParse(payload);
      if (!r.success) return { ok: false, error: formatZodError(r.error) };
      payloadToSave = withHomeVisible(r.data);
      break;
    }
    default:
      return { ok: false, error: "Sección no reconocida" };
  }

  try {
    await upsertContentEntryAdmin({
      key,
      label: dbLabel,
      payload: payloadToSave,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo guardar" };
  }

  revalidatePath("/");
  revalidatePath("/backoffice/contenido");
  return { ok: true };
}
