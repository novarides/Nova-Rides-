import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, persistStore } from "@/lib/store";
import { requireAuth } from "@/lib/auth";
import { Booking } from "@/lib/types";
import { ApiResponse } from "@/lib/types";

function getRenterSummary(store: ReturnType<typeof getStore>, renterId: string) {
  const renter = store.users.find((u) => u.id === renterId);
  if (!renter) return undefined;
  const reviewsAboutRenter = store.reviews.filter((r) => r.revieweeId === renterId);
  const reviewCount = reviewsAboutRenter.length;
  const rating = reviewCount > 0
    ? reviewsAboutRenter.reduce((s, r) => s + r.rating, 0) / reviewCount
    : 0;
  return {
    id: renter.id,
    firstName: renter.firstName,
    lastName: renter.lastName,
    rating: Math.round(rating * 10) / 10,
    reviewCount,
  };
}

function getHostSummary(store: ReturnType<typeof getStore>, hostId: string) {
  const host = store.users.find((u) => u.id === hostId);
  if (!host) return undefined;
  const reviewsAboutHost = store.reviews.filter((r) => r.revieweeId === hostId);
  const reviewCount = reviewsAboutHost.length;
  const rating = reviewCount > 0
    ? reviewsAboutHost.reduce((s, r) => s + r.rating, 0) / reviewCount
    : 0;
  return {
    id: host.id,
    firstName: host.firstName,
    lastName: host.lastName,
    rating: Math.round(rating * 10) / 10,
    reviewCount,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Booking & { renterSummary?: ReturnType<typeof getRenterSummary>; hasHostReviewedGuest?: boolean; reviewsAboutRenter?: { rating: number; comment: string; createdAt: string }[]; hostSummary?: ReturnType<typeof getHostSummary>; hasRenterReviewedHost?: boolean }>>> {
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
    let data: Booking & { renterSummary?: ReturnType<typeof getRenterSummary>; hasHostReviewedGuest?: boolean; reviewsAboutRenter?: { rating: number; comment: string; createdAt: string }[]; hostSummary?: ReturnType<typeof getHostSummary>; hasRenterReviewedHost?: boolean } = { ...booking };
    if (booking.hostId === user.id) {
      data.renterSummary = getRenterSummary(store, booking.renterId);
      data.hasHostReviewedGuest = store.reviews.some((r) => r.bookingId === booking.id && r.reviewerId === booking.hostId);
      data.reviewsAboutRenter = store.reviews
        .filter((r) => r.revieweeId === booking.renterId)
        .map((r) => ({ rating: r.rating, comment: r.comment, createdAt: r.createdAt }));
    }
    if (booking.renterId === user.id) {
      data.hostSummary = getHostSummary(store, booking.hostId);
      data.hasRenterReviewedHost = store.reviews.some((r) => r.bookingId === booking.id && r.reviewerId === booking.renterId);
    }
    return NextResponse.json({ success: true, data });
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
    persistStore();
    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 401 });
  }
}
