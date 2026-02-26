import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getStore, setStore, generateId, persistStore } from "@/lib/store";
import { signToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { User } from "@/lib/types";
import { ApiResponse } from "@/lib/types";

const VERIFY_EXPIRY_HOURS = 24;

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ user: User; token: string }>>> {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, role = "renter" } = body;
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: email, password, firstName, lastName" },
        { status: 400 }
      );
    }
    const store = getStore();
    if (store.users.some((u) => u.email === email)) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken = generateId();
    const verifyExpires = new Date(Date.now() + VERIFY_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
    const user: User = {
      id: generateId(),
      email,
      phone: phone || undefined,
      role: role === "host" ? "host" : "renter",
      verified: false,
      emailVerifyToken: verifyToken,
      emailVerifyExpires: verifyExpires,
      identityVerified: false,
      licenseVerified: false,
      firstName,
      lastName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      acceptedTerms: body.acceptedTerms === true,
      acceptedPrivacy: body.acceptedPrivacy === true,
    };
    (user as User & { passwordHash?: string }).passwordHash = hashedPassword;
    store.users.push(user);
    setStore(store);
    persistStore();

    const emailResult = await sendVerificationEmail(email, verifyToken);
    if (!emailResult.ok && emailResult.error) {
      console.warn("[Nova Rides] Verification email failed:", emailResult.error);
    }

    const token = await signToken(user);
    const { emailVerifyToken: _t, emailVerifyExpires: _e, ...userSafe } = user;
    const response = NextResponse.json({
      success: true,
      data: {
        user: userSafe,
        token,
        ...(emailResult.verifyUrl && { verificationLink: emailResult.verifyUrl }),
      },
    });
    response.cookies.set("nova_token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
