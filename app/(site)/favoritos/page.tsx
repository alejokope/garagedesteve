import type { Metadata } from "next";
import { FavoritesPageView } from "@/app/components/favorites-page-view";
import { SiteFooter } from "@/app/components/site-footer";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Favoritos · ${siteConfig.brandName}`,
  description: "Productos que guardaste para ver después.",
};

export default function FavoritosPage() {
  return (
    <main>
      <FavoritesPageView />
      <SiteFooter />
    </main>
  );
}
