"use client";

import { CartProvider } from "@/context/cart-context";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <CartProvider>{children}</CartProvider>;
};
