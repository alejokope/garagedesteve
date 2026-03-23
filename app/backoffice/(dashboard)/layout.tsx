import { BackofficeShell } from "@/app/components/backoffice/backoffice-shell";
import { BackofficeEnvBanner } from "@/app/components/backoffice/env-banner";

/** Evita prerender en build cuando Supabase aún no tiene migraciones aplicadas. */
export const dynamic = "force-dynamic";

export default function BackofficeDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BackofficeShell>
      <BackofficeEnvBanner />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</div>
    </BackofficeShell>
  );
}
