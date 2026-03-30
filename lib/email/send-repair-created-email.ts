import "server-only";

import { Resend } from "resend";

import { siteConfig } from "@/lib/site-config";

function siteBaseUrl(): string {
  const u = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (u) return u.replace(/\/$/, "");
  return "http://localhost:3000";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendRepairCreatedEmail(input: {
  to: string;
  trackingCode: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!key) {
    return { ok: false, message: "Falta RESEND_API_KEY en el servidor" };
  }
  if (!from) {
    return { ok: false, message: "Falta RESEND_FROM_EMAIL (remitente verificado en Resend)" };
  }

  const base = siteBaseUrl();
  const trackUrl = `${base}/servicio-tecnico#seguimiento`;
  const brand = siteConfig.brandName;
  const codeHtml = `<strong style="font-size:20px;letter-spacing:0.08em;">${escapeHtml(input.trackingCode)}</strong>`;

  /**
   * Resend en cuenta de prueba solo deja enviar a tu propio email verificado.
   * Si definís RESEND_OVERRIDE_TO (ej. garagedestevedev@gmail.com), el envío va a esa
   * bandeja y el cuerpo indica el destinatario real guardado en la reparación.
   */
  const overrideTo = process.env.RESEND_OVERRIDE_TO?.trim();
  const realRecipient = input.to.trim();
  const sendTo = overrideTo || realRecipient;
  const testBanner = overrideTo
    ? `<tr><td style="padding:16px 28px;background:#fef3c7;border-bottom:1px solid #fcd34d;"><p style="margin:0;font-size:13px;line-height:1.5;color:#92400e;"><strong>Modo prueba Resend:</strong> este correo se envió a tu bandeja de prueba. El destinatario real en la base de datos es <span style="font-family:ui-monospace,monospace;">${escapeHtml(realRecipient)}</span>. Para mandar al cliente, verificá un dominio en resend.com/domains y borrá RESEND_OVERRIDE_TO.</p></td></tr>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#f4f4f5;padding:24px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      ${testBanner}
      <tr>
        <td style="padding:28px 28px 8px;">
          <p style="margin:0;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.12em;">${escapeHtml(brand)}</p>
          <h1 style="margin:12px 0 0;font-size:22px;font-weight:700;color:#18181b;">Tu reparación fue registrada</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 28px 24px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">
            Usá este código para ver el estado en cualquier momento:
          </p>
          <p style="margin:0 0 20px;padding:16px 20px;background:#fafafa;border-radius:10px;border:1px solid #e4e4e7;text-align:center;font-family:ui-monospace,monospace;color:#18181b;">
            ${codeHtml}
          </p>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3f3f46;">
            <a href="${escapeHtml(trackUrl)}" style="color:#2563eb;font-weight:600;">Consultar estado de la reparación</a>
          </p>
          <p style="margin:0;font-size:13px;line-height:1.5;color:#71717a;">
            Si el enlace no abre, copiá esta dirección en el navegador:<br/>
            <span style="word-break:break-all;color:#52525b;">${escapeHtml(trackUrl)}</span>
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 28px 24px;border-top:1px solid #f4f4f5;">
          <p style="margin:0;font-size:12px;color:#a1a1aa;">Este mensaje es automático. Para coordinar el equipo, seguí por WhatsApp como acordaron.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from,
    to: sendTo,
    subject: `${brand} · Código de seguimiento: ${input.trackingCode}`,
    html,
  });

  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}
