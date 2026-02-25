import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, persistStore } from "@/lib/store";
import { ApiResponse } from "@/lib/types";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<{ verified: boolean }>>> {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ success: false, error: "Missing token" }, { status: 400 });
  }

  const store = getStore();
  const user = store.users.find(
    (u) => u.emailVerifyToken === token && u.emailVerifyExpires && new Date(u.emailVerifyExpires) > new Date()
  );
  if (!user) {
    return NextResponse.json({ success: false, error: "Invalid or expired verification link" }, { status: 400 });
  }

  user.verified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;
  user.updatedAt = new Date().toISOString();
  const idx = store.users.findIndex((u) => u.id === user.id);
  if (idx !== -1) store.users[idx] = user;
  setStore(store);
  persistStore();

  return NextResponse.json({ success: true, data: { verified: true } });
}
