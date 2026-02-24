import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, generateId } from "@/lib/store";
import { verifyStripeSession } from "@/lib/payments";
import { Transaction } from "@/lib/types";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ success: false, error: "session_id required" }, { status: 400 });
  }

  const result = await verifyStripeSession(sessionId);
  if (!result.paid || !result.bookingId) {
    return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 400 });
  }

  const store = getStore();
  const booking = store.bookings.find((b) => b.id === result.bookingId);
  if (!booking) {
    return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
  }

  booking.paymentStatus = "paid";
  booking.updatedAt = new Date().toISOString();
  const bIndex = store.bookings.findIndex((b) => b.id === result.bookingId);
  if (bIndex !== -1) store.bookings[bIndex] = booking;

  const tx = {
    id: generateId(),
    userId: booking.renterId,
    type: "payment" as const,
    amount: booking.totalPrice + booking.securityDeposit,
    currency: "USD",
    status: "completed" as const,
    bookingId: booking.id,
    createdAt: new Date().toISOString(),
    metadata: { gateway: "stripe", sessionId },
  };
  store.transactions.push(tx);
  setStore(store);

  return NextResponse.json({ success: true, data: { bookingId: result.bookingId, paid: true } });
}
