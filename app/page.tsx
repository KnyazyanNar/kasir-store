/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import Link from "next/link";
import { FadeIn } from "./components/FadeIn";
import { RevealOverlay } from "./components/RevealOverlay";
import { Toast } from "./components/Toast";
import { useCart } from "./contexts/CartContext";

export default function Home() {
  const sizes = useMemo(() => ["S", "M", "L", "XL"] as const, []);
  const [size, setSize] = useState<(typeof sizes)[number]>("M");
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const { addItem } = useCart();
  
  // Product images gallery
  const productImages = useMemo(
    () => [
      "/shirt-front.png",
      "/shirt-back.png",
      "/shirt-quality.png", // Will be replaced with shirt-detail-1.png when available
      "/shirt-print.png", // Will be replaced with shirt-detail-2.png when available
    ],
    []
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  return (
    <>
      <Toast message={toastMessage} isVisible={showToast} />
      <RevealOverlay>
        <div className="h-screen overflow-y-scroll scroll-smooth bg-black text-white">
        <section className="relative hidden h-screen w-full overflow-hidden md:block snap-start">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
        <Image
            src="/hero.png"
            alt="KASIR sunset artwork"
            fill
          priority
            className="object-cover"
            quality={90}
          />
          
          {/* Gradient mask - fade to black on left, right, and bottom */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, transparent 15%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.9) 100%), linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.7) 100%)",
            }}
          />
          
          {/* Dark overlay for cinematic mood */}
          <div className="absolute inset-0 bg-black/30" />
        </div>
      </section>

      {/* NEW SECTION */}
      <section className="relative min-h-screen bg-black snap-start">
        <div className="mx-auto max-w-6xl px-6 pt-20 pb-20 md:px-10 md:pt-28 md:pb-28">
          <FadeIn className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
            {/* Left side - Text content */}
            <div className="flex flex-col justify-center">
              <p className="text-sm tracking-[0.32em] text-white/60">
                PREMIUM STREETWEAR
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                KASIR
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-white/70 md:text-xl">
                Not just clothing. Identity.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#product"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-medium tracking-wide text-black transition hover:bg-white/90"
                >
                  SHOP THE DROP
                </a>
                <a
                  href="#about"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-7 text-sm font-medium tracking-wide text-white transition hover:border-white/40"
                >
                  ABOUT
                </a>
              </div>
            </div>

            {/* Right side - Video container */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
              {/* Dark gradient overlay on edges */}
              <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)",
                }}
              />
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src="/hero-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* PRODUCT */}
      <section id="product" className="border-t border-white/10 snap-start">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <FadeIn className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
            <div className="order-2 md:order-1">
              <p className="text-sm tracking-[0.32em] text-white/60">
                THE DROP
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                KASIR Gothic Tee
              </h2>
              <p className="mt-4 text-lg text-white/70">$49</p>

              <div className="mt-10">
                <p className="text-sm tracking-wide text-white/60">SIZE</p>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {sizes.map((s) => {
                    const selected = s === size;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={[
                          "h-11 rounded-full border text-sm transition",
                          selected
                            ? "border-white bg-white text-black"
                            : "border-white/20 text-white hover:border-white/40",
                        ].join(" ")}
                        aria-pressed={selected}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-sm text-white/50">
                  Selected size: <span className="text-white/80">{size}</span>
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
                  onClick={() => {
                    addItem({
                      id: "kasir-gothic-tee",
                      name: "KASIR Gothic Tee",
                      price: 4900,
                      size,
                      quantity,
                      image: productImages[0],
                    });
                    setToastMessage(
                      `Added to cart: Size ${size} × ${quantity}`
                    );
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 2500);
                  }}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white text-black transition hover:bg-white/90"
                >
                  Add to Cart
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
                  boxShadow: "inset 0 0 60px rgba(0, 0, 0, 0.4), inset 0 0 120px rgba(0, 0, 0, 0.2)",
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
                      background: "radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 60%)",
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
                        alt="KASIR Gothic Tee preview"
                        width={900}
                        height={900}
                        className="h-full w-full object-contain relative z-10"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              
              {/* Thumbnail Gallery */}
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
                        alt={`KASIR Gothic Tee view ${index + 1}`}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="border-t border-white/10 snap-start">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <FadeIn className="mx-auto max-w-3xl text-center">
            <p className="text-sm tracking-[0.32em] text-white/60">ABOUT</p>
            <p className="mt-8 text-2xl font-medium leading-relaxed tracking-tight text-white/90 md:text-3xl">
              KASIR is built on identity, presence and silence.
              <br />
              No noise. No trends. Just statement.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* SIZE GUIDE */}
      <section id="size-guide" className="border-t border-white/10 snap-start">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <FadeIn className="mx-auto max-w-4xl">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-sm tracking-[0.32em] text-white/60">
                  SIZE GUIDE
                </p>
                <h3 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  Tee Measurements
                </h3>
              </div>
              <p className="hidden text-sm text-white/50 md:block">
                Inches / approximate
              </p>
            </div>

            <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
              <div className="grid grid-cols-4 bg-white/[0.03] text-sm text-white/70">
                <div className="px-5 py-4 font-medium text-white/80">Size</div>
                <div className="px-5 py-4">Chest</div>
                <div className="px-5 py-4">Length</div>
                <div className="px-5 py-4">Sleeve</div>
              </div>

              {[
                { s: "S", chest: "20", length: "27", sleeve: "8" },
                { s: "M", chest: "21.5", length: "28", sleeve: "8.5" },
                { s: "L", chest: "23", length: "29", sleeve: "9" },
                { s: "XL", chest: "24.5", length: "30", sleeve: "9.5" },
              ].map((row, idx) => (
                <div
                  key={row.s}
                  className={[
                    "grid grid-cols-4 text-sm",
                    idx % 2 === 0 ? "bg-black" : "bg-white/[0.015]",
                  ].join(" ")}
                >
                  <div className="px-5 py-4 font-medium text-white/90">
                    {row.s}
                  </div>
                  <div className="px-5 py-4 text-white/70">{row.chest}</div>
                  <div className="px-5 py-4 text-white/70">{row.length}</div>
                  <div className="px-5 py-4 text-white/70">{row.sleeve}</div>
                </div>
              ))}
            </div>

            <p className="mt-5 text-xs text-white/40">
              Fit varies by preference. If you’re between sizes, size up.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Footer fade gradient */}
      <div className="h-32 w-full bg-gradient-to-b from-transparent to-black" />

      {/* FOOTER */}
      <footer>
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <FadeIn className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
            <div>
              <p className="text-xl font-semibold tracking-[0.2em] text-white/90 md:text-2xl">
                KASIR
              </p>
              <p className="mt-3 text-sm text-white/40">
                Not just clothing. Identity.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-white/60 md:items-end">
              <a
                className="transition-colors hover:text-white"
                href="https://www.instagram.com/kasir_official?igsh=NTc4MTIwNjQ2YQ%3D%3D&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
          >
                Instagram
          </a>
          <a
                className="transition-colors hover:text-white"
                href="#"
              >
                Email
              </a>
              <p className="mt-4 text-xs tracking-wide text-white/30">
                © 2026 KASIR. All rights reserved.
              </p>
            </div>
          </FadeIn>
        </div>
      </footer>
    </div>
      </RevealOverlay>
    </>
  );
}
