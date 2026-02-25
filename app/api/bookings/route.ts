import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, generateId, persistStore } from "@/lib/store";
import { requireAuth } from "@/lib/auth";
import { Booking } from "@/lib/types";
import { ApiResponse } from "@/lib/types";
import { differenceInDays, parseISO } from "date-fns";

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

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Booking[] | (Booking & { renterSummary?: ReturnType<typeof getRenterSummary>; hasHostReviewedGuest?: boolean })[]>>> {
  try {
    const { user } = await requireAuth();
    const { searchParams } = new URL(request.url);
    const as = searchParams.get("as"); // "renter" | "host"
    const store = getStore();
    let list = store.bookings.filter(
      (b) => (as === "host" ? b.hostId === user.id : as === "renter" ? b.renterId === user.id : (b.renterId === user.id || b.hostId === user.id))
    );
    if (as === "host") {
      list = list.map((b) => {
        const renterSummary = getRenterSummary(store, b.renterId);
        const hasHostReviewedGuest = store.reviews.some((r) => r.bookingId === b.id && r.reviewerId === b.hostId);
        const vehicle = store.vehicles.find((v) => v.id === b.vehicleId);
        return { ...b, renterSummary, hasHostReviewedGuest, vehicleTitle: vehicle?.title };
      }) as (Booking & { renterSummary?: ReturnType<typeof getRenterSummary>; hasHostReviewedGuest?: boolean; vehicleTitle?: string })[];
    }
    return NextResponse.json({ success: true, data: list });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 401 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Booking>>> {
  try {
    const { user } = await requireAuth();
    const store = getStore();
    const fullUser = store.users.find((u) => u.id === user.id);
    const licenceValid = fullUser?.licenseVerified && fullUser?.licenseExpiryDate && new Date(fullUser.licenseExpiryDate) > new Date();
    if (!licenceValid) {
      return NextResponse.json(
        {
          success: false,
          error: fullUser?.licenseExpiryDate && new Date(fullUser.licenseExpiryDate) <= new Date()
            ? "Your driver's licence has expired. Upload a new one in Profile to book again."
            : "Please upload and verify your driver's licence (front, back, and expiry date) in Profile before booking.",
        },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { vehicleId, startDate, endDate } = body;
    if (!vehicleId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "vehicleId, startDate, endDate required" },
        { status: 400 }
      );
    }
    const vehicle = store.vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) {
      return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 });
    }
    if (vehicle.hostId === user.id) {
      return NextResponse.json({ success: false, error: "Cannot book your own vehicle" }, { status: 400 });
    }
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const days = differenceInDays(end, start) || 1;
    if (days < vehicle.minRentalDays) {
      return NextResponse.json(
        { success: false, error: `Minimum rental is ${vehicle.minRentalDays} days` },
        { status: 400 }
      );
    }
    const totalPrice = days * vehicle.pricePerDay;
    const securityDeposit = Math.round(vehicle.pricePerDay * 0.5);
    const status = vehicle.bookingType === "instant" ? "confirmed" : "pending";
    const booking: Booking = {
      id: generateId(),
      vehicleId,
      renterId: user.id,
      hostId: vehicle.hostId,
      startDate,
      endDate,
      totalPrice,
      securityDeposit,
      status,
      paymentStatus: status === "confirmed" ? "pending" : "pending",
      bookingType: vehicle.bookingType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.bookings.push(booking);
    setStore(store);
    persistStore();
    return NextResponse.json({ success: true, data: booking });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 401 });
  }
}
