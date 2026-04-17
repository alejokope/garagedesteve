"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  TRADE_IN_STORAGE_KEY,
  loadTradeInFromLocalStorage,
  saveTradeInToLocalStorage,
  type TradeInSavedOffer,
} from "@/lib/trade-in-offer";

export type TradeInContextValue = {
  hydrated: boolean;
  offer: TradeInSavedOffer | null;
  applyInCheckout: boolean;
  setOffer: (offer: TradeInSavedOffer | null) => void;
  setApplyInCheckout: (v: boolean) => void;
  clearOffer: () => void;
};

const TradeInContext = createContext<TradeInContextValue | null>(null);

export function TradeInProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [offer, setOfferState] = useState<TradeInSavedOffer | null>(null);
  const [applyInCheckout, setApplyState] = useState(false);
  const skipNextPersist = useRef(false);

  useEffect(() => {
    const p = loadTradeInFromLocalStorage();
    skipNextPersist.current = true;
    setOfferState(p.offer);
    setApplyState(p.applyInCheckout);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    saveTradeInToLocalStorage({ offer, applyInCheckout });
  }, [offer, applyInCheckout, hydrated]);

  const setOffer = useCallback((next: TradeInSavedOffer | null) => {
    setOfferState(next);
    if (!next) setApplyState(false);
  }, []);

  const setApplyInCheckout = useCallback((v: boolean) => {
    setApplyState(v);
  }, []);

  const clearOffer = useCallback(() => {
    setOfferState(null);
    setApplyState(false);
    skipNextPersist.current = true;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(TRADE_IN_STORAGE_KEY);
      } catch {
        /* */
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      offer,
      applyInCheckout,
      setOffer,
      setApplyInCheckout,
      clearOffer,
    }),
    [hydrated, offer, applyInCheckout, setOffer, setApplyInCheckout, clearOffer],
  );

  return <TradeInContext.Provider value={value}>{children}</TradeInContext.Provider>;
}

export function useTradeIn() {
  const ctx = useContext(TradeInContext);
  if (!ctx) throw new Error("useTradeIn debe usarse dentro de TradeInProvider");
  return ctx;
}
