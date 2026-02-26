import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, persistStore } from "@/lib/store";
import { requireRole } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";

/** Permanently ban a user (admin only). They will not be able to log in or use the platform. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ banned: boolean }>>> {
  try {
    const { user: admin } = await requireRole("admin");
    const { id: userId } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = typeof body.reason === "string" ? body.reason.trim() : "Rule violation";

    const store = getStore();
    const idx = store.users.findIndex((u) => u.id === userId);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }
    const target = store.users[idx];
    if (target.role === "admin") {
      return NextResponse.json({ success: false, error: "Cannot ban an admin" }, { status: 400 });
    }

    store.users[idx] = {
      ...target,
      banned: true,
      bannedAt: new Date().toISOString(),
      bannedReason: reason || undefined,
      bannedBy: admin.id,
      updatedAt: new Date().toISOString(),
    };
    setStore(store);
    persistStore();

    return NextResponse.json({ success: true, data: { banned: true } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
