import { NextResponse } from "next/server";
import { ApiResponse } from "@/lib/types";

export async function POST(): Promise<NextResponse<ApiResponse<null>>> {
  const response = NextResponse.json({ success: true, data: null });
  response.cookies.set("nova_token", "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
