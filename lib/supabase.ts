import { createClient } from "@supabase/supabase-js";
import type { User } from "./types";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hasSupabase(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase is not configured");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

// Minimal shape of the users table in Supabase. This must match your SQL schema.
export interface SupabaseUserRow {
  id: string;
  email: string;
  password_hash: string | null;
  role: "host" | "renter" | "admin";
  verified: boolean;
  banned: boolean | null;
  banned_at: string | null;
  banned_reason: string | null;
  banned_by: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export function mapSupabaseUser(row: SupabaseUserRow): User {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone || undefined,
    role: row.role,
    verified: row.verified,
    identityVerified: false,
    licenseVerified: false,
    firstName: row.first_name,
    lastName: row.last_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    acceptedTerms: true,
    acceptedPrivacy: true,
    banned: row.banned || undefined,
    bannedAt: row.banned_at || undefined,
    bannedReason: row.banned_reason || undefined,
    bannedBy: row.banned_by || undefined,
  };
}

