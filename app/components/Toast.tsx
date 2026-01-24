"use client";

import { motion, AnimatePresence } from "framer-motion";

type ToastProps = {
  message: string;
  isVisible: boolean;
};

export function Toast({ message, isVisible }: ToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/20 bg-black/90 px-6 py-3 text-sm text-white backdrop-blur-sm"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
