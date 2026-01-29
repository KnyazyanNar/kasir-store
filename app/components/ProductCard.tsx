"use client";

import Image from "next/image";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useCart } from "../contexts/CartContext";
import type { ProductWithVariants } from "@/lib/data/getProducts";
import { createPortal } from "react-dom";

const AVAILABLE_SIZES = ["S", "M", "L", "XL"] as const;
type Size = (typeof AVAILABLE_SIZES)[number];

// Swipe threshold for changing slides
const SWIPE_THRESHOLD = 50;

// Navigation Arrow Component
function NavArrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const isPrev = direction === "prev";

  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={[
        "absolute top-1/2 -translate-y-1/2 z-40",
        "hidden md:flex items-center justify-center",
        "w-12 h-12 rounded-full",
        "bg-white/10 backdrop-blur-md border border-white/20",
        "text-white/80 hover:text-white hover:bg-white/20",
        "transition-all duration-300 ease-out",
        "shadow-lg shadow-black/20",
        isPrev ? "left-4" : "right-4",
      ].join(" ")}
      aria-label={isPrev ? "Previous image" : "Next image"}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isPrev ? "" : "rotate-180"}
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </motion.button>
  );
}

// Fullscreen Viewer Component
export function FullscreenViewer({
  images,
  currentIndex,
  onClose,
  onIndexChange,
  productName,
}: {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  productName: string;
}) {
  const [dragX, setDragX] = useState(0);
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        onIndexChange(currentIndex - 1);
      }
      if (e.key === "ArrowRight" && currentIndex < images.length - 1) {
        onIndexChange(currentIndex + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, images.length, onClose, onIndexChange]);

  // Lock body scroll
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const swipe = info.offset.x;
    if (swipe < -SWIPE_THRESHOLD && currentIndex < images.length - 1) {
      onIndexChange(currentIndex + 1);
    } else if (swipe > SWIPE_THRESHOLD && currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
    setDragX(0);
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <motion.button
        type="button"
        onClick={onClose}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={[
          "absolute top-4 right-4 z-50",
          "w-12 h-12 rounded-full",
          "bg-white/10 backdrop-blur-md border border-white/20",
          "text-white/80 hover:text-white hover:bg-white/20",
          "transition-all duration-200",
          "flex items-center justify-center",
        ].join(" ")}
        aria-label="Close fullscreen"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </motion.button>

      {/* Image counter */}
      <div className="absolute top-4 left-4 z-50 text-white/60 text-sm font-medium">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Swipeable image container */}
      <div
        ref={constraintsRef}
        className="w-full h-full flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDrag={(_, info) => setDragX(info.offset.x)}
          onDragEnd={handleDragEnd}
          animate={{ x: 0 }}
          className="relative w-full h-full flex items-center justify-center touch-pan-y"
          style={{ x: dragX }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full max-w-4xl max-h-[80vh] mx-auto p-8"
            >
              <Image
                src={images[currentIndex]}
                alt={`${productName} fullscreen view ${currentIndex + 1}`}
                fill
                className="object-contain select-none pointer-events-none"
                sizes="100vw"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Desktop navigation arrows */}
      {images.length > 1 && (
        <>
          {currentIndex > 0 && (
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onIndexChange(currentIndex - 1);
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={[
                "absolute left-4 top-1/2 -translate-y-1/2 z-50",
                "hidden md:flex items-center justify-center",
                "w-14 h-14 rounded-full",
                "bg-white/10 backdrop-blur-md border border-white/20",
                "text-white/80 hover:text-white hover:bg-white/20",
                "transition-all duration-200",
              ].join(" ")}
              aria-label="Previous image"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </motion.button>
          )}
          {currentIndex < images.length - 1 && (
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onIndexChange(currentIndex + 1);
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={[
                "absolute right-4 top-1/2 -translate-y-1/2 z-50",
                "hidden md:flex items-center justify-center",
                "w-14 h-14 rounded-full",
                "bg-white/10 backdrop-blur-md border border-white/20",
                "text-white/80 hover:text-white hover:bg-white/20",
                "transition-all duration-200",
              ].join(" ")}
              aria-label="Next image"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </motion.button>
          )}
        </>
      )}

      {/* Dots pagination */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onIndexChange(index);
              }}
              className={[
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/40 hover:bg-white/60",
              ].join(" ")}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </motion.div>,
    document.body
  );
}

type ProductCardProps = {
  product: ProductWithVariants;
  onToast: (message: string) => void;
};

