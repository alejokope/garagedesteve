import type { HomeContentAdminKey } from "@/lib/home-public-content";

export const SITE_HOME_SECTION_META: Record<
  HomeContentAdminKey,
  { anchorId: string; title: string; description: string; dbLabel: string }
> = {
  "home.hero": {
    anchorId: "inicio-hero",
    title: "Encabezado principal (parte superior)",
    description:
      "El primer bloque que ve el visitante: títulos, texto introductorio, números destacados, botones e imagen principal.",
    dbLabel: "Inicio — Encabezado principal",
  },
  "home.categories": {
    anchorId: "inicio-categorias",
    title: "Bloque “Nuestras categorías”",
    description:
      "Título de la sección y las tarjetas (iPhone, iPad, servicio técnico, etc.). Podés marcar cada tarjeta como producto o como servicio.",
    dbLabel: "Inicio — Categorías",
  },
  "home.featured": {
    anchorId: "inicio-destacados",
    title: "Productos destacados en la home",
    description:
      "Elegí qué productos publicados aparecen en el carrusel de destacados. El orden es el que definís acá.",
    dbLabel: "Inicio — Productos destacados",
  },
  "home.service_tech": {
    anchorId: "inicio-servicio-tecnico",
    title: "Sección servicio técnico",
    description:
      "Texto e imagen del bloque de taller, lista de beneficios y botón que lleva a la página de servicio.",
    dbLabel: "Inicio — Servicio técnico",
  },
  "home.why_choose": {
    anchorId: "inicio-por-que",
    title: "“Por qué elegirnos”",
    description: "Título de la sección y los motivos en tarjetas (podés marcar uno como destacado).",
    dbLabel: "Inicio — Por qué elegirnos",
  },
  "home.faq": {
    anchorId: "inicio-faq",
    title: "Preguntas frecuentes",
    description: "Títulos de la sección y cada pregunta con su respuesta.",
    dbLabel: "Inicio — Preguntas frecuentes",
  },
  "home.cta_final": {
    anchorId: "inicio-cierre",
    title: "Cierre de página (llamado a la acción)",
    description: "El bloque final antes del pie: título, subtítulo y los dos botones.",
    dbLabel: "Inicio — Cierre",
  },
};
