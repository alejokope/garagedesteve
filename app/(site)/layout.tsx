import { FloatingContactProvider } from "@/app/context/floating-contact-context";
import { SiteContactProvider } from "@/app/context/site-contact-context";
import { SiteChrome } from "@/app/components/site-chrome";
import { Providers } from "@/app/providers";
import { getFloatingContactPublic } from "@/lib/floating-contact-server";
import { getSiteContactPublic } from "@/lib/site-contact-server";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [floatingContact, siteContact] = await Promise.all([
    getFloatingContactPublic(),
    getSiteContactPublic(),
  ]);

  return (
    <SiteContactProvider value={siteContact}>
      <FloatingContactProvider value={floatingContact}>
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </FloatingContactProvider>
    </SiteContactProvider>
  );
}
