"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { FloatingContactPublic } from "@/lib/floating-contact-schema";
import { computeFloatingContactPublicFromDefaults } from "@/lib/floating-contact-resolve";

const FloatingContactContext = createContext<FloatingContactPublic | null>(null);

export function FloatingContactProvider({
  value,
  children,
}: {
  value: FloatingContactPublic;
  children: ReactNode;
}) {
  return (
    <FloatingContactContext.Provider value={value}>{children}</FloatingContactContext.Provider>
  );
}

export function useFloatingContact(): FloatingContactPublic {
  const fromServer = useContext(FloatingContactContext);
  return useMemo(() => {
    if (fromServer) return fromServer;
    return computeFloatingContactPublicFromDefaults();
  }, [fromServer]);
}
