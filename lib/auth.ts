import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { User, UserRole } from "./types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nova-rides-dev-secret-change-in-production"
);

export interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export async function signToken(user: User): Promise<string> {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{ user: User; token: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nova_token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  const { getStore } = await import("./store");
  const user = getStore().users.find((u) => u.id === payload.sub);
  if (!user || user.banned) return null;
  return { user, token };
}

export async function requireAuth(): Promise<{ user: User; token: string }> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireRole(role: UserRole | UserRole[]): Promise<{ user: User; token: string }> {
  const session = await requireAuth();
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(session.user.role)) throw new Error("Forbidden");
  return session;
}
