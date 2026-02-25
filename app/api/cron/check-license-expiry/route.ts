import { NextRequest, NextResponse } from "next/server";
import { getStore, setStore, persistStore } from "@/lib/store";
import { sendLicenseExpiryReminder } from "@/lib/email";

const CRON_SECRET = process.env.CRON_SECRET;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const secret = request.nextUrl.searchParams.get("secret");
  const provided = secret || (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);
  if (CRON_SECRET && provided !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = getStore();
  const now = new Date();
  const inOneWeek = new Date(now.getTime() + ONE_WEEK_MS);
  let remindersSent = 0;
  let expiredRevoked = 0;

  for (let i = 0; i < store.users.length; i++) {
    const u = store.users[i];
    if (!u.licenseExpiryDate || !u.licenseDocFront) continue;

    const expiry = new Date(u.licenseExpiryDate);

    if (expiry <= now) {
      if (u.licenseVerified) {
        store.users[i].licenseVerified = false;
        store.users[i].updatedAt = new Date().toISOString();
        expiredRevoked++;
      }
      continue;
    }

    if (expiry <= inOneWeek && u.licenseVerified) {
      const alreadySent = u.licenseExpiryReminderSentAt &&
        (now.getTime() - new Date(u.licenseExpiryReminderSentAt).getTime() < ONE_WEEK_MS);
      if (!alreadySent) {
        const result = await sendLicenseExpiryReminder(u.email, u.licenseExpiryDate, u.firstName);
        if (result.ok) {
          store.users[i].licenseExpiryReminderSentAt = now.toISOString();
          store.users[i].updatedAt = now.toISOString();
          remindersSent++;
        }
      }
    }
  }

  setStore(store);
  persistStore();
  return NextResponse.json({
    success: true,
    remindersSent,
    expiredRevoked,
  });
}
