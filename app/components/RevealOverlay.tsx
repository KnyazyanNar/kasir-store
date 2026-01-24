"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

type RevealOverlayProps = {
  children: React.ReactNode;
};

const GESTURE_END_DELAY = 120; // ms
const OPEN_THRESHOLD = 0.4; // 40% of screen height

const INTRO_SEEN_KEY = "kasir_intro_seen";

export function RevealOverlay({ children }: RevealOverlayProps) {
  // Start with false to match server-side rendering
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const gestureEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const windowHeightRef = useRef(0);

  // Check sessionStorage after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      const introSeen = sessionStorage.getItem(INTRO_SEEN_KEY) === "true";
      if (introSeen) {
        setIsRevealed(true);
      }
    }
  }, []);

  // Motion values for smooth gesture tracking
  const dragOffset = useMotionValue(0);
  const springOffset = useSpring(dragOffset, {
    stiffness: 550,
    damping: 30,
    mass: 0.35,
  });

  // Calculate progress (0 = closed, 1 = fully open)
  const progress = useTransform(springOffset, (value) => {
    if (windowHeightRef.current === 0) return 0;
    return Math.max(0, Math.min(1, -value / windowHeightRef.current));
  });

  // Dynamic blur based on drag progress
  const blurAmount = useTransform(progress, [0, 1], [12, 0]);
  const blurString = useTransform(blurAmount, (b) => `blur(${b}px)`);
  
  // Content opacity based on progress
  const contentOpacity = useTransform(progress, [0, 0.3], [1, 0]);

  // Function to scroll container to top (called BEFORE revealing content)
  const scrollContainerToTop = useCallback(() => {
    const container = document.querySelector('.h-screen') as HTMLElement;
    if (container) {
      // Set scrollTop directly for immediate, invisible scroll
      container.scrollTop = 0;
    }
  }, []);

  // Update window height on mount and resize
  useEffect(() => {
    windowHeightRef.current = window.innerHeight;
    const handleResize = () => {
      windowHeightRef.current = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Block page scroll while overlay is visible
  useEffect(() => {
    if (!isRevealed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // Container should already be scrolled to top (done BEFORE isRevealed was set)
      // Just ensure window is at top
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isRevealed]);

  // Handle gesture end detection
  const handleGestureEnd = useCallback(() => {
    if (gestureEndTimeoutRef.current) {
      clearTimeout(gestureEndTimeoutRef.current);
    }

    gestureEndTimeoutRef.current = setTimeout(() => {
      setIsDragging(false);
      const currentOffset = dragOffset.get();
      const threshold = -windowHeightRef.current * OPEN_THRESHOLD;

      if (currentOffset <= threshold) {
        // Scroll container to top BEFORE opening (while overlay still visible)
        scrollContainerToTop();
        // Open: animate to fully closed position with spring
        dragOffset.set(-windowHeightRef.current);
        // Wait for spring animation to complete (~400ms for spring)
        setTimeout(() => {
          setIsRevealed(true);
          if (typeof window !== "undefined") {
            sessionStorage.setItem(INTRO_SEEN_KEY, "true");
          }
        }, 400);
      } else {
        // Close: animate back to start with spring
        dragOffset.set(0);
      }
    }, GESTURE_END_DELAY);
  }, [dragOffset]);

  // Handle wheel events for gesture tracking
  useEffect(() => {
    if (isRevealed) return;

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      setIsDragging(true);

      // Accumulate drag offset (negative = up, positive = down)
      const currentOffset = dragOffset.get();
      const newOffset = Math.min(0, currentOffset - e.deltaY * 0.85);
      dragOffset.set(newOffset);

      // Reset gesture end timer
      handleGestureEnd();
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (gestureEndTimeoutRef.current) {
        clearTimeout(gestureEndTimeoutRef.current);
      }
    };
  }, [isRevealed, dragOffset, handleGestureEnd]);

  // Handle Escape key to toggle
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (isRevealed) {
          setIsRevealed(false);
          dragOffset.set(0);
        } else {
          // Scroll container to top BEFORE opening (while overlay still visible)
          scrollContainerToTop();
          setIsRevealed(true);
          if (typeof window !== "undefined") {
            sessionStorage.setItem(INTRO_SEEN_KEY, "true");
          }
        }
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isRevealed, dragOffset, scrollContainerToTop]);

  // Handle Enter button - spring open
  const handleEnter = useCallback(() => {
    // Scroll container to top BEFORE opening (while overlay still visible)
    scrollContainerToTop();
    dragOffset.set(-windowHeightRef.current);
    // Wait for spring animation to complete
    setTimeout(() => {
      setIsRevealed(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(INTRO_SEEN_KEY, "true");
      }
    }, 400);
  }, [dragOffset, scrollContainerToTop]);


  return (
    <>
      <AnimatePresence>
        {!isRevealed && (
          <motion.div
            style={{
              y: springOffset,
              backdropFilter: blurString,
            }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
          >
            {/* Subtle gradient/noise overlay */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)`,
              }}
            />

            {/* Content */}
            <motion.div
              style={{
                opacity: contentOpacity,
              }}
              className="relative z-10 flex flex-col items-center gap-6 text-center"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                className="text-7xl font-semibold tracking-tight md:text-8xl lg:text-9xl"
              >
                KASIR
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                className="text-sm tracking-[0.32em] text-white/60 md:text-base"
              >
                Scroll to enter
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
                onClick={handleEnter}
                className="mt-4 inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/5 px-8 text-sm font-medium tracking-wide text-white transition hover:border-white/50 hover:bg-white/10"
              >
                Enter
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Контент сайта с анимацией появления */}
      <motion.div
        initial={false}
        animate={{
          opacity: isRevealed ? 1 : 0,
          y: isRevealed ? 0 : 20,
        }}
        transition={{
          duration: 5,
          ease: [0.22, 1, 0.36, 1],
          delay: isRevealed ? 0.1 : 0,
        }}
        style={{ pointerEvents: isRevealed ? "auto" : "none" }}
      >
        {children}
      </motion.div>
    </>
  );
}
