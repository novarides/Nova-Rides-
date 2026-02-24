import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, generateId } from "@/lib/store";
import { requireRole } from "@/lib/auth";
import { Vehicle } from "@/lib/types";
import { ApiResponse } from "@/lib/types";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Vehicle[]>>> {
  const store = getStore();
  const { searchParams } = new URL(request.url);
  const hostId = searchParams.get("hostId");
  const status = searchParams.get("status") || "active";
  let list = store.vehicles.filter((v) => (status ? v.status === status : true));
  if (hostId) list = list.filter((v) => v.hostId === hostId);
  return NextResponse.json({ success: true, data: list });
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Vehicle>>> {
  try {
    const { user } = await requireRole(["host", "admin"]);
    const body = await request.json();
    const store = getStore();
    const vehicle: Vehicle = {
      id: generateId(),
      hostId: user.id,
      title: body.title,
      description: body.description || "",
      year: body.year,
      make: body.make,
      model: body.model,
      mileage: body.mileage ?? 0,
      vehicleClass: body.vehicleClass || "midsize",
      pricePerDay: body.pricePerDay,
      pricePerWeek: body.pricePerWeek,
      currency: body.currency || "NGN",
      images: Array.isArray(body.images) ? body.images : [],
      location: body.location,
      availability: Array.isArray(body.availability) ? body.availability : [],
      minRentalDays: body.minRentalDays ?? 1,
      bookingType: body.bookingType || "approval",
      featured: body.featured ?? false,
      promoted: body.promoted ?? false,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.vehicles.push(vehicle);
    setStore(store);
    return NextResponse.json({ success: true, data: vehicle });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
