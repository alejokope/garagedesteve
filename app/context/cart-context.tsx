"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { useShopFeedback } from "@/app/context/shop-feedback-context";
import { cartLineUnitPrice } from "@/lib/cart-line";
import {
  loadCartFromLocalStorage,
  saveCartToLocalStorage,
} from "@/lib/cart-local-storage";
import type { Product } from "@/lib/data";
import { cartLineKey, type VariantSelections } from "@/lib/product-variants";
import type { CartItem } from "@/lib/types";

type State = { items: CartItem[] };

type Action =
  | { type: "ADD"; product: Product; variantSelections?: VariantSelections }
  | { type: "REMOVE"; lineKey: string }
  | { type: "SET_QTY"; lineKey: string; qty: number }
  | { type: "CLEAR" }
  | { type: "REPLACE"; items: CartItem[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD": {
      const lineKey = cartLineKey(
        action.product.id,
        action.variantSelections,
      );
      const existing = state.items.find((i) => i.lineKey === lineKey);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.lineKey === lineKey ? { ...i, qty: i.qty + 1 } : i,
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            lineKey,
            product: action.product,
            qty: 1,
            variantSelections: action.variantSelections,
          },
        ],
      };
    }
    case "REMOVE":
      return {
        items: state.items.filter((i) => i.lineKey !== action.lineKey),
      };
    case "SET_QTY":
      if (action.qty <= 0) {
        return {
          items: state.items.filter((i) => i.lineKey !== action.lineKey),
        };
      }
      return {
        items: state.items.map((i) =>
          i.lineKey === action.lineKey ? { ...i, qty: action.qty } : i,
        ),
      };
    case "CLEAR":
      return { items: [] };
    case "REPLACE":
      return { items: action.items };
    default:
      return state;
  }
}

export type CartContextValue = {
  items: CartItem[];
  add: (product: Product, variantSelections?: VariantSelections) => void;
  remove: (lineKey: string) => void;
  setQty: (lineKey: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function CartProviderInner({ children }: { children: ReactNode }) {
  const { celebrateCart } = useShopFeedback();
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const skipNextPersist = useRef(false);

  useEffect(() => {
    const loaded = loadCartFromLocalStorage();
    skipNextPersist.current = true;
    if (loaded.length > 0) {
      dispatch({ type: "REPLACE", items: loaded });
    }
  }, []);

  useEffect(() => {
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    saveCartToLocalStorage(state.items);
  }, [state.items]);

  const add = useCallback(
    (product: Product, variantSelections?: VariantSelections) => {
      dispatch({ type: "ADD", product, variantSelections });
      celebrateCart();
    },
    [celebrateCart],
  );

  const remove = useCallback((lineKey: string) => {
    dispatch({ type: "REMOVE", lineKey });
  }, []);

  const setQty = useCallback((lineKey: string, qty: number) => {
    dispatch({ type: "SET_QTY", lineKey, qty });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const total = useMemo(
    () =>
      state.items.reduce(
        (s, i) => s + Math.max(0, cartLineUnitPrice(i)) * i.qty,
        0,
      ),
    [state.items],
  );

  const count = useMemo(
    () => state.items.reduce((s, i) => s + i.qty, 0),
    [state.items],
  );

  const value = useMemo(
    () => ({
      items: state.items,
      add,
      remove,
      setQty,
      clear,
      total,
      count,
    }),
    [state.items, add, remove, setQty, clear, total, count],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  return <CartProviderInner>{children}</CartProviderInner>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
