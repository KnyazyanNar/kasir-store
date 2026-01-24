"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../contexts/CartContext";
import { FadeIn } from "../components/FadeIn";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = getTotal();
  const subtotal = total; // For now, no taxes/shipping

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Checkout failed");
      }

      const data = (await res.json()) as { url?: string };
      if (!data?.url) throw new Error("No checkout URL returned");

      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <FadeIn className="text-center">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Your Cart
            </h1>
            <p className="mt-6 text-lg text-white/60">
              Your cart is empty.
            </p>
            <Link
              href="/#product"
              className="mt-10 inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white px-8 text-sm font-medium tracking-wide text-black transition hover:bg-white/90"
            >
              Continue Shopping
            </Link>
          </FadeIn>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <FadeIn>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Your Cart
          </h1>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={`${item.id}-${item.size}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-6 border-b border-white/10 pb-6"
                  >
                    {/* Product Image */}
                    <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-medium">{item.name}</h3>
                        <p className="mt-2 text-sm font-medium text-white/80">
                          Size {item.size}
                        </p>
                        <p className="mt-2 text-lg font-medium">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="mt-4 flex items-center gap-4">
                        <span className="text-sm text-white/60">Quantity:</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.size, item.quantity - 1)
                            }
                            className="h-8 w-8 rounded-full border border-white/20 text-white transition hover:border-white/40"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.size, item.quantity + 1)
                            }
                            className="h-8 w-8 rounded-full border border-white/20 text-white transition hover:border-white/40"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id, item.size)}
                      className="self-start text-sm text-white/40 transition hover:text-white/70"
                      aria-label="Remove item"
                    >
                      Remove
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <h2 className="text-xl font-semibold tracking-tight">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Shipping</span>
                    <span className="text-white/40">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="text-lg font-semibold">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={loading || items.length === 0}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-white text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Processing…" : "Proceed to Checkout"}
                </button>

                {error && (
                  <p className="mt-4 text-sm text-red-400">{error}</p>
                )}

                <Link
                  href="/#product"
                  className="mt-4 block text-center text-sm text-white/60 transition hover:text-white/80"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
