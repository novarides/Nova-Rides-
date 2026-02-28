import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getStore, setStore, persistStore } from "@/lib/store";
import { ApiResponse } from "@/lib/types";
import { hasSupabase, getSupabaseClient } from "@/lib/supabase";

/** POST /api/auth/reset-password – set new password using reset token. */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ ok: boolean }>>> {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    if (!token) {
      return NextResponse.json({ success: false, error: "Reset link is invalid or missing" }, { status: 400 });
    }
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const now = new Date().toISOString();

    if (hasSupabase()) {
      const supabase = getSupabaseClient();
      const { data: user, error: findErr } = await supabase
        .from("users")
        .select("id")
        .eq("password_reset_token", token)
        .gt("password_reset_expires", now)
        .maybeSingle();
      if (findErr || !user) {
        return NextResponse.json({ success: false, error: "Invalid or expired reset link. Request a new one." }, { status: 400 });
      }
      const { error: updateErr } = await supabase
        .from("users")
        .update({
          password_hash: hashedPassword,
          password_reset_token: null,
          password_reset_expires: null,
          updated_at: now,
        })
        .eq("id", user.id);
      if (updateErr) {
        return NextResponse.json({ success: false, error: "Failed to update password" }, { status: 500 });
      }
      return NextResponse.json({ success: true, data: { ok: true } });
    }

    const store = getStore();
    const user = store.users.find(
      (u) =>
        u.passwordResetToken === token &&
        u.passwordResetExpires &&
        new Date(u.passwordResetExpires) > new Date()
    );
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid or expired reset link. Request a new one." }, { status: 400 });
    }

    const userWithPass = user as typeof user & { passwordHash?: string };
    userWithPass.passwordHash = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.updatedAt = now;
    const idx = store.users.findIndex((u) => u.id === user.id);
    if (idx !== -1) store.users[idx] = user;
    setStore(store);
    persistStore();

    return NextResponse.json({ success: true, data: { ok: true } });
  } catch (e) {
    console.error("[Nova Rides] Reset password error:", e);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
