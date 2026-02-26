import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, persistStore } from "@/lib/store";
import { requireAuth } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";
import { UserRole } from "@/lib/types";

export async function PATCH(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ role: UserRole }>>> {
  try {
    const { user } = await requireAuth();
    const body = await request.json();
    const role = body.role === "host" || body.role === "renter" ? body.role : null;
    if (!role) {
      return NextResponse.json(
        { success: false, error: "role must be 'host' or 'renter'" },
        { status: 400 }
      );
    }

    const store = getStore();
    const idx = store.users.findIndex((u) => u.id === user.id);
    if (idx === -1) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    store.users[idx].role = role;
    store.users[idx].updatedAt = new Date().toISOString();
    setStore(store);
    persistStore();

    return NextResponse.json({ success: true, data: { role } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 401 });
  }
}
