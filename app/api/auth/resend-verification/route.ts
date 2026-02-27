import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, generateId, persistStore } from "@/lib/store";
import { requireAuth } from "@/lib/auth";
import { sendVerificationEmail, isEmailConfigured } from "@/lib/email";
import { ApiResponse } from "@/lib/types";
import { hasSupabase, getSupabaseClient } from "@/lib/supabase";

const VERIFY_EXPIRY_HOURS = 24;

export async function POST(_request: NextRequest): Promise<NextResponse<ApiResponse<{ sent: boolean }>>> {
  try {
    const { user } = await requireAuth();
    if (user.verified) {
      return NextResponse.json({ success: true, data: { sent: false }, message: "Email already verified" });
    }

    const verifyToken = generateId();
    const verifyExpires = new Date(Date.now() + VERIFY_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

    if (hasSupabase()) {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("users")
        .update({
          email_verify_token: verifyToken,
          email_verify_expires: verifyExpires,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) {
        return NextResponse.json({ success: false, error: "Could not update verification" }, { status: 500 });
      }
    } else {
      const store = getStore();
      const u = store.users.find((x) => x.id === user.id);
      if (!u) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      u.emailVerifyToken = verifyToken;
      u.emailVerifyExpires = verifyExpires;
      u.updatedAt = new Date().toISOString();
      const idx = store.users.findIndex((x) => x.id === user.id);
      if (idx !== -1) store.users[idx] = u;
      setStore(store);
      persistStore();
    }

    const result = await sendVerificationEmail(user.email, verifyToken);
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error || "Failed to send email" }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      data: {
        sent: isEmailConfigured(),
        ...(result.verifyUrl && { verificationLink: result.verifyUrl }),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 401 });
  }
}
