import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, persistStore } from "@/lib/store";
import { requireAuth } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";

export async function GET() {
  try {
    const { user } = await requireAuth();
    const store = getStore();
    const u = store.users.find((x) => x.id === user.id);
    if (!u) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    const { passwordHash: _, ...profile } = u as typeof u & { passwordHash?: string };
    return NextResponse.json({ success: true, data: profile });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user } = await requireAuth();
    const body = await request.json();
    const store = getStore();
    const idx = store.users.findIndex((x) => x.id === user.id);
    if (idx === -1) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const u = store.users[idx];
    if (body.firstName != null) u.firstName = String(body.firstName);
    if (body.lastName != null) u.lastName = String(body.lastName);
    if (body.phone !== undefined) u.phone = body.phone === "" ? undefined : String(body.phone);
    if (body.avatar !== undefined) u.avatar = body.avatar === "" ? undefined : String(body.avatar);
    if (body.dateOfBirth !== undefined) u.dateOfBirth = body.dateOfBirth === "" ? undefined : String(body.dateOfBirth);
    if (body.residentialAddress !== undefined) u.residentialAddress = body.residentialAddress === "" ? undefined : String(body.residentialAddress);
    if (body.emergencyContactName !== undefined) u.emergencyContactName = body.emergencyContactName === "" ? undefined : String(body.emergencyContactName);
    if (body.emergencyContactPhone !== undefined) u.emergencyContactPhone = body.emergencyContactPhone === "" ? undefined : String(body.emergencyContactPhone);
    if (body.verificationInfoCorrect !== undefined) u.verificationInfoCorrect = body.verificationInfoCorrect === true;
    if (body.verificationPoliciesAgreed !== undefined) u.verificationPoliciesAgreed = body.verificationPoliciesAgreed === true;
    if (body.verificationSignature !== undefined) u.verificationSignature = body.verificationSignature === "" ? undefined : String(body.verificationSignature);
    if (body.verificationSignedAt !== undefined) u.verificationSignedAt = body.verificationSignedAt === "" ? undefined : String(body.verificationSignedAt);
    u.updatedAt = new Date().toISOString();
    store.users[idx] = u;
    setStore(store);
    persistStore();

    const { passwordHash: _, ...profile } = u as typeof u & { passwordHash?: string };
    return NextResponse.json({ success: true, data: profile });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 401 });
  }
}