export function ProductCard({ product, onToast }: ProductCardProps) {
  const [size, setSize] = useState<Size>("M");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [isMounted, setIsMounted] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  // Track mount state for portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get stock for a given size
  const getStockForSize = (s: string): number => {
    const variant = product.variants.find((v) => v.size === s);
    return variant?.stock ?? 0;
  };

  // Check if size is out of stock
  const isOutOfStock = (s: string): boolean => {
    return getStockForSize(s) === 0;
  };

  // Product images - use images array, fallback to default
  const productImages = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    // Fallback to default placeholder
    return ["/shirt-front.png"];
  }, [product.images]);

  const hasMultipleImages = productImages.length > 1;

  // Navigation functions
  const goToNext = useCallback(() => {
    if (selectedImageIndex < productImages.length - 1) {
      setSlideDirection(1);
      setSelectedImageIndex((prev) => prev + 1);
    }
  }, [selectedImageIndex, productImages.length]);

  const goToPrev = useCallback(() => {
    if (selectedImageIndex > 0) {
      setSlideDirection(-1);
      setSelectedImageIndex((prev) => prev - 1);
    }
  }, [selectedImageIndex]);

  const goToIndex = useCallback(
    (index: number) => {
      setSlideDirection(index > selectedImageIndex ? 1 : -1);
      setSelectedImageIndex(index);
    },
    [selectedImageIndex]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if gallery is in viewport and not in fullscreen
      if (isFullscreen) return;
      if (!galleryRef.current) return;

      const rect = galleryRef.current.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!isInView) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, isFullscreen]);

  // Handle swipe for mobile
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const swipe = info.offset.x;
    if (swipe < -SWIPE_THRESHOLD && selectedImageIndex < productImages.length - 1) {
      setSlideDirection(1);
      setSelectedImageIndex((prev) => prev + 1);
    } else if (swipe > SWIPE_THRESHOLD && selectedImageIndex > 0) {
      setSlideDirection(-1);
      setSelectedImageIndex((prev) => prev - 1);
    }
  };

  const handleImageClick = () => {
    setIsFullscreen(true);
  };

  const selectedStock = getStockForSize(size);

  // Reset quantity when size changes if it exceeds available stock
  useEffect(() => {
    const stock = getStockForSize(size);
    if (stock > 0 && quantity > stock) {
      setQuantity(stock);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  const handleAddToCart = () => {
    if (isOutOfStock(size)) {
      onToast(`Size ${size} is out of stock`);
      return;
    }
    if (quantity > selectedStock) return;

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
      <div className="order-1 md:order-2" ref={galleryRef}>
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-3xl group cursor-pointer"
          style={{
            boxShadow:
              "inset 0 0 60px rgba(0, 0, 0, 0.4), inset 0 0 120px rgba(0, 0, 0, 0.2)",
          }}
          onClick={handleImageClick}
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

          {/* Desktop Navigation Arrows */}
          <AnimatePresence>
            {hasMultipleImages && selectedImageIndex > 0 && (
              <NavArrow direction="prev" onClick={goToPrev} />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {hasMultipleImages && selectedImageIndex < productImages.length - 1 && (
              <NavArrow direction="next" onClick={goToNext} />
            )}
          </AnimatePresence>

          {/* Swipeable image container */}
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center p-10 touch-pan-y"
            drag={hasMultipleImages ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedImageIndex}
                initial={{ opacity: 0, x: slideDirection * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: slideDirection * -40 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
                  className="h-full w-full object-contain relative z-10 select-none pointer-events-none"
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Mobile Dots Pagination */}
          {hasMultipleImages && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-1.5 md:hidden">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToIndex(index);
                  }}
                  className={[
                    "h-1.5 rounded-full transition-all duration-300",
                    index === selectedImageIndex
                      ? "bg-white w-5"
                      : "bg-white/40 w-1.5",
                  ].join(" ")}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Mobile tap hint (subtle) */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 md:hidden pointer-events-none">
            <span className="text-white/30 text-xs">Tap to expand</span>
          </div>
        </div>

        {/* Thumbnail Gallery (Desktop) */}
        {hasMultipleImages && (
          <div className="mt-6 hidden md:flex gap-3 flex-wrap">
            {productImages.map((img, index) => {
              const isActive = index === selectedImageIndex;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToIndex(index)}
                  className={[
                    "relative h-16 w-16 overflow-hidden rounded-xl transition-all duration-200",
                    isActive
                      ? "opacity-100 ring-2 ring-white/40 scale-105"
                      : "opacity-50 hover:opacity-80 hover:scale-105",
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

        {/* Fullscreen Viewer */}
        <AnimatePresence>
          {isMounted && isFullscreen && (
            <FullscreenViewer
              images={productImages}
              currentIndex={selectedImageIndex}
              onClose={() => setIsFullscreen(false)}
              onIndexChange={goToIndex}
              productName={product.name}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Product Info */}
      <div className="order-2 md:order-1 flex flex-col justify-center">
        <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {product.name}
        </h3>
        <p className="mt-3 text-lg text-white/70">
          ${(product.price / 100).toFixed(0)}
        </p>

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
          <p className="mt-3 text-xs min-h-[1.25rem]">
            {isOutOfStock(size) ? (
              <span className="text-red-400">Out of stock</span>
            ) : getStockForSize(size) <= 5 ? (
              <span className="text-yellow-400">
                Only {getStockForSize(size)} left
              </span>
            ) : (
              <span className="invisible">&#8203;</span>
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
              disabled={quantity <= 1}
              className="h-9 w-9 rounded-full border border-white/20 text-white transition hover:border-white/40 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="min-w-[2.5rem] text-center font-medium">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(quantity + 1, selectedStock))}
              disabled={quantity >= selectedStock}
              className="h-9 w-9 rounded-full border border-white/20 text-white transition hover:border-white/40 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart */}
        <div className="mt-8 flex justify-center md:justify-start">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock(size) || quantity > selectedStock}
            className={[
              "inline-flex h-12 w-full max-w-xs items-center justify-center rounded-full transition font-medium",
              isOutOfStock(size) || quantity > selectedStock
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
