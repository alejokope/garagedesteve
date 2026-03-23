import { SiteChrome } from "@/app/components/site-chrome";
import { Providers } from "@/app/providers";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <SiteChrome>{children}</SiteChrome>
    </Providers>
  );
}
