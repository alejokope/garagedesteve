import { listMediaGalleryPage } from "@/lib/backoffice/media-gallery-db";
import { requireBackofficeSession } from "@/lib/backoffice/session";

import { MediaGalleryPageClient } from "./media-gallery-page-client";

export const dynamic = "force-dynamic";

export default async function GaleriaPage() {
  await requireBackofficeSession();
  const initial = await listMediaGalleryPage(0);
  return <MediaGalleryPageClient initialItems={initial.items} initialHasMore={initial.hasMore} />;
}
