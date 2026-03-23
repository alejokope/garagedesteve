"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/data";
import type { CartItem } from "@/lib/types";

type State = { items: CartItem[] };

type Action =
  | { type: "ADD"; product: Product }
  | { type: "REMOVE"; id: string }
  | { type: "SET_QTY"; id: string; qty: number }
  | { type: "CLEAR" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find(
        (i) => i.product.id === action.product.id,
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, qty: i.qty + 1 }
              : i,
          ),
        };
      }
      return { items: [...state.items, { product: action.product, qty: 1 }] };
    }
    case "REMOVE":
      return {
        items: state.items.filter((i) => i.product.id !== action.id),
      };
    case "SET_QTY":
      if (action.qty <= 0) {
        return {
          items: state.items.filter((i) => i.product.id !== action.id),
        };
      }
      return {
        items: state.items.map((i) =>
          i.product.id === action.id ? { ...i, qty: action.qty } : i,
        ),
      };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

export type CartContextValue = {
  items: CartItem[];
  add: (product: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  const add = useCallback((product: Product) => {
    dispatch({ type: "ADD", product });
  }, []);

  const remove = useCallback((id: string) => {
    dispatch({ type: "REMOVE", id });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    dispatch({ type: "SET_QTY", id, qty });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const total = useMemo(
    () =>
      state.items.reduce(
        (s, i) => s + Math.max(0, i.product.price) * i.qty,
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

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
