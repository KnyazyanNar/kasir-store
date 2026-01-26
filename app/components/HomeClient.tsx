"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FadeIn } from "./FadeIn";
import { RevealOverlay } from "./RevealOverlay";
import { ProductCard } from "./ProductCard";
import { Toast } from "./Toast";
import type { ProductWithVariants } from "@/lib/types/product";

type HomeClientProps = {
  products: ProductWithVariants[];
};

export function HomeClient({ products }: HomeClientProps) {
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <RevealOverlay>
      <Toast message={toastMessage} isVisible={showToast} />
      <div className="h-screen overflow-y-scroll scroll-smooth bg-black text-white">
        {/* Hero Section - Desktop Only */}
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

        {/* Intro Section */}
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
                    href="#products"
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

        {/* Products Section */}
        <section id="products" className="border-t border-white/10 snap-start">
          <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
            <FadeIn>
              <div className="text-center mb-16">
                <p className="text-sm tracking-[0.32em] text-white/60">
                  THE COLLECTION
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                  Shop All
                </h2>
              </div>

              {products.length > 0 ? (
                <div className="space-y-24">
                  {products.map((product) => (
                    <div key={product.id} className="border-b border-white/5 pb-24 last:border-0 last:pb-0">
                      <ProductCard product={product} onToast={handleToast} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-white/50">No products available at the moment.</p>
                  <p className="text-white/30 mt-2 text-sm">Check back soon!</p>
                </div>
              )}

              {/* Cart Link */}
              {products.length > 0 && (
                <div className="mt-16 text-center">
                  <Link
                    href="/cart"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-8 text-sm font-medium tracking-wide text-white transition hover:border-white/40"
                  >
                    View Cart
                  </Link>
                </div>
              )}
            </FadeIn>
          </div>
        </section>

        {/* About Section */}
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

        {/* Size Guide Section */}
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
                Fit varies by preference. If you&apos;re between sizes, size up.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Footer fade gradient */}
        <div className="h-32 w-full bg-gradient-to-b from-transparent to-black" />

        {/* Footer */}
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
                <a className="transition-colors hover:text-white" href="#">
                  Email
                </a>
                <p className="mt-4 text-xs tracking-wide text-white/30">
                  &copy; 2026 KASIR. All rights reserved.
                </p>
              </div>
            </FadeIn>
          </div>
        </footer>
      </div>
    </RevealOverlay>
  );
}
