export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  verified?: boolean;
};

export type FaqItem = {
  q: string;
  a: string;
};

export const homeTestimonials: Testimonial[] = [
  {
    quote:
      "Compré un iPhone sellado y la atención fue impecable. Me asesoraron por WhatsApp sin apuro.",
    name: "Lucía Fernández",
    role: "Buenos Aires",
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
  },
  {
    quote:
      "Llevé la Mac al taller: diagnóstico claro y presupuesto honesto. Volvería sin dudar.",
    name: "Martín Ríos",
    role: "Córdoba",
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
  },
  {
    quote:
      "Stock real, fotos acordes y envío coordinado al día. Muy recomendable.",
    name: "Paula Méndez",
    role: "Rosario",
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80",
  },
  {
    quote:
      "Necesitaba AirPods y accesorios; me guiaron con lo que convenía a mi uso.",
    name: "Diego Costa",
    role: "Mendoza",
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80",
  },
  {
    quote:
      "Servicio técnico serio: me explicaron qué valía la pena reparar y qué no.",
    name: "Valentina Soto",
    role: "La Plata",
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80",
  },
  {
    quote:
      "Compra por la web y cierre por WhatsApp tal como prometen. Sin vueltas.",
    name: "Nicolás Vera",
    role: "Mar del Plata",
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80",
  },
];

export const homeFaq: FaqItem[] = [
  {
    q: "¿Los precios de la web son finales?",
    a: "Son orientativos en ARS. La confirmación final (disponibilidad, promos y formas de pago) la cerramos por WhatsApp.",
  },
  {
    q: "¿Hacen envíos?",
    a: "Sí, coordinamos envío o retiro según zona y stock. Lo vemos en el mensaje con tu pedido.",
  },
  {
    q: "¿Qué garantía tienen los equipos?",
    a: "Depende del producto (nuevo sellado vs. usado premium). Te detallamos condiciones antes de avanzar.",
  },
  {
    q: "¿Puedo llevar un equipo al taller sin comprar antes?",
    a: "Sí. Agendamos diagnóstico y te damos presupuesto antes de cualquier reparación.",
  },
  {
    q: "¿Cómo pago?",
    a: "Te contamos opciones vigentes por WhatsApp: transferencia, efectivo u otras según disponibilidad.",
  },
];

export type WhyChooseItem = {
  title: string;
  body: string;
  highlight?: boolean;
};

export const whyChooseItems: WhyChooseItem[] = [
  {
    title: "Productos originales",
    body: "Stock certificado y trazabilidad clara en cada equipo que publicamos.",
  },
  {
    title: "Precios transparentes",
    body: "Sin letras chicas: te explicamos qué incluye cada precio antes de cerrar.",
  },
  {
    title: "Envíos coordinados",
    body: "Te acompañamos en plazos y modalidad según tu zona y disponibilidad.",
  },
  {
    title: "Financiación",
    body: "Opciones de pago que te contamos al momento de la consulta.",
  },
  {
    title: "Garantía respaldada",
    body: "Condiciones por producto, por escrito, para que compres tranquilo.",
  },
  {
    title: "Soporte especializado",
    body: "Equipo humano que entiende de hardware y te orienta sin apuro.",
    highlight: true,
  },
];

export type HomeServiceFeature = {
  title: string;
  body: string;
  icon: "shield" | "badge" | "puzzle" | "clock";
};

export const homeServiceIntro =
  "Técnicos certificados, repuestos alineados a estándar y diagnóstico claro antes de cualquier reparación.";

export const homeServiceFeatures: HomeServiceFeature[] = [
  {
    icon: "shield",
    title: "Garantía oficial",
    body: "Trabajamos con procesos y piezas que respetan el fabricante cuando aplica.",
  },
  {
    icon: "badge",
    title: "Técnicos certificados",
    body: "Experiencia en ecosistema Apple y diagnóstico profesional.",
  },
  {
    icon: "puzzle",
    title: "Repuestos de calidad",
    body: "Componentes seleccionados según cada modelo y uso.",
  },
  {
    icon: "clock",
    title: "Diagnóstico ágil",
    body: "Te contamos tiempos y alternativas sin rodeos.",
  },
];
