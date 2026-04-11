import "server-only";

import { Resend } from "resend";

import { REPAIR_STATUS_LABELS, type RepairStatus } from "@/lib/repairs-types";
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

export async function sendRepairStatusChangedEmail(input: {
  to: string;
  trackingCode: string;
  fromStatus: RepairStatus;
  toStatus: RepairStatus;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!key) {
    return { ok: false, message: "Falta RESEND_API_KEY en el servidor" };
  }
  if (!from) {
    return { ok: false, message: "Falta RESEND_FROM_EMAIL" };
  }

  const base = siteBaseUrl();
  const trackUrl = `${base}/servicio-tecnico#seguimiento`;
  const brand = siteConfig.brandName;
  const codeHtml = `<strong style="font-size:18px;letter-spacing:0.06em;">${escapeHtml(input.trackingCode)}</strong>`;
  const fromLabel = REPAIR_STATUS_LABELS[input.fromStatus];
  const toLabel = REPAIR_STATUS_LABELS[input.toStatus];

  const overrideTo = process.env.RESEND_OVERRIDE_TO?.trim();
  const realRecipient = input.to.trim();
  const sendTo = overrideTo || realRecipient;
  const testBanner = overrideTo
    ? `<tr><td style="padding:16px 28px;background:#fef3c7;border-bottom:1px solid #fcd34d;"><p style="margin:0;font-size:13px;line-height:1.5;color:#92400e;"><strong>Modo prueba Resend:</strong> destinatario real: <span style="font-family:ui-monospace,monospace;">${escapeHtml(realRecipient)}</span></p></td></tr>`
    : "";

  const extraFinal =
    input.toStatus === "finalizado"
      ? `<p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#14532d;background:#f0fdf4;padding:14px 16px;border-radius:10px;border:1px solid #bbf7d0;">
            Tu caso quedó marcado como <strong>finalizado</strong>. Podés pasar a retirar el equipo o coordinar la entrega según lo acordado.
          </p>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#f4f4f5;padding:24px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      ${testBanner}
      <tr>
        <td style="padding:28px 28px 8px;">
          <p style="margin:0;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.12em;">${escapeHtml(brand)}</p>
          <h1 style="margin:12px 0 0;font-size:22px;font-weight:700;color:#18181b;">Actualización de tu reparación</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 28px 24px;">
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">
            El estado de tu caso cambió de <strong>${escapeHtml(fromLabel)}</strong> a <strong>${escapeHtml(toLabel)}</strong>.
          </p>
          <p style="margin:0 0 12px;font-size:14px;color:#52525b;">Código de seguimiento:</p>
          <p style="margin:0 0 20px;padding:14px 18px;background:#fafafa;border-radius:10px;border:1px solid #e4e4e7;text-align:center;font-family:ui-monospace,monospace;color:#18181b;">
            ${codeHtml}
          </p>
          ${extraFinal}
          <p style="margin:20px 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">
            <a href="${escapeHtml(trackUrl)}" style="color:#2563eb;font-weight:600;">Ver detalle en la web</a>
          </p>
          <p style="margin:0;font-size:13px;line-height:1.5;color:#71717a;">
            <span style="word-break:break-all;color:#52525b;">${escapeHtml(trackUrl)}</span>
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 28px 24px;border-top:1px solid #f4f4f5;">
          <p style="margin:0;font-size:12px;color:#a1a1aa;">Cualquier duda, escribinos por WhatsApp.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from,
    to: sendTo,
    subject: `${brand} · Estado: ${toLabel} (${input.trackingCode})`,
    html,
  });

  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}
