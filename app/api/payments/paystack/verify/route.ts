import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, generateId } from "@/lib/store";
import { verifyPaystackTransaction } from "@/lib/payments";
import { Transaction } from "@/lib/types";
import { ApiResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ success: false, error: "reference required" }, { status: 400 });
  }

  const result = await verifyPaystackTransaction(reference);
  if (!result.success) {
    return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 400 });
  }

  const store = getStore();
  const bookingId = reference.startsWith("nova_") ? reference.split("_")[1] : null;
  if (!bookingId) {
    return NextResponse.json({ success: false, error: "Invalid reference" }, { status: 400 });
  }

  const booking = store.bookings.find((b) => b.id === bookingId);
  if (!booking) {
    return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
  }

  booking.paymentStatus = "paid";
  booking.updatedAt = new Date().toISOString();
  const bIndex = store.bookings.findIndex((b) => b.id === bookingId);
  if (bIndex !== -1) store.bookings[bIndex] = booking;

  const tx: Transaction = {
    id: generateId(),
    userId: booking.renterId,
    type: "payment",
    amount: (result.amount ?? 0) / 100,
    currency: "NGN",
    status: "completed",
    bookingId,
    createdAt: new Date().toISOString(),
    metadata: { gateway: "paystack", reference },
  };
  store.transactions.push(tx);
  setStore(store);

  return NextResponse.json({ success: true, data: { bookingId, paid: true } });
}
