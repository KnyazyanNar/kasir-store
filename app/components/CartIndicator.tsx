"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "../contexts/CartContext";

export function CartIndicator() {
  const { getItemCount, getTotal } = useCart();
  const itemCount = getItemCount();
  const total = getTotal();

  // Don't show if cart is empty
  if (itemCount === 0) {
    return null;
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  return (
    <Link href="/cart">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 z-[100] flex items-center gap-3 rounded-full border border-white/20 bg-black/80 px-4 py-2.5 text-sm text-white backdrop-blur-md transition hover:border-white/40 hover:bg-black/90"
      >
        <span className="text-base">🛒</span>
        <span className="font-medium">{itemCount}</span>
        <span className="text-white/60">•</span>
        <span className="font-medium">{formatPrice(total)}</span>
      </motion.div>
    </Link>
  );
}
