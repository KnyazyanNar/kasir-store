"use client";

import { useState } from "react";

type BuyButtonProps = {
  className?: string;
  label?: string;
};

export function BuyButton({ className, label = "Buy Now" }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/checkout", { method: "POST" });
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
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={
          className ??
          "inline-flex h-12 w-full items-center justify-center rounded-full border border-white/20 bg-white text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {loading ? "Redirecting…" : label}
      </button>
      {error ? (
        <p className="mt-3 text-sm text-white/70">Error: {error}</p>
      ) : null}
    </div>
  );
}

