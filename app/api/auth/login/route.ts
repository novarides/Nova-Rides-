import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getStore } from "@/lib/store";
import { signToken } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";
import { hasSupabase, getSupabaseClient, mapSupabaseUser, SupabaseUserRow } from "@/lib/supabase";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ user: unknown; token: string }>>> {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password required" }, { status: 400 });
    }
    let passwordHash: string | null = null;
    let user: any = null;

    if (hasSupabase()) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("users")
        .select<"*", SupabaseUserRow>("*")
        .eq("email", email)
        .maybeSingle();
      if (error) {
        console.error("[Nova Rides] Supabase login error:", error);
      }
      if (data) {
        user = mapSupabaseUser(data);
        passwordHash = data.password_hash;
      }
    }

    if (!user) {
      const store = getStore();
      const userWithPass = store.users.find((u) => u.email === email) as (typeof store.users[0]) & { passwordHash?: string };
      if (!userWithPass) {
        return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
      }
      user = userWithPass;
      passwordHash = userWithPass.passwordHash || null;
      if (!passwordHash && (email === "host@novarides.com" || email === "renter@novarides.com") && password === "password123") {
        passwordHash = await bcrypt.hash("password123", 10);
        userWithPass.passwordHash = passwordHash;
      }
    }

    if (user.banned) {
      return NextResponse.json(
        { success: false, error: "Your account has been permanently banned for violating platform rules." },
        { status: 403 }
      );
    }

    if (!passwordHash) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }
    const { passwordHash: _ignored, ...userSafe } = user;
    const token = await signToken(user);
    const response = NextResponse.json({ success: true, data: { user: userSafe, token } });
    response.cookies.set("nova_token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
