"use client";

import { useEffect } from "react";
import { useCart } from "../contexts/CartContext";

export function ClearCart({ sessionId }: { sessionId: string }) {
  const { clearCart } = useCart();

  useEffect(() => {
    if (sessionId) {
      clearCart();
    }
  }, [sessionId, clearCart]);

  return null;
}
