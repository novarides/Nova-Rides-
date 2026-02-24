import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getStore, setStore, generateId } from "@/lib/store";
import { createPaystackTransaction } from "@/lib/payments";
import { getPaymentConfig } from "@/lib/payments";
import { Transaction } from "@/lib/types";
import { ApiResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth();
    const body = await request.json();
    const { bookingId } = body;
    if (!bookingId) {
      return NextResponse.json({ success: false, error: "bookingId required" }, { status: 400 });
    }

    const config = getPaymentConfig();
    if (!config.paystack) {
      return NextResponse.json({ success: false, error: "Paystack is not configured" }, { status: 503 });
    }

    const store = getStore();
    const booking = store.bookings.find((b) => b.id === bookingId);
    if (!booking || booking.renterId !== user.id) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }
    if (booking.paymentStatus === "paid") {
      return NextResponse.json({ success: false, error: "Booking already paid" }, { status: 400 });
    }

    const amountNaira = booking.totalPrice + booking.securityDeposit;
    const amountKobo = Math.round(amountNaira * 100);
    const reference = `nova_${bookingId}_${generateId().slice(0, 8)}`;
    const callbackUrl = `${config.appUrl}/bookings/${bookingId}/payment?gateway=paystack`;

    const result = await createPaystackTransaction({
      email: user.email,
      amountKobo,
      reference,
      callbackUrl,
      metadata: { bookingId, userId: user.id },
    });

    if ("error" in result) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: { authorizationUrl: result.authorizationUrl, reference: result.reference },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 401 });
  }
}
