import { NextResponse } from "next/server";
import { getPaymentConfig } from "@/lib/payments";

export async function GET() {
  const config = getPaymentConfig();
  return NextResponse.json({
    success: true,
    data: {
      paystack: config.paystack,
      stripe: config.stripe,
      appUrl: config.appUrl,
    },
  });
}
