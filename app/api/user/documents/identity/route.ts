import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, persistStore } from "@/lib/store";
import { requireAuth } from "@/lib/auth";
import { saveDocument } from "@/lib/documents";
import { ApiResponse } from "@/lib/types";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ identityVerified: boolean }>>> {
  try {
    const { user } = await requireAuth();
    const formData = await request.formData();
    const front = formData.get("identityFront") as File | null;
    const back = formData.get("identityBack") as File | null;
    if (!front || !(front instanceof File) || !back || !(back instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Upload both identity front and back (identityFront, identityBack)." },
        { status: 400 }
      );
    }

    const frontResult = await saveDocument(user.id, "identity", "front", front);
    if ("error" in frontResult) {
      return NextResponse.json({ success: false, error: frontResult.error }, { status: 400 });
    }
    const backResult = await saveDocument(user.id, "identity", "back", back);
    if ("error" in backResult) {
      return NextResponse.json({ success: false, error: backResult.error }, { status: 400 });
    }

    const store = getStore();
    const idx = store.users.findIndex((x) => x.id === user.id);
    if (idx === -1) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    store.users[idx].identityDocFront = frontResult.url;
    store.users[idx].identityDocBack = backResult.url;
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
