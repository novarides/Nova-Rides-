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
  docType: "identity" | "license" | "passport" | "proofOfAddress",
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
  try {
    await mkdir(dir, { recursive: true });
    const filepath = path.join(dir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));
  } catch {
    return { error: "File storage is not available in this environment (e.g. serverless). Use a cloud storage solution for production." };
  }
  const url = `/documents/${userId}/${docType}/${filename}`;
  return { url };
}

/** Save a vehicle document (e.g. roadworthiness certificate). Path: documents/{userId}/vehicles/{vehicleId}/{docType}.{ext} */
export async function saveVehicleDocument(
  userId: string,
  vehicleId: string,
  docType: "roadworthiness",
  file: File
): Promise<{ url: string } | { error: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Invalid file type. Use JPEG, PNG, GIF, WebP, or PDF." };
  }
  if (file.size > MAX_SIZE) {
    return { error: "File too large. Max 10MB." };
  }
  const ext = file.type === "application/pdf" ? "pdf" : file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : file.type === "image/gif" ? "gif" : "webp";
  const filename = `${docType}.${ext}`;
  const dir = path.join(process.cwd(), "public", "documents", userId, "vehicles", vehicleId);
  try {
    await mkdir(dir, { recursive: true });
    const filepath = path.join(dir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));
  } catch {
    return { error: "File storage is not available in this environment (e.g. serverless). Use a cloud storage solution for production." };
  }
  const url = `/documents/${userId}/vehicles/${vehicleId}/${filename}`;
  return { url };
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB per image

/** Save a vehicle photo. Path: documents/{userId}/vehicles/{vehicleId}/images/{index}.{ext} */
export async function saveVehicleImage(
  userId: string,
  vehicleId: string,
  index: number,
  file: File
): Promise<{ url: string } | { error: string }> {
  if (!IMAGE_TYPES.includes(file.type)) {
    return { error: "Invalid file type. Use JPEG, PNG, GIF, or WebP." };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { error: "Image too large. Max 5MB per image." };
  }
  const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : file.type === "image/gif" ? "gif" : "webp";
  const filename = `${index}.${ext}`;
  const dir = path.join(process.cwd(), "public", "documents", userId, "vehicles", vehicleId, "images");
  try {
    await mkdir(dir, { recursive: true });
    const filepath = path.join(dir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));
  } catch {
    return { error: "File storage is not available in this environment (e.g. serverless). Use a cloud storage solution for production." };
  }
  const url = `/documents/${userId}/vehicles/${vehicleId}/images/${filename}`;
  return { url };
}
