import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db, admin } from "@/lib/firebase-admin";
import { log, logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

type OrderItem = {
  product_id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image_url: string | null;
};

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      logError("[webhook] Missing stripe-signature header");
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logError("[webhook] Missing STRIPE_WEBHOOK_SECRET");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      logError("[webhook] Signature verification failed", message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${message}` },
        { status: 400 }
      );
    }
  } catch (err) {
    logError("[webhook] Failed to parse request", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  log(`[webhook] Received event ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionExpired(session);
        break;
      }

      default:
        log(`[webhook] Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    logError(`[webhook] Failed processing event ${event.type}`, err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  log("[webhook] checkout.session.completed");

  const orderId = session.metadata?.order_id;

  if (!orderId) {
    throw new Error("[webhook] Missing order_id in session metadata");
  }

  if (session.payment_status !== "paid") {
    log(`[webhook] Payment not completed for order ${orderId}`);
    return;
  }

  const orderRef = db.collection("orders").doc(orderId);
  const orderDoc = await orderRef.get();

  if (!orderDoc.exists) {
    throw new Error(`[webhook] Order doc not found for ${orderId}`);
  }

  const order = orderDoc.data()!;

  if (order.status === "paid") {
    log(`[webhook] Order ${orderId} already paid, skipping`);
    return;
  }

  const items = order.items as OrderItem[];

  await db.runTransaction(async (tx) => {
    const orderSnap = await tx.get(orderRef);
    const orderData = orderSnap.data();
    if (orderData?.status === "paid") {
      log(`[webhook] Order ${orderId} already paid inside transaction, skipping`);
      return;
    }

    for (const item of items) {
      const variantQuery = db
        .collection("product_variants")
        .where("product_id", "==", item.product_id)
        .where("size", "==", item.size)
        .limit(1);

      const snap = await tx.get(variantQuery);

      if (snap.empty) {
        throw new Error(
          `[webhook] Variant not found: product_id="${item.product_id}" size="${item.size}"`
        );
      }

      const variantDoc = snap.docs[0];
      const currentStock = variantDoc.data().stock ?? 0;
      const newStock = Math.max(0, currentStock - item.quantity);
      tx.update(variantDoc.ref, { stock: newStock });
    }

    tx.update(orderRef, {
      status: "paid",
      paid_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  log(`[webhook] Order ${orderId} marked as paid`);
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;

  if (!orderId) {
    log("[webhook] Missing order_id in expired session metadata");
    return;
  }

  log(`[webhook] Processing expired checkout for order ${orderId}`);

  const orderRef = db.collection("orders").doc(orderId);
  const orderDoc = await orderRef.get();

  if (!orderDoc.exists) {
    log(`[webhook] Order ${orderId} not found`);
    return;
  }

  const order = orderDoc.data()!;

  if (order.status !== "pending") {
    log(`[webhook] Order ${orderId} not pending, skipping`);
    return;
  }

  await orderRef.update({
    status: "failed",
  });

  log(`[webhook] Order ${orderId} marked as failed`);
}
