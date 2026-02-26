import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, persistStore } from "@/lib/store";
import { requireRole } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";

/** Remove a user's ban (admin only). */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ banned: boolean }>>> {
  try {
    await requireRole("admin");
    const { id: userId } = await params;

    const store = getStore();
    const idx = store.users.findIndex((u) => u.id === userId);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const target = store.users[idx];
    store.users[idx] = {
      ...target,
      banned: false,
      bannedAt: undefined,
      bannedReason: undefined,
      bannedBy: undefined,
      updatedAt: new Date().toISOString(),
    };
    setStore(store);
    persistStore();

    return NextResponse.json({ success: true, data: { banned: false } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
