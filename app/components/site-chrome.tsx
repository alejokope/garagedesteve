"use client";

import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { SiteHeader } from "@/app/components/site-header";
import { SiteNavigationProgress } from "@/app/components/site/site-navigation-progress";
import { FloatingContactFabs } from "@/app/components/floating-contact-fabs";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showFab = pathname !== "/carrito";

  return (
    <>
      <SiteHeader />
      <Suspense fallback={null}>
        <SiteNavigationProgress />
      </Suspense>
      {children}
      {showFab ? <FloatingContactFabs /> : null}
    </>
  );
}
