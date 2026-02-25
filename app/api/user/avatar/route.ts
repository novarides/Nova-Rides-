import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, persistStore } from "@/lib/store";
import { requireAuth } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ avatar: string }>>> {
  try {
    const { user } = await requireAuth();
    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Invalid file type. Use JPEG, PNG, GIF, or WebP." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: "File too large. Max 5MB." }, { status: 400 });
    }

    const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : file.type === "image/gif" ? "gif" : "webp";
    const filename = `${user.id}.${ext}`;
    const dir = path.join(process.cwd(), "public", "avatars");
    await mkdir(dir, { recursive: true });
    const filepath = path.join(dir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    const avatarUrl = `/avatars/${filename}`;
    const store = getStore();
    const idx = store.users.findIndex((x) => x.id === user.id);
    if (idx !== -1) {
      store.users[idx].avatar = avatarUrl;
      store.users[idx].updatedAt = new Date().toISOString();
      setStore(store);
      persistStore();
    }

    return NextResponse.json({ success: true, data: { avatar: avatarUrl } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
