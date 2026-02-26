import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, persistStore } from "@/lib/store";
import { requireAuth } from "@/lib/auth";
import { saveDocument } from "@/lib/documents";
import { ApiResponse } from "@/lib/types";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ identityVerified: boolean }>>> {
  try {
    const { user } = await requireAuth();
    const formData = await request.formData();
    const file = (formData.get("identityDocument") ?? formData.get("identityFront")) as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Upload one identity document (identityDocument)." },
        { status: 400 }
      );
    }

    const result = await saveDocument(user.id, "identity", "front", file);
    if ("error" in result) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    const store = getStore();
    const idx = store.users.findIndex((x) => x.id === user.id);
    if (idx === -1) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    store.users[idx].identityDocFront = result.url;
    store.users[idx].identityDocBack = undefined;
    store.users[idx].identityVerified = true;
    store.users[idx].updatedAt = new Date().toISOString();
    setStore(store);
    persistStore();

    return NextResponse.json({ success: true, data: { identityVerified: true } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
