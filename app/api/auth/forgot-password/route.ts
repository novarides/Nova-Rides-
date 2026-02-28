import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getStore, setStore, persistStore } from "@/lib/store";
import { sendPasswordResetEmail } from "@/lib/email";
import { ApiResponse } from "@/lib/types";
import { hasSupabase, getSupabaseClient } from "@/lib/supabase";

/** POST /api/auth/forgot-password – request a password reset email. Always returns success to avoid leaking whether email exists. When email is not configured (no RESEND_API_KEY), returns resetUrl so the user can open it. */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ sent: boolean; resetUrl?: string }>>> {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    if (hasSupabase()) {
      const supabase = getSupabaseClient();
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (user) {
        await supabase
          .from("users")
          .update({
            password_reset_token: token,
            password_reset_expires: expires,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
        const result = await sendPasswordResetEmail(email, token);
        if (!result.ok && result.error) {
          console.error("[Nova Rides] Forgot password email error:", result.error);
        }
        return NextResponse.json({
          success: true,
          data: { sent: true, ...(result.resetUrl && { resetUrl: result.resetUrl }) },
        });
      }
      return NextResponse.json({ success: true, data: { sent: true } });
    }

    const store = getStore();
    const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      user.passwordResetToken = token;
      user.passwordResetExpires = expires;
      user.updatedAt = new Date().toISOString();
      const idx = store.users.findIndex((u) => u.id === user.id);
      if (idx !== -1) store.users[idx] = user;
      setStore(store);
      persistStore();

      const result = await sendPasswordResetEmail(email, token);
      if (!result.ok && result.error) {
        console.error("[Nova Rides] Forgot password email error:", result.error);
      }
      if (!result.ok && !result.resetUrl) {
        return NextResponse.json({ success: true, data: { sent: false }, error: result.error }, { status: 200 });
      }
      return NextResponse.json({
        success: true,
        data: { sent: true, ...(result.resetUrl && { resetUrl: result.resetUrl }) },
      });
    }

    return NextResponse.json({ success: true, data: { sent: true } });
  } catch (e) {
    console.error("[Nova Rides] Forgot password error:", e);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
