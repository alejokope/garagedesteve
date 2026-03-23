"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { SiteHeader } from "@/app/components/site-header";
import { WhatsAppFab } from "@/app/components/whatsapp-fab";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showFab = pathname !== "/carrito";

  return (
    <>
      <SiteHeader />
      {children}
      {showFab ? <WhatsAppFab /> : null}
    </>
  );
}
