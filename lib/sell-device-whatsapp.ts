import { computeFloatingContactPublicFromDefaults } from "@/lib/floating-contact-resolve";
import { whatsappUrl } from "@/lib/whatsapp-url";

/** Respaldo sin layout React: mismo mensaje que en servidor con valores por defecto. */
export function getSellDeviceWhatsAppHref(): string | null {
  const pub = computeFloatingContactPublicFromDefaults();
  if (!pub.phoneDigits) return null;
  return whatsappUrl(pub.phoneDigits, pub.planCanjeMessage);
}
