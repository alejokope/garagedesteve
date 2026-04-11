import { siteConfig } from "@/lib/site-config";
import { whatsappUrl } from "@/lib/whatsapp";

export function buildSellDeviceWhatsAppMessage(businessName?: string) {
  const name =
    businessName?.trim() ||
    process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NAME ||
    siteConfig.brandName;
  return [
    `Hola ${name}, quiero vender mi equipo.`,
    "",
    "Te dejo los datos (completá lo que puedas):",
    "· Modelo exacto:",
    "· Capacidad de almacenamiento:",
    "· Estado de la pantalla y marcos:",
    "· Salud de la batería (%) si es iPhone:",
    "· ¿Está liberado? ¿Sin cuenta de iCloud?",
    "· ¿Tenés caja y accesorios originales?",
    "",
    "Quiero que me pasen una cotización. ¡Gracias!",
  ].join("\n");
}

export function getSellDeviceWhatsAppHref(): string | null {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";
  if (!phone) return null;
  const text = buildSellDeviceWhatsAppMessage();
  return whatsappUrl(phone, text);
}
