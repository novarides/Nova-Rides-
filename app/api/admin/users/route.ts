import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { requireRole } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";

/** List all users (admin only). Returns safe fields for moderation. */
export async function GET(): Promise<NextResponse<ApiResponse<unknown[]>>> {
  try {
    await requireRole("admin");
    const store = getStore();
    const users = store.users.map((u) => {
      const { passwordHash: _, ...safe } = u as typeof u & { passwordHash?: string };
      return {
        id: safe.id,
        email: safe.email,
        firstName: safe.firstName,
        lastName: safe.lastName,
        role: safe.role,
        verified: safe.verified,
        banned: safe.banned ?? false,
        bannedAt: safe.bannedAt,
        bannedReason: safe.bannedReason,
        bannedBy: safe.bannedBy,
        createdAt: safe.createdAt,
      };
    });
    return NextResponse.json({ success: true, data: users });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg === "Unauthorized" ? 401 : msg === "Forbidden" ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
