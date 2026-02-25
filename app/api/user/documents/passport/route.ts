import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, persistStore } from "@/lib/store";
import { requireAuth } from "@/lib/auth";
import { saveDocument } from "@/lib/documents";
import { ApiResponse } from "@/lib/types";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ passportPhotoUrl: string }>>> {
  try {
    const { user } = await requireAuth();
    const formData = await request.formData();
    const file = formData.get("passportPhoto") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No file uploaded (passportPhoto)." }, { status: 400 });
    }

    const result = await saveDocument(user.id, "passport", "front", file);
    if ("error" in result) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    const store = getStore();
    const idx = store.users.findIndex((x) => x.id === user.id);
    if (idx === -1) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    store.users[idx].passportPhotoUrl = result.url;
    store.users[idx].updatedAt = new Date().toISOString();
    setStore(store);
    persistStore();

    return NextResponse.json({ success: true, data: { passportPhotoUrl: result.url } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
