"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "cart" | "fav";

type Toast = { id: string; kind: ToastKind; message: string };

export type ShopFeedbackContextValue = {
  cartPulseGeneration: number;
  favPulseGeneration: number;
  celebrateCart: () => void;
  celebrateFavorite: () => void;
};

const ShopFeedbackContext = createContext<ShopFeedbackContextValue | null>(null);

const TOAST_MS = 3200;

function nextToastId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ShopFeedbackProvider({ children }: { children: ReactNode }) {
  const [cartPulseGeneration, setCartPulseGeneration] = useState(0);
  const [favPulseGeneration, setFavPulseGeneration] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const celebrateCart = useCallback(() => {
    setCartPulseGeneration((g) => g + 1);
    const id = nextToastId();
    setToasts((t) => [...t, { id, kind: "cart", message: "Agregado al carrito" }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, TOAST_MS);
  }, []);

  const celebrateFavorite = useCallback(() => {
    setFavPulseGeneration((g) => g + 1);
    const id = nextToastId();
    setToasts((t) => [...t, { id, kind: "fav", message: "Guardado en favoritos" }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, TOAST_MS);
  }, []);

  const value = useMemo(
    () => ({
      cartPulseGeneration,
      favPulseGeneration,
      celebrateCart,
      celebrateFavorite,
    }),
    [cartPulseGeneration, favPulseGeneration, celebrateCart, celebrateFavorite],
  );

  return (
    <ShopFeedbackContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:p-6"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`egd-shop-toast pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm ${
              t.kind === "cart"
                ? "border-neutral-200/90 bg-white/95 text-neutral-900"
                : "border-red-200/80 bg-white/95 text-neutral-900"
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${
                t.kind === "cart" ? "bg-neutral-900 text-white" : "bg-red-500 text-white"
              }`}
              aria-hidden
            >
              {t.kind === "cart" ? "✓" : "♥"}
            </span>
            <p className="text-sm font-semibold leading-snug">{t.message}</p>
          </div>
        ))}
      </div>
    </ShopFeedbackContext.Provider>
  );
}

export function useShopFeedback() {
  const ctx = useContext(ShopFeedbackContext);
  if (!ctx) {
    throw new Error("useShopFeedback debe usarse dentro de ShopFeedbackProvider");
  }
  return ctx;
}
