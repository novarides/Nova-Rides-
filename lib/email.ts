/**
 * Nova Rides – Email (Resend)
 * Set RESEND_API_KEY and EMAIL_FROM in .env for real emails.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "Nova Rides <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function isEmailConfigured(): boolean {
  return Boolean(RESEND_API_KEY);
}

export async function sendVerificationEmail(email: string, token: string): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.warn("[Nova Rides] RESEND_API_KEY not set – verification email not sent. Link:', " + `${APP_URL}/verify-email?token=${token}`);
    return { ok: true };
  }

  const verifyUrl = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [email],
        subject: "Verify your Nova Rides account",
        html: `
          <h1>Verify your email</h1>
          <p>Thanks for signing up for Nova Rides. Click the link below to verify your email:</p>
          <p><a href="${verifyUrl}" style="color:#f59e0b;font-weight:bold">Verify my email</a></p>
          <p>Or copy this link: ${verifyUrl}</p>
          <p>This link expires in 24 hours.</p>
          <p>– Nova Rides</p>
        `,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.message || "Failed to send email" };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function sendLicenseExpiryReminder(
  email: string,
  expiryDate: string,
  firstName: string
): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) return { ok: true };
  const profileUrl = `${APP_URL}/profile`;
  const dateStr = new Date(expiryDate).toLocaleDateString();
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [email],
        subject: "Your driver's licence expires soon – Nova Rides",
        html: `
          <h1>Driver's licence expiring soon</h1>
          <p>Hi ${firstName},</p>
          <p>Your driver's licence on file expires on <strong>${dateStr}</strong> (in one week).</p>
          <p>Please upload a new driver's licence before it expires so you can continue to book cars on Nova Rides. If your licence expires, you won't be able to make new bookings until you upload a valid one.</p>
          <p><a href="${profileUrl}" style="color:#f59e0b;font-weight:bold">Update licence on Profile</a></p>
          <p>– Nova Rides</p>
        `,
      }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.message || "Failed to send email" };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
