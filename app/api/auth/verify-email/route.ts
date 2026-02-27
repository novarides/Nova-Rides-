import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, persistStore } from "@/lib/store";
import { ApiResponse } from "@/lib/types";
import { hasSupabase, getSupabaseClient } from "@/lib/supabase";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<{ verified: boolean }>>> {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ success: false, error: "Missing token" }, { status: 400 });
  }

  if (hasSupabase()) {
    const supabase = getSupabaseClient();
    const now = new Date().toISOString();
    const { data: user, error: findErr } = await supabase
      .from("users")
      .select("id")
      .eq("email_verify_token", token)
      .gt("email_verify_expires", now)
      .maybeSingle();
    if (findErr || !user) {
      return NextResponse.json({ success: false, error: "Invalid or expired verification link" }, { status: 400 });
    }
    const { error: updateErr } = await supabase
      .from("users")
      .update({
        verified: true,
        email_verify_token: null,
        email_verify_expires: null,
        updated_at: now,
      })
      .eq("id", user.id);
    if (updateErr) {
      return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: { verified: true } });
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
