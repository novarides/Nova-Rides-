import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB for documents

function getExt(type: string): string {
  if (type === "application/pdf") return "pdf";
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/gif") return "gif";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export async function saveDocument(
  userId: string,
  docType: "identity" | "license",
  side: "front" | "back",
  file: File
): Promise<{ url: string } | { error: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Invalid file type. Use JPEG, PNG, GIF, WebP, or PDF." };
  }
  if (file.size > MAX_SIZE) {
    return { error: "File too large. Max 10MB." };
  }
  const ext = getExt(file.type);
  const filename = `${side}.${ext}`;
  const dir = path.join(process.cwd(), "public", "documents", userId, docType);
  await mkdir(dir, { recursive: true });
  const filepath = path.join(dir, filename);
  const bytes = await file.arrayBuffer();
  await writeFile(filepath, Buffer.from(bytes));
  const url = `/documents/${userId}/${docType}/${filename}`;
  return { url };
}
