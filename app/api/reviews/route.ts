import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, generateId } from "@/lib/store";
import { requireAuth } from "@/lib/auth";
import { Review } from "@/lib/types";
import { ApiResponse } from "@/lib/types";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Review[]>>> {
  const { searchParams } = new URL(request.url);
  const vehicleId = searchParams.get("vehicleId");
  const userId = searchParams.get("userId");
  const store = getStore();
  let list = store.reviews;
  if (vehicleId) {
    const bookingIds = store.bookings.filter((b) => b.vehicleId === vehicleId).map((b) => b.id);
    list = list.filter((r) => bookingIds.includes(r.bookingId));
  }
  if (userId) list = list.filter((r) => r.revieweeId === userId);
  return NextResponse.json({ success: true, data: list });
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Review>>> {
  try {
    const { user } = await requireAuth();
    const body = await request.json();
    const { bookingId, revieweeId, rating, comment } = body;
    if (!bookingId || !revieweeId || rating == null) {
      return NextResponse.json(
        { success: false, error: "bookingId, revieweeId, rating required" },
        { status: 400 }
      );
    }
    const store = getStore();
    const booking = store.bookings.find((b) => b.id === bookingId);
    if (!booking || booking.status !== "completed") {
      return NextResponse.json({ success: false, error: "Booking not found or not completed" }, { status: 400 });
    }
    if (booking.renterId !== user.id && booking.hostId !== user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const reviewee = revieweeId === booking.hostId ? booking.hostId : booking.renterId;
    if (reviewee !== revieweeId) {
      return NextResponse.json({ success: false, error: "Invalid reviewee" }, { status: 400 });
    }
    const review: Review = {
      id: generateId(),
      bookingId,
      reviewerId: user.id,
      revieweeId,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment: comment || "",
      createdAt: new Date().toISOString(),
    };
    store.reviews.push(review);
    setStore(store);
    return NextResponse.json({ success: true, data: review });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 401 });
  }
}
