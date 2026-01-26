"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useCart } from "../contexts/CartContext";
import type { ProductWithVariants } from "@/lib/types/product";
import { AVAILABLE_SIZES, type Size } from "@/lib/types/product";

type ProductCardProps = {
  product: ProductWithVariants;
  onToast: (message: string) => void;
};

export function ProductCard({ product, onToast }: ProductCardProps) {
  const [size, setSize] = useState<Size>("M");
  const [quantity, setQuantity] = useState(1);
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

  // Product images - prioritize product_images, fall back to image_url, then default
  const productImages = useMemo(() => {
    // Use images from product_images table if available
    if (product.images && product.images.length > 0) {
      return product.images.map((img) => img.url);
    }
    // Fall back to single image_url if available
    if (product.image_url) {
      return [product.image_url];
    }
    // Fallback to default placeholder
    return ["/shirt-front.png"];
  }, [product.images, product.image_url]);

  const handleAddToCart = () => {
    if (isOutOfStock(size)) {
      onToast(`Size ${size} is out of stock`);
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
    onToast(`Added to cart: ${product.name} - Size ${size} x ${quantity}`);
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
      {/* Image Gallery */}
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

          {/* Studio spotlight effect */}
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

          {/* Soft glow layers */}
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
          <div className="mt-6 flex gap-3 flex-wrap">
            {productImages.map((img, index) => {
              const isActive = index === selectedImageIndex;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={[
                    "relative h-16 w-16 overflow-hidden rounded-xl transition-all",
                    isActive
                      ? "opacity-100 ring-2 ring-white/40"
                      : "opacity-50 hover:opacity-80",
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
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="order-2 md:order-1 flex flex-col justify-center">
        <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {product.name}
        </h3>
        <p className="mt-3 text-lg text-white/70">
          ${(product.price / 100).toFixed(0)}
        </p>

        {product.description && (
          <p className="mt-4 text-sm text-white/50">{product.description}</p>
        )}

        {/* Size Selector */}
        <div className="mt-8">
          <p className="text-sm tracking-wide text-white/60">SIZE</p>
          <div className="mt-3 grid grid-cols-4 gap-2">
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
                    "h-10 rounded-full border text-sm transition relative",
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
                      <span className="absolute w-[1px] h-6 bg-white/20 rotate-45" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-white/40">
            {isOutOfStock(size) && (
              <span className="text-red-400">Out of stock</span>
            )}
            {!isOutOfStock(size) && getStockForSize(size) <= 5 && (
              <span className="text-yellow-400">
                Only {getStockForSize(size)} left
              </span>
            )}
          </p>
        </div>

        {/* Quantity */}
        <div className="mt-6">
          <p className="text-sm tracking-wide text-white/60">QUANTITY</p>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-9 w-9 rounded-full border border-white/20 text-white transition hover:border-white/40"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="min-w-[2.5rem] text-center font-medium">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="h-9 w-9 rounded-full border border-white/20 text-white transition hover:border-white/40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart */}
        <div className="mt-8">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock(size)}
            className={[
              "inline-flex h-12 w-full max-w-xs items-center justify-center rounded-full transition font-medium",
              isOutOfStock(size)
                ? "bg-white/20 text-white/50 cursor-not-allowed"
                : "bg-white text-black hover:bg-white/90",
            ].join(" ")}
          >
            {isOutOfStock(size) ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
