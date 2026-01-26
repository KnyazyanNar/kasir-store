"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useCart } from "../contexts/CartContext";
import { Toast } from "./Toast";
import { FadeIn } from "./FadeIn";
import type { ProductWithVariants } from "@/lib/types/product";
import { AVAILABLE_SIZES, type Size } from "@/lib/types/product";

type ProductSectionProps = {
  product: ProductWithVariants;
};

export function ProductSection({ product }: ProductSectionProps) {
  const [size, setSize] = useState<Size>("M");
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addItem } = useCart();

  // Get stock for a given size
  const getStockForSize = (s: string): number => {
    const variant = product.variants.find((v) => v.size === s);
    return variant?.stock ?? 0;
  };

  // Check if size is out of stock
  const isOutOfStock = (s: string): boolean => {
    return getStockForSize(s) === 0;
  };

  // Product images - use image_url if available, otherwise fallback to defaults
  const productImages = useMemo(() => {
    if (product.image_url) {
      // If product has an image, use it. Could extend to support multiple images later.
      return [product.image_url];
    }
    // Fallback to default images
    return [
      "/shirt-front.png",
      "/shirt-back.png",
      "/shirt-quality.png",
      "/shirt-print.png",
    ];
  }, [product.image_url]);

  const handleAddToCart = () => {
    if (isOutOfStock(size)) {
      setToastMessage(`Size ${size} is out of stock`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      size,
      quantity,
      image: productImages[0],
    });
    setToastMessage(`Added to cart: Size ${size} × ${quantity}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <>
      <Toast message={toastMessage} isVisible={showToast} />
      <section id="product" className="border-t border-white/10 snap-start">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <FadeIn className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
            <div className="order-2 md:order-1">
              <p className="text-sm tracking-[0.32em] text-white/60">THE DROP</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                {product.name}
              </h2>
              <p className="mt-4 text-lg text-white/70">
                ${(product.price / 100).toFixed(0)}
              </p>

              {product.description && (
                <p className="mt-4 text-sm text-white/50">{product.description}</p>
              )}

              <div className="mt-10">
                <p className="text-sm tracking-wide text-white/60">SIZE</p>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {AVAILABLE_SIZES.map((s) => {
                    const selected = s === size;
                    const outOfStock = isOutOfStock(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => !outOfStock && setSize(s)}
                        disabled={outOfStock}
                        className={[
                          "h-11 rounded-full border text-sm transition relative",
                          selected && !outOfStock
                            ? "border-white bg-white text-black"
                            : outOfStock
                            ? "border-white/10 text-white/30 cursor-not-allowed"
                            : "border-white/20 text-white hover:border-white/40",
                        ].join(" ")}
                        aria-pressed={selected}
                        aria-disabled={outOfStock}
                      >
                        {s}
                        {outOfStock && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="absolute w-[1px] h-8 bg-white/20 rotate-45" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-sm text-white/50">
                  Selected size: <span className="text-white/80">{size}</span>
                  {isOutOfStock(size) && (
                    <span className="ml-2 text-red-400">(Out of stock)</span>
                  )}
                  {!isOutOfStock(size) && getStockForSize(size) <= 5 && (
                    <span className="ml-2 text-yellow-400">
                      (Only {getStockForSize(size)} left)
                    </span>
                  )}
                </p>
              </div>

              <div className="mt-10">
                <p className="text-sm tracking-wide text-white/60">QUANTITY</p>
                <div className="mt-4 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 rounded-full border border-white/20 text-white transition hover:border-white/40"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="min-w-[3rem] text-center text-lg font-medium">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10 rounded-full border border-white/20 text-white transition hover:border-white/40"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-10 max-w-sm space-y-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock(size)}
                  className={[
                    "inline-flex h-12 w-full items-center justify-center rounded-full transition",
                    isOutOfStock(size)
                      ? "bg-white/20 text-white/50 cursor-not-allowed"
                      : "bg-white text-black hover:bg-white/90",
                  ].join(" ")}
                >
                  {isOutOfStock(size) ? "Out of Stock" : "Add to Cart"}
                </button>
                <Link
                  href="/cart"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/40"
                >
                  Go to Cart
                </Link>
                <p className="mt-4 text-xs leading-relaxed text-white/40">
                  Secure payment via Stripe Checkout. No account required.
                </p>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div
                className="relative aspect-[4/5] overflow-hidden rounded-3xl"
                style={{
                  boxShadow:
                    "inset 0 0 60px rgba(0, 0, 0, 0.4), inset 0 0 120px rgba(0, 0, 0, 0.2)",
                }}
              >
                {/* Dark gradient edges */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%)",
                    }}
                  />
                </div>

                {/* Studio spotlight effect behind the image */}
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[80%] w-[70%] rounded-full bg-white/[0.08] blur-3xl"
                  animate={{
                    opacity: [0.6, 0.8, 0.6],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 8,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "mirror",
                  }}
                />

                {/* Additional soft glow layers */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full"
                    style={{
                      background:
                        "radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 60%)",
                    }}
                  />
                </div>

                <div className="absolute inset-0 z-20 flex items-center justify-center p-10">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="relative h-full w-full z-30"
                    >
                      {/* Subtle glow behind the image */}
                      <div className="absolute inset-0 -z-10">
                        <div className="absolute inset-0 bg-white/[0.02] blur-2xl" />
                      </div>
                      <Image
                        src={productImages[selectedImageIndex]}
                        alt={`${product.name} preview`}
                        width={900}
                        height={900}
                        className="h-full w-full object-contain relative z-10"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {productImages.length > 1 && (
                <div className="mt-6 flex gap-3">
                  {productImages.map((img, index) => {
                    const isActive = index === selectedImageIndex;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        className={[
                          "relative h-20 w-20 overflow-hidden rounded-xl transition-opacity",
                          isActive ? "opacity-100" : "opacity-60 hover:opacity-80",
                        ].join(" ")}
                        aria-pressed={isActive}
                      >
                        <div
                          className="absolute inset-0 z-10"
                          style={{
                            background:
                              "radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.3) 100%)",
                          }}
                        />
                        <Image
                          src={img}
                          alt={`${product.name} view ${index + 1}`}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
