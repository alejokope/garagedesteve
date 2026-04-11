import { FloatingContactProvider } from "@/app/context/floating-contact-context";
import { SiteChrome } from "@/app/components/site-chrome";
import { Providers } from "@/app/providers";
import { getFloatingContactPublic } from "@/lib/floating-contact-server";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const floatingContact = await getFloatingContactPublic();

  return (
    <FloatingContactProvider value={floatingContact}>
      <Providers>
        <SiteChrome>{children}</SiteChrome>
      </Providers>
    </FloatingContactProvider>
  );
}
