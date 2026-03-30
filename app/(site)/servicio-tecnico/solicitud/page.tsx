import { ServicioTecnicoRedirect } from "@/app/components/servicio-tecnico-redirect";

/** La solicitud web se retiró; la URL histórica lleva al bloque de seguimiento / WhatsApp. */
export default function ServicioSolicitudRedirectPage() {
  return <ServicioTecnicoRedirect hash="seguimiento" />;
}
