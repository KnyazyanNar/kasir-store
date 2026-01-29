import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db, admin } from "@/lib/firebase-admin";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBaseUrl(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.startsWith("http")) return envUrl.replace(/\/+$/, "");

  const origin = req.headers.get("origin");
  if (origin && origin.startsWith("http")) return origin.replace(/\/+$/, "");

  return "http://localhost:3000";
}

type CartItemInput = {
  product_id: string;
  size: string;
  quantity: number;
};

type OrderItem = {
  product_id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  image_url: string | null;
};

export async function POST(req: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { items }: { items: CartItemInput[] } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Validate input structure
    for (const item of items) {
      if (!item.product_id || !item.size || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: "Invalid cart item structure" },
          { status: 400 }
        );
      }
    }

    // Fetch products from Firestore
    const productIds = [...new Set(items.map((item) => item.product_id))];
    const productSnapshots = await Promise.all(
      productIds.map((id) => db.collection("products").doc(id).get())
    );

    // Build product map
    const productMap = new Map<string, {
      id: string;
      name: string;
      price: number;
      images: string[];
      is_active: boolean;
    }>();

    for (const doc of productSnapshots) {
      if (doc.exists) {
        const data = doc.data()!;
        productMap.set(doc.id, {
          id: doc.id,
          name: data.name,
          price: data.price,
          images: data.images || [],
          is_active: data.is_active,
        });
      }
    }

    // Verify all products exist and are active
    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.product_id}` },
          { status: 400 }
        );
      }
      if (!product.is_active) {
        return NextResponse.json(
          { error: `Product is not available: ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Fetch variants and check stock availability
    for (const item of items) {
      const variantSnap = await db
        .collection("product_variants")
        .where("product_id", "==", item.product_id)
        .where("size", "==", item.size)
        .limit(1)
        .get();

      if (variantSnap.empty) {
        return NextResponse.json(
          { error: `Size ${item.size} not available for this product` },
          { status: 400 }
        );
      }

      const variant = variantSnap.docs[0].data();
      if (variant.stock < item.quantity) {
        const product = productMap.get(item.product_id);
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product?.name} (${item.size}). Available: ${variant.stock}`,
          },
          { status: 400 }
        );
      }
    }

    // Build order items with server-side prices
    const orderItems: OrderItem[] = items.map((item) => {
      const product = productMap.get(item.product_id)!;
      return {
        product_id: item.product_id,
        name: product.name,
        size: item.size,
        quantity: item.quantity,
        price: product.price,
        image_url: product.images.length > 0 ? product.images[0] : null,
      };
    });

    // Calculate total on server
    const total_amount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create pending order BEFORE Stripe session
    const orderRef = await db.collection("orders").add({
      stripe_session_id: "pending",
      status: "pending",
      total_amount,
      currency: "usd",
      items: orderItems,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create Stripe instance
    const stripe = new Stripe(secretKey, {
      apiVersion: "2025-12-15.clover",
    });

    const baseUrl = getBaseUrl(req);

    // Create Stripe Checkout session with order_id in metadata
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      metadata: {
        order_id: orderRef.id,
      },
      line_items: orderItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: item.price,
          product_data: {
            name: `${item.name} (Size: ${item.size})`,
            ...(item.image_url && { images: [item.image_url] }),
          },
        },
      })),
    });

    // Update order with actual Stripe session ID
    await db.collection("orders").doc(orderRef.id).update({
      stripe_session_id: session.id,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe session URL not returned" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    logError("[checkout] Failed to create Stripe session", err);
    const message = err instanceof Error ? err.message : "Checkout error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
