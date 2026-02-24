/**
 * Nova Rides – Payment integration
 * Paystack: Nigeria (NGN). Stripe: International (USD, EUR, etc.)
 */

const PAYSTACK_BASE = "https://api.paystack.co";

export interface PaymentConfig {
  paystack: boolean;
  stripe: boolean;
  appUrl: string;
}

export function getPaymentConfig(): PaymentConfig {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    paystack: Boolean(process.env.PAYSTACK_SECRET_KEY),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    appUrl,
  };
}

// ——— Paystack (Nigeria, NGN) ———
// Amount in kobo (100 NGN = 10000 kobo)
export interface PaystackInitializeParams {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, string>;
}

export async function createPaystackTransaction(
  params: PaystackInitializeParams
): Promise<{ authorizationUrl: string; reference: string } | { error: string }> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return { error: "Paystack not configured" };

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata || {},
    }),
  });

  const data = await res.json();
  if (!data.status || !data.data?.authorization_url) {
    return { error: data.message || "Paystack initialization failed" };
  }
  return {
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
  };
}

export async function verifyPaystackTransaction(
  reference: string
): Promise<{ success: boolean; amount?: number }> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return { success: false };

  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const data = await res.json();
  if (!data.status || data.data?.status !== "success") return { success: false };
  return { success: true, amount: data.data?.amount };
}

// ——— Stripe (International, USD/EUR/etc) ———
// Amount in smallest unit (cents for USD)
export interface StripeCreateSessionParams {
  amountTotal: number; // in cents
  currency: string;
  successUrl: string;
  cancelUrl: string;
  bookingId: string;
  description: string;
  customerEmail?: string;
}

export async function createStripeCheckoutSession(
  params: StripeCreateSessionParams
): Promise<{ url: string; sessionId: string } | { error: string }> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return { error: "Stripe not configured" };

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secret);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: params.currency.toLowerCase(),
          unit_amount: params.amountTotal,
          product_data: {
            name: "Nova Rides – " + params.description,
            description: `Booking ${params.bookingId}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    metadata: { bookingId: params.bookingId },
    client_reference_id: params.bookingId,
  });

  if (!session.url) return { error: "Stripe session has no URL" };
  return { url: session.url, sessionId: session.id };
}

export async function verifyStripeSession(sessionId: string): Promise<{ paid: boolean; bookingId?: string }> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return { paid: false };

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secret);

  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });
  const paid = session.payment_status === "paid";
  const bookingId = session.metadata?.bookingId || session.client_reference_id || undefined;
  return { paid, bookingId };
}
