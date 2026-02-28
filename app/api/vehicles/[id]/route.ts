import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, persistStore } from "@/lib/store";
import { getSession, requireAuth, requireRole } from "@/lib/auth";
import { Vehicle } from "@/lib/types";
import { ApiResponse } from "@/lib/types";

/** Vehicle without fields that are private to host/backend or until booking confirmed. */
function sanitizeVehicleForRenter(
  vehicle: Vehicle,
  allowLicenseAndVin: boolean
): Vehicle {
  const { roadworthinessDocUrl, licensePlate, vin, ...rest } = vehicle;
  return {
    ...rest,
    ...(allowLicenseAndVin ? { licensePlate, vin } : {}),
    // roadworthinessDocUrl never exposed to renters
  } as Vehicle;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Vehicle>>> {
  const { id } = await params;
  const store = getStore();
  const vehicle = store.vehicles.find((v) => v.id === id);
  if (!vehicle) {
    return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 });
  }

  const session = await getSession();
  const isHostOfVehicle = session && vehicle.hostId === session.user.id;
  const isAdmin = session && session.user.role === "admin";
  const renterHasConfirmedBooking =
    session &&
    session.user.role === "renter" &&
    store.bookings.some(
      (b) =>
        b.vehicleId === id &&
        b.renterId === session.user.id &&
        (b.status === "confirmed" || b.status === "in_progress" || b.status === "completed")
    );

  if (isHostOfVehicle || isAdmin) {
    return NextResponse.json({ success: true, data: vehicle });
  }
  const data = sanitizeVehicleForRenter(vehicle, !!renterHasConfirmedBooking);
  return NextResponse.json({ success: true, data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Vehicle>>> {
  try {
    const { user } = await requireAuth();
    const { id } = await params;
    const store = getStore();
    const index = store.vehicles.findIndex((v) => v.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 });
    }
    const vehicle = store.vehicles[index];
    if (vehicle.hostId !== user.id && user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const updated: Vehicle = {
      ...vehicle,
      ...body,
      id: vehicle.id,
      hostId: vehicle.hostId,
      createdAt: vehicle.createdAt,
      updatedAt: new Date().toISOString(),
    };
    store.vehicles[index] = updated;
    setStore(store);
    persistStore();
    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { user } = await requireRole(["host", "admin"]);
    const { id } = await params;
    const store = getStore();
    const index = store.vehicles.findIndex((v) => v.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Vehicle not found" }, { status: 404 });
    }
    const vehicle = store.vehicles[index];
    if (vehicle.hostId !== user.id && user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    const hasBookings = store.bookings.some((b) => b.vehicleId === id);
    if (hasBookings) {
      return NextResponse.json(
        { success: false, error: "Cannot delete: this vehicle has bookings. Remove or complete them first." },
        { status: 400 }
      );
    }
    store.vehicles.splice(index, 1);
    setStore(store);
    persistStore();
    return NextResponse.json({ success: true, data: null });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
