import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { Vehicle } from "@/lib/types";
import { ApiResponse } from "@/lib/types";
import { differenceInDays, parseISO, isWithinInterval } from "date-fns";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Vehicle[]>>> {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city")?.toLowerCase();
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const vehicleType = searchParams.get("vehicleType");
  const sort = searchParams.get("sort") || "featured"; // featured | price_asc | price_desc | rating

  let list = getStore().vehicles.filter((v) => v.status === "active");

  if (city) {
    list = list.filter((v) => v.location.city.toLowerCase().includes(city));
  }

  if (startDate && endDate) {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    list = list.filter((v) => {
      const avail = v.availability.map((d) => parseISO(d));
      return avail.some((d) => isWithinInterval(d, { start, end }));
    });
  }

  if (minPrice) {
    const min = Number(minPrice);
    if (!Number.isNaN(min)) list = list.filter((v) => v.pricePerDay >= min);
  }
  if (maxPrice) {
    const max = Number(maxPrice);
    if (!Number.isNaN(max)) list = list.filter((v) => v.pricePerDay <= max);
  }

  if (vehicleType) {
    list = list.filter((v) => v.vehicleClass === vehicleType);
  }

  if (sort === "price_asc") list.sort((a, b) => a.pricePerDay - b.pricePerDay);
  else if (sort === "price_desc") list.sort((a, b) => b.pricePerDay - a.pricePerDay);
  else if (sort === "rating") list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  else list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return NextResponse.json({ success: true, data: list });
}
