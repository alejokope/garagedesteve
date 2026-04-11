"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { SiteContactPublic } from "@/lib/site-contact-schema";

const SiteContactContext = createContext<SiteContactPublic | null>(null);

export function SiteContactProvider({
  value,
  children,
}: {
  value: SiteContactPublic;
  children: ReactNode;
}) {
  return <SiteContactContext.Provider value={value}>{children}</SiteContactContext.Provider>;
}

export function useSiteContact(): SiteContactPublic {
  const v = useContext(SiteContactContext);
  if (!v) {
    throw new Error("useSiteContact debe usarse dentro de SiteContactProvider");
  }
  return v;
}
