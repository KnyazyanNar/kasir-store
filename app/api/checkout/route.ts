import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBaseUrl(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.startsWith("http")) return envUrl.replace(/\/+$/, "");

  const origin = req.headers.get("origin");
  if (origin && origin.startsWith("http")) return origin.replace(/\/+$/, "");

  return "http://localhost:3000";
}

type CartItem = {
  id: string;
  name: string;
  price: number; // in cents
  size: string;
  quantity: number;
  image: string;
};

export async function POST(req: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY" },
        { status: 500 },
      );
    }

    const body = await req.json();
    const { items }: { items: CartItem[] } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 },
      );
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2025-12-15.clover",
    });

    const baseUrl = getBaseUrl(req);

    // Create line items from cart
    const lineItems = items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: item.price,
        product_data: {
          name: `${item.name} (Size: ${item.size})`,
          metadata: {
            productId: item.id,
            size: item.size,
            quantity: item.quantity.toString(),
          },
        },
      },
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cart`,
      line_items: lineItems,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe session URL not returned" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

