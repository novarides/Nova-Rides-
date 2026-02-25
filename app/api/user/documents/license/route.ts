import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, persistStore } from "@/lib/store";
import { requireAuth } from "@/lib/auth";
import { saveDocument } from "@/lib/documents";
import { ApiResponse } from "@/lib/types";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ licenseVerified: boolean; licenseExpiryDate: string }>>> {
  try {
    const { user } = await requireAuth();
    const formData = await request.formData();
    const front = formData.get("licenseFront") as File | null;
    const back = formData.get("licenseBack") as File | null;
    const expiryDate = formData.get("expiryDate") as string | null;
    if (!front || !(front instanceof File) || !back || !(back instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Upload both licence front and back (licenseFront, licenseBack)." },
        { status: 400 }
      );
    }
    if (!expiryDate || !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
      return NextResponse.json(
        { success: false, error: "Valid expiry date (YYYY-MM-DD) is required." },
        { status: 400 }
      );
    }
    const expiry = new Date(expiryDate);
    if (Number.isNaN(expiry.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid expiry date." }, { status: 400 });
    }

    const frontResult = await saveDocument(user.id, "license", "front", front);
    if ("error" in frontResult) {
      return NextResponse.json({ success: false, error: frontResult.error }, { status: 400 });
    }
    const backResult = await saveDocument(user.id, "license", "back", back);
    if ("error" in backResult) {
      return NextResponse.json({ success: false, error: backResult.error }, { status: 400 });
    }

    const store = getStore();
    const idx = store.users.findIndex((x) => x.id === user.id);
    if (idx === -1) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    const u = store.users[idx];
    u.licenseDocFront = frontResult.url;
    u.licenseDocBack = backResult.url;
    u.licenseExpiryDate = expiryDate;
    u.licenseExpiryReminderSentAt = undefined;
    u.licenseVerified = expiry > new Date();
    u.updatedAt = new Date().toISOString();
    setStore(store);
    persistStore();

    return NextResponse.json({
      success: true,
      data: { licenseVerified: u.licenseVerified, licenseExpiryDate: expiryDate },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
