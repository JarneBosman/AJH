"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CartCategory, CartItem, DimensionSelection, ResolvedSelection } from "@/types/shop";

const STORAGE_KEY = "atelier-cart-v1";

interface AddCartItemInput {
  source: "product" | "configurator";
  lineKey: string;
  name: string;
  category: CartCategory;
  image: string;
  unitPrice: number;
  selections: ResolvedSelection[];
  dimensions?: DimensionSelection;
  quantity?: number;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (item: AddCartItemInput) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const buildId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as CartItem[];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(parsed);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((input: AddCartItemInput) => {
    setItems((previous) => {
      const incomingQty = input.quantity ?? 1;
      const existing = previous.find((entry) => entry.lineKey === input.lineKey);

      if (existing) {
        return previous.map((entry) => {
          if (entry.id !== existing.id) return entry;
          const quantity = entry.quantity + incomingQty;
          return {
            ...entry,
            quantity,
            totalPrice: entry.unitPrice * quantity,
          };
        });
      }

      const newItem: CartItem = {
        id: buildId(),
        lineKey: input.lineKey,
        source: input.source,
        name: input.name,
        category: input.category,
        image: input.image,
        unitPrice: input.unitPrice,
        quantity: incomingQty,
        totalPrice: input.unitPrice * incomingQty,
        selections: input.selections,
        dimensions: input.dimensions,
      };

      return [...previous, newItem];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((previous) => previous.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((previous) => previous.filter((item) => item.id !== itemId));
      return;
    }

    setItems((previous) =>
      previous.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              totalPrice: item.unitPrice * quantity,
            }
          : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.totalPrice, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      totalItems,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [addItem, clearCart, items, removeItem, subtotal, totalItems, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};
