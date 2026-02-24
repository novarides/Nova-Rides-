import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { createStripeCheckoutSession, getPaymentConfig } from "@/lib/payments";

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth();
    const body = await request.json();
    const { bookingId } = body;
    if (!bookingId) {
      return NextResponse.json({ success: false, error: "bookingId required" }, { status: 400 });
    }

    const config = getPaymentConfig();
    if (!config.stripe) {
      return NextResponse.json({ success: false, error: "Stripe is not configured" }, { status: 503 });
    }

    const store = getStore();
    const booking = store.bookings.find((b) => b.id === bookingId);
    if (!booking || booking.renterId !== user.id) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }
    if (booking.paymentStatus === "paid") {
      return NextResponse.json({ success: false, error: "Booking already paid" }, { status: 400 });
    }

    const amountTotalNgn = booking.totalPrice + booking.securityDeposit;
    const vehicle = store.vehicles.find((v) => v.id === booking.vehicleId);
    const description = vehicle?.title || "Car rental";
    const currency = (body.currency || "usd").toLowerCase();
    const ngnToUsd = Number(process.env.NGN_TO_USD_RATE) || 0.0006;
    const amountUsdCents = Math.max(50, Math.round((amountTotalNgn * ngnToUsd) * 100));

    const successUrl = `${config.appUrl}/bookings/${bookingId}/payment?gateway=stripe&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${config.appUrl}/bookings/${bookingId}`;

    const result = await createStripeCheckoutSession({
      amountTotal: amountUsdCents,
      currency: "usd",
      successUrl,
      cancelUrl,
      bookingId,
      description,
      customerEmail: user.email,
    });

    if ("error" in result) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: { url: result.url, sessionId: result.sessionId },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 401 });
  }
}
