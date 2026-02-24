import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getStore } from "@/lib/store";
import { signToken } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ user: unknown; token: string }>>> {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password required" }, { status: 400 });
    }
    const store = getStore();
    const userWithPass = store.users.find((u) => u.email === email) as (typeof store.users[0]) & { passwordHash?: string };
    if (!userWithPass) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }
    let hash = userWithPass.passwordHash;
    if (!hash && (email === "host@novarides.com" || email === "renter@novarides.com") && password === "password123") {
      hash = await bcrypt.hash("password123", 10);
      userWithPass.passwordHash = hash;
    }
    if (!hash) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, hash);
    if (!valid) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }
    const { passwordHash: _, ...user } = userWithPass;
    const token = await signToken(user);
    const response = NextResponse.json({ success: true, data: { user, token } });
    response.cookies.set("nova_token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
