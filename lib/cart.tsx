"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: number; // product id
  slug: string;
  name: string;
  price: number;
  image: string | null;
  size: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (id: number, size: string, quantity: number) => void;
  removeItem: (id: number, size: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "tchokos_cart_v1";

const lineKey = (id: number, size: string) => `${id}::${size}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Chargement depuis localStorage (au montage uniquement)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  // Persistance
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, it) => n + it.quantity, 0);
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);

    return {
      items,
      ready,
      count,
      subtotal,
      addItem: (item, quantity = 1) =>
        setItems((prev) => {
          const key = lineKey(item.id, item.size);
          const existing = prev.find((p) => lineKey(p.id, p.size) === key);
          if (existing) {
            return prev.map((p) =>
              lineKey(p.id, p.size) === key
                ? { ...p, quantity: p.quantity + quantity }
                : p,
            );
          }
          return [...prev, { ...item, quantity }];
        }),
      setQuantity: (id, size, quantity) =>
        setItems((prev) =>
          prev
            .map((p) =>
              lineKey(p.id, p.size) === lineKey(id, size)
                ? { ...p, quantity: Math.max(0, quantity) }
                : p,
            )
            .filter((p) => p.quantity > 0),
        ),
      removeItem: (id, size) =>
        setItems((prev) =>
          prev.filter((p) => lineKey(p.id, p.size) !== lineKey(id, size)),
        ),
      clear: () => setItems([]),
    };
  }, [items, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}
