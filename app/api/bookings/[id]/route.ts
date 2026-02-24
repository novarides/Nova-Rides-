import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore } from "@/lib/store";
import { requireAuth } from "@/lib/auth";
import { Booking } from "@/lib/types";
import { ApiResponse } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Booking>>> {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const store = getStore();
    const booking = store.bookings.find((b) => b.id === id);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }
    if (booking.renterId !== user.id && booking.hostId !== user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ success: true, data: booking });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 401 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Booking>>> {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const store = getStore();
    const index = store.bookings.findIndex((b) => b.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }
    const booking = store.bookings[index];
    if (booking.renterId !== user.id && booking.hostId !== user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    if (body.status === "rejected" || body.status === "confirmed") {
      if (booking.hostId !== user.id) {
        return NextResponse.json({ success: false, error: "Only host can approve/reject" }, { status: 403 });
      }
    }
    if (body.status === "cancelled") {
      // Both can cancel (policy could restrict)
    }
    const updated: Booking = {
      ...booking,
      ...body,
      id: booking.id,
      updatedAt: new Date().toISOString(),
    };
    store.bookings[index] = updated;
    setStore(store);
    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 401 });
  }
}
