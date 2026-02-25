import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, generateId, persistStore } from "@/lib/store";
import { requireAuth } from "@/lib/auth";
import { Transaction } from "@/lib/types";
import { ApiResponse } from "@/lib/types";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Transaction>>> {
  try {
    const { user } = await requireAuth();
    const body = await request.json();
    const { bookingId, amount, currency = "NGN" } = body;
    if (!bookingId || amount == null) {
      return NextResponse.json({ success: false, error: "bookingId and amount required" }, { status: 400 });
    }
    const store = getStore();
    const booking = store.bookings.find((b) => b.id === bookingId);
    if (!booking || booking.renterId !== user.id) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }
    const tx: Transaction = {
      id: generateId(),
      userId: user.id,
      type: "payment",
      amount: Number(amount),
      currency,
      status: "completed",
      bookingId,
      createdAt: new Date().toISOString(),
    };
    store.transactions.push(tx);
    booking.paymentStatus = "paid";
    const bIndex = store.bookings.findIndex((b) => b.id === bookingId);
    if (bIndex !== -1) store.bookings[bIndex] = { ...booking, updatedAt: new Date().toISOString() };
    setStore(store);
    persistStore();
    return NextResponse.json({ success: true, data: tx });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 401 });
  }
}
