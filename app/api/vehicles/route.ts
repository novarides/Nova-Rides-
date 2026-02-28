import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, generateId, persistStore } from "@/lib/store";
import { getSession, requireRole } from "@/lib/auth";
import { Vehicle } from "@/lib/types";
import { ApiResponse } from "@/lib/types";
import { saveVehicleDocument, saveVehicleImage } from "@/lib/documents";

/** Strip private fields so renters and public never see them in list. */
function sanitizeVehicleForList(vehicle: Vehicle): Vehicle {
  const { roadworthinessDocUrl, licensePlate, vin, ...rest } = vehicle;
  return rest as Vehicle;
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Vehicle[]>>> {
  const store = getStore();
  const { searchParams } = new URL(request.url);
  const hostId = searchParams.get("hostId");
  const status = searchParams.get("status") || "active";
  let list = store.vehicles.filter((v) => (status ? v.status === status : true));
  if (hostId) list = list.filter((v) => v.hostId === hostId);

  const session = await getSession();
  const isOwnList = hostId && session && (session.user.id === hostId || session.user.role === "admin");
  if (!isOwnList) list = list.map(sanitizeVehicleForList);

  return NextResponse.json({ success: true, data: list });
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Vehicle>>> {
  try {
    const { user } = await requireRole(["host", "admin"]);
    const store = getStore();
    let body: Record<string, unknown>;
    let roadworthinessFile: File | null = null;

    const contentType = request.headers.get("content-type") || "";
    let imageFiles: File[] = [];
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const dataStr = formData.get("data") as string | null;
      if (!dataStr) return NextResponse.json({ success: false, error: "Missing data field" }, { status: 400 });
      body = JSON.parse(dataStr) as Record<string, unknown>;
      const file = formData.get("roadworthiness");
      if (file && file instanceof File && file.size > 0) roadworthinessFile = file;
      const images = formData.getAll("images");
      imageFiles = images.filter((f): f is File => f instanceof File && f.size > 0);
    } else {
      body = await request.json();
    }

    const vehicleId = generateId();
    const vehicle: Vehicle = {
      id: vehicleId,
      hostId: user.id,
      title: body.title as string,
      description: (body.description as string) || "",
      year: body.year as number,
      make: body.make as string,
      model: body.model as string,
      mileage: (body.mileage as number) ?? 0,
      vehicleClass: (body.vehicleClass as Vehicle["vehicleClass"]) || "midsize",
      pricePerDay: body.pricePerDay as number,
      pricePerWeek: body.pricePerWeek as number | undefined,
      currency: (body.currency as string) || "NGN",
      images: Array.isArray(body.images) ? (body.images as string[]) : [],
      location: body.location as Vehicle["location"],
      availability: Array.isArray(body.availability) ? (body.availability as string[]) : [],
      minRentalDays: (body.minRentalDays as number) ?? 1,
      bookingType: (body.bookingType as Vehicle["bookingType"]) || "approval",
      featured: (body.featured as boolean) ?? false,
      promoted: (body.promoted as boolean) ?? false,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      licensePlate: body.licensePlate as string | undefined,
      vin: body.vin as string | undefined,
      color: body.color as string | undefined,
      mileagePerDay: body.mileagePerDay as number | undefined,
      mileagePerDayUnit: body.mileagePerDayUnit as "km" | "miles" | undefined,
      listingInfoCorrect: body.listingInfoCorrect as boolean | undefined,
      listingPoliciesAgreed: body.listingPoliciesAgreed as boolean | undefined,
      listingSignature: body.listingSignature as string | undefined,
      listingSignedAt: body.listingSignedAt as string | undefined,
    };

    if (roadworthinessFile) {
      const result = await saveVehicleDocument(user.id, vehicleId, "roadworthiness", roadworthinessFile);
      if ("error" in result) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      vehicle.roadworthinessDocUrl = result.url;
    }

    const imageUrls: string[] = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const result = await saveVehicleImage(user.id, vehicleId, i, imageFiles[i]);
      if ("error" in result) return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      imageUrls.push(result.url);
    }
    vehicle.images = imageUrls.length > 0 ? imageUrls : vehicle.images;

    store.vehicles.push(vehicle);
    setStore(store);
    persistStore();
    return NextResponse.json({ success: true, data: vehicle });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
