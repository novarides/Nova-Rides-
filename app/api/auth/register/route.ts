import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getStore, setStore, generateId, persistStore } from "@/lib/store";
import { signToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { User } from "@/lib/types";
import { ApiResponse } from "@/lib/types";
import { hasSupabase, getSupabaseClient, mapSupabaseUser, SupabaseUserRow } from "@/lib/supabase";

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
    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken = generateId();
    const verifyExpires = new Date(Date.now() + VERIFY_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

    let user: User;

    if (hasSupabase()) {
      const supabase = getSupabaseClient();
      const { data: existing, error: existingErr } = await supabase
        .from("users")
        .select<"*", SupabaseUserRow>("*")
        .eq("email", email)
        .maybeSingle();
      if (existing) {
        return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
      }
      if (existingErr && existingErr.code !== "PGRST116") {
        console.error("[Nova Rides] Supabase lookup error:", existingErr);
      }

      const now = new Date().toISOString();
      const { data: created, error: insertErr } = await supabase
        .from("users")
        .insert({
          email,
          password_hash: hashedPassword,
          role: role === "host" ? "host" : "renter",
          verified: false,
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          created_at: now,
          updated_at: now,
        })
        .select("*")
        .single<SupabaseUserRow>();

      if (insertErr || !created) {
        console.error("[Nova Rides] Supabase insert error:", insertErr);
        return NextResponse.json({ success: false, error: "Could not create account. Please try again." }, { status: 500 });
      }

      user = mapSupabaseUser(created);
    } else {
      const store = getStore();
      if (store.users.some((u) => u.email === email)) {
        return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
      }
      user = {
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
    }

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
