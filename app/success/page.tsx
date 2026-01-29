import Link from "next/link";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { ClearCart } from "./ClearCart";
import { logError } from "@/lib/logger";

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  // No session_id means direct access without completing checkout
  if (!session_id) {
    redirect("/");
  }

  // Verify payment with Stripe server-side
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    logError("[checkout] Missing STRIPE_SECRET_KEY");
    redirect("/");
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: "2025-12-15.clover",
  });

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id);
  } catch (err) {
    logError("[checkout] Failed to retrieve Stripe session", err);
    redirect("/");
  }

  // Verify payment was successful
  if (session.payment_status !== "paid") {
    redirect("/cart?error=payment_incomplete");
  }

  // Get order ID from metadata for display
  const orderId = session.metadata?.order_id;

  return (
    <main className="min-h-screen bg-black text-white">
      <ClearCart sessionId={session_id} />
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
          <svg
            className="h-8 w-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-sm tracking-[0.32em] text-white/60">
          ORDER CONFIRMED
        </p>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
          Thank you for your order
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl">
          Your KASIR piece is on the way. You will receive an email confirmation
          shortly.
        </p>
        {orderId && (
          <p className="mt-4 text-sm text-white/50">
            Order ID: {orderId.slice(0, 8)}...
          </p>
        )}
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-7 text-sm font-medium tracking-wide text-white transition hover:border-white/40"
          >
            Back to store
          </Link>
        </div>
      </div>
    </main>
  );
}
