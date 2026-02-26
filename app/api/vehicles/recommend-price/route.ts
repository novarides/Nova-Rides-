import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getRecommendedPrice } from "@/lib/pricing";
import { ApiResponse } from "@/lib/types";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ recommendedPricePerDay: number; reasoning: string; currency: string }>>> {
  try {
    await requireAuth();
    const body = await request.json();
    const make = typeof body.make === "string" ? body.make.trim() : "";
    const model = typeof body.model === "string" ? body.model.trim() : "";
    const year = typeof body.year === "number" ? body.year : new Date().getFullYear();
    const vehicleClass = typeof body.vehicleClass === "string" ? body.vehicleClass.trim() : "midsize";
    const city = typeof body.city === "string" ? body.city.trim() : undefined;
    const currency = typeof body.currency === "string" ? body.currency : "NGN";

    const result = await getRecommendedPrice({
      make,
      model,
      year,
      vehicleClass,
      city,
      currency,
    });

    return NextResponse.json({
      success: true,
      data: {
        recommendedPricePerDay: result.recommendedPricePerDay,
        reasoning: result.reasoning,
        currency: result.currency,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 401 });
  }
}
