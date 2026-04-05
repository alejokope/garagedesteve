import { z } from "zod";

const categoryIdSchema = z.enum([
  "mac",
  "ipad",
  "iphone",
  "watch",
  "audio",
  "desktop",
  "servicio",
  "otros",
]);

const serviceIconSchema = z.enum(["shield", "badge", "puzzle", "clock"]);

const homeVisibleField = z.boolean().optional();

export const homeHeroPayloadSchema = z.object({
  titleBefore: z.string().min(1, "El título principal no puede estar vacío"),
  titleHighlight: z.string().min(1, "La palabra destacada no puede estar vacía"),
  subtitle: z.string(),
  stats: z
    .array(
      z.object({
        value: z.string().min(1),
        label: z.string().min(1),
      }),
    )
    .min(1, "Agregá al menos una estadística")
    .max(6),
  primaryCta: z.object({
    label: z.string().min(1),
    href: z.string().min(1),
  }),
  secondaryCta: z.object({
    label: z.string().min(1),
    href: z.string().min(1),
  }),
  imageSrc: z.string().min(1, "La ruta o URL de la imagen es obligatoria"),
  imageAlt: z.string(),
  visible: homeVisibleField,
});

const homeCategoryTileSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("product"),
    title: z.string().min(1),
    description: z.string(),
    href: z.string().min(1),
    image: z.string().min(1),
    imageAlt: z.string(),
    category: categoryIdSchema,
  }),
  z.object({
    kind: z.literal("service"),
    title: z.string().min(1),
    description: z.string(),
    href: z.string().min(1),
  }),
]);

export const homeCategoriesPayloadSchema = z.object({
  sectionTitle: z.string().min(1),
  sectionSubtitle: z.string(),
  tiles: z.array(homeCategoryTileSchema).min(1, "Debe haber al menos un bloque de categoría"),
  visible: homeVisibleField,
});

export const homeFeaturedPayloadSchema = z.object({
  ids: z.array(z.string()),
  visible: homeVisibleField,
});

export const homeServiceTechPayloadSchema = z.object({
  title: z.string().min(1),
  intro: z.string(),
  imageUrl: z.string().min(1),
  imageAlt: z.string(),
  features: z
    .array(
      z.object({
        title: z.string().min(1),
        body: z.string(),
        icon: serviceIconSchema,
      }),
    )
    .min(1, "Agregá al menos un beneficio"),
  ctaLabel: z.string().min(1),
  ctaHref: z.string().min(1),
  visible: homeVisibleField,
});

export const homeWhyPayloadSchema = z.object({
  sectionTitle: z.string().min(1),
  sectionSubtitle: z.string(),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        body: z.string(),
        highlight: z.boolean().optional(),
      }),
    )
    .min(1, "Agregá al menos un motivo"),
  visible: homeVisibleField,
});

export const homeTestimonialsPayloadSchema = z.object({
  sectionTitle: z.string().min(1),
  sectionSubtitle: z.string(),
  items: z
    .array(
      z.object({
        quote: z.string().min(1),
        name: z.string().min(1),
        role: z.string(),
        avatar: z.string().min(1),
        verified: z.boolean().optional(),
      }),
    )
    .min(1, "Agregá al menos un testimonio"),
  visible: homeVisibleField,
});

export const homeFaqPayloadSchema = z.object({
  sectionTitle: z.string().min(1),
  sectionSubtitle: z.string(),
  items: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).min(1),
  visible: homeVisibleField,
});

export const homeCtaFinalPayloadSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string(),
  primaryCta: z.object({ label: z.string().min(1), href: z.string().min(1) }),
  secondaryCta: z.object({ label: z.string().min(1), href: z.string().min(1) }),
  visible: homeVisibleField,
});
