"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  verified: boolean;
  avatar?: string;
  identityVerified: boolean;
  licenseVerified: boolean;
  licenseExpiryDate?: string;
  identityDocFront?: string;
  identityDocBack?: string;
  licenseDocFront?: string;
  licenseDocBack?: string;
  dateOfBirth?: string;
  residentialAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  passportPhotoUrl?: string;
  proofOfAddressUrl?: string;
  verificationInfoCorrect?: boolean;
  verificationPoliciesAgreed?: boolean;
  verificationSignature?: string;
  verificationSignedAt?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    residentialAddress: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    verificationInfoCorrect: false,
    verificationPoliciesAgreed: false,
    verificationSignature: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [licenseFront, setLicenseFront] = useState<File | null>(null);
  const [licenseBack, setLicenseBack] = useState<File | null>(null);
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [proofOfAddressFile, setProofOfAddressFile] = useState<File | null>(null);
  const [docUploading, setDocUploading] = useState<string | null>(null);
  const [verificationLink, setVerificationLink] = useState<string | null>(null);
  const [roleSwitching, setRoleSwitching] = useState(false);

  const handleSwitchRole = async (newRole: "host" | "renter") => {
    if (profile?.role === newRole) return;
    setRoleSwitching(true);
    setError("");
    try {
      const res = await fetch("/api/user/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Could not switch mode");
        return;
      }
      setProfile((p) => (p ? { ...p, role: newRole } : null));
      window.location.href = newRole === "host" ? "/dashboard/host" : "/dashboard/renter";
    } catch {
      setError("Something went wrong.");
    } finally {
      setRoleSwitching(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.success || !d.data?.user) {
          window.location.href = "/login?redirect=/profile";
          return;
        }
        fetch("/api/user/profile", { credentials: "include" })
          .then((r2) => r2.json())
          .then((d2) => {
            if (d2.success && d2.data) {
              setProfile(d2.data);
              const d = d2.data;
              setForm({
                firstName: d.firstName || "",
                lastName: d.lastName || "",
                phone: d.phone || "",
                dateOfBirth: d.dateOfBirth || "",
                residentialAddress: d.residentialAddress || "",
                emergencyContactName: d.emergencyContactName || "",
                emergencyContactPhone: d.emergencyContactPhone || "",
                verificationInfoCorrect: Boolean(d.verificationInfoCorrect),
                verificationPoliciesAgreed: Boolean(d.verificationPoliciesAgreed),
                verificationSignature: d.verificationSignature || "",
              });
              setAvatarPreview(d2.data.avatar || null);
            }
          })
          .finally(() => setLoading(false));
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone || "",
          dateOfBirth: form.dateOfBirth || "",
          residentialAddress: form.residentialAddress || "",
          emergencyContactName: form.emergencyContactName || "",
          emergencyContactPhone: form.emergencyContactPhone || "",
          verificationInfoCorrect: form.verificationInfoCorrect,
          verificationPoliciesAgreed: form.verificationPoliciesAgreed,
          verificationSignature: form.verificationSignature || "",
          verificationSignedAt: form.verificationSignature ? new Date().toISOString() : "",
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Update failed");
        return;
      }
      setProfile(data.data);
      setMessage("Profile updated.");
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image (JPEG, PNG, GIF, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setError("");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("avatar", avatarFile);
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Upload failed");
        return;
      }
      setProfile((p) => (p ? { ...p, avatar: data.data.avatar } : null));
      setAvatarPreview(data.data.avatar);
      setAvatarFile(null);
      setMessage("Photo updated.");
    } catch {
      setError("Upload failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleResendVerification = async () => {
    setError("");
    setMessage("");
    setVerificationLink(null);
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (data.success) {
        if (data.data?.verificationLink) {
          setVerificationLink(data.data.verificationLink);
          setMessage("Use the link below to verify your email:");
        } else if (data.data?.sent) {
          setMessage("Verification email sent. Check your inbox.");
        } else {
          setMessage("Email already verified.");
        }
      } else {
        setError(data.error || "Could not send email");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setResending(false);
    }
  };

  const handleIdentityUpload = async () => {
    if (!identityFile) return;
    setError("");
    setDocUploading("identity");
    try {
      const fd = new FormData();
      fd.set("identityDocument", identityFile);
      const res = await fetch("/api/user/documents/identity", { method: "POST", credentials: "include", body: fd });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Upload failed");
        return;
      }
      setProfile((p) => (p ? { ...p, identityVerified: true } : null));
      setIdentityFile(null);
      setMessage("Government ID uploaded and verified.");
    } catch {
      setError("Upload failed.");
    } finally {
      setDocUploading(null);
    }
  };

  const handleLicenseUpload = async () => {
    if (!licenseFront || !licenseBack || !licenseExpiry) return;
    setError("");
    setDocUploading("license");
    try {
      const fd = new FormData();
      fd.set("licenseFront", licenseFront);
      fd.set("licenseBack", licenseBack);
      fd.set("expiryDate", licenseExpiry);
      const res = await fetch("/api/user/documents/license", { method: "POST", credentials: "include", body: fd });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Upload failed");
        return;
      }
      setProfile((p) => (p ? { ...p, licenseVerified: data.data.licenseVerified, licenseExpiryDate: data.data.licenseExpiryDate } : null));
      setLicenseFront(null);
      setLicenseBack(null);
      setLicenseExpiry("");
      setMessage(data.data.licenseVerified ? "Driver's licence uploaded and verified." : "Driver's licence uploaded. It has expired – upload a new one to book again.");
    } catch {
      setError("Upload failed.");
    } finally {
      setDocUploading(null);
    }
  };

  const handlePassportUpload = async () => {
    if (!passportFile) return;
    setError("");
    setDocUploading("passport");
    try {
      const fd = new FormData();
      fd.set("passportPhoto", passportFile);
      const res = await fetch("/api/user/documents/passport", { method: "POST", credentials: "include", body: fd });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Upload failed");
        return;
      }
      setProfile((p) => (p ? { ...p, passportPhotoUrl: data.data.passportPhotoUrl } : null));
      setPassportFile(null);
      setMessage("Passport photograph uploaded.");
    } catch {
      setError("Upload failed.");
    } finally {
      setDocUploading(null);
    }
  };

  const handleProofOfAddressUpload = async () => {
    if (!proofOfAddressFile) return;
    setError("");
    setDocUploading("proofOfAddress");
    try {
      const fd = new FormData();
      fd.set("proofOfAddress", proofOfAddressFile);
      const res = await fetch("/api/user/documents/proof-of-address", { method: "POST", credentials: "include", body: fd });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Upload failed");
        return;
      }
      setProfile((p) => (p ? { ...p, proofOfAddressUrl: data.data.proofOfAddressUrl } : null));
      setProofOfAddressFile(null);
      setMessage("Proof of address uploaded.");
    } catch {
      setError("Upload failed.");
    } finally {
      setDocUploading(null);
    }
  };

  const expiryDate = profile?.licenseExpiryDate;
  const licenceExpired = expiryDate ? new Date(expiryDate) <= new Date() : false;

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-white">Profile</h1>
      <p className="mt-1 text-slate-400">Manage your account and photo.</p>

      {!profile.verified && (
        <div className="mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3">
          <p className="text-sm text-amber-200">Verify your email to access all features.</p>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resending}
            className="mt-2 text-sm font-medium text-amber-400 hover:text-amber-300 disabled:opacity-50"
          >
            {resending ? "Sending…" : "Resend verification email"}
          </button>
          {verificationLink && (
            <div className="mt-3">
              <p className="text-xs text-amber-200/80">{message || "Use this link to verify (valid 24 hours):"}</p>
              <a href={verificationLink} className="mt-1 block break-all text-sm text-amber-300 underline hover:text-amber-200">
                {verificationLink}
              </a>
            </div>
          )}
        </div>
      )}

      {licenceExpired && (
        <div className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-200">Your driver's licence has expired. Upload a new one below to book cars again.</p>
        </div>
      )}

      <div className="card mt-6 p-6">
        <h2 className="font-display text-lg font-bold text-white">Account mode</h2>
        <p className="mt-1 text-sm text-slate-400">Switch between hosting vehicles and renting. You can do both; this only changes which dashboard and actions are in focus.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-400">Currently:</span>
          <span className="rounded bg-slate-700 px-2 py-1 text-sm font-medium text-amber-400 capitalize">{profile.role === "admin" ? "Admin" : profile.role}</span>
          {profile.role !== "admin" && (
            <>
              <button
                type="button"
                onClick={() => handleSwitchRole("host")}
                disabled={roleSwitching || profile.role === "host"}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 disabled:border-slate-600 disabled:bg-transparent disabled:text-slate-500"
              >
                {roleSwitching ? "Switching…" : "Switch to Host"}
              </button>
              <button
                type="button"
                onClick={() => handleSwitchRole("renter")}
                disabled={roleSwitching || profile.role === "renter"}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 border-slate-500 bg-slate-700/50 text-slate-300 hover:bg-slate-600 disabled:border-slate-600 disabled:bg-slate-800 disabled:text-slate-500"
              >
                Switch to Renter
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card mt-6 p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="shrink-0">
            <div className="relative h-24 w-24 overflow-hidden rounded-full bg-slate-700 ring-2 ring-slate-600">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-slate-400">
                  {profile.firstName[0]}
                  {profile.lastName[0]}
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <label className="cursor-pointer text-center text-sm text-amber-400 hover:text-amber-300">
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleAvatarChange} />
                Choose photo
              </label>
              {avatarFile && (
                <button
                  type="button"
                  onClick={handleAvatarUpload}
                  disabled={saving}
                  className="rounded bg-slate-600 px-3 py-1 text-xs font-medium text-white hover:bg-slate-500 disabled:opacity-50"
                >
                  {saving ? "Uploading…" : "Upload"}
                </button>
              )}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="min-w-0 flex-1 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-400">Email</label>
              <p className="text-white">{profile.email}</p>
              {profile.verified && <span className="text-xs text-green-400">Verified</span>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-400">First name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-400">Last name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-400">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="input-field"
                placeholder="+234..."
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-green-400">{message}</p>}
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? "Saving…" : "Save profile"}
            </button>
          </form>
        </div>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="font-display text-lg font-bold text-white">1. Personal information</h2>
        <p className="mt-1 text-sm text-slate-400">Full name, date of birth, address, and emergency contact. Completed in the form above.</p>
        <ul className="mt-2 list-inside list-disc text-sm text-slate-400">
          <li>Full name: {profile.firstName} {profile.lastName}</li>
          {profile.dateOfBirth && <li>Date of birth: {new Date(profile.dateOfBirth).toLocaleDateString()}</li>}
          {profile.residentialAddress && <li>Residential address: {profile.residentialAddress}</li>}
          {(profile.emergencyContactName || profile.emergencyContactPhone) && (
            <li>Emergency contact: {[profile.emergencyContactName, profile.emergencyContactPhone].filter(Boolean).join(" – ")}</li>
          )}
        </ul>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="font-display text-lg font-bold text-white">2. Identification & documents</h2>
        <p className="mt-1 text-sm text-slate-400">Government-issued ID (International passport, NIN, etc.), passport photograph, and proof of address (utility bill, etc.).</p>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-slate-300">Government-issued ID (International passport, NIN, etc.)</h3>
            {profile.identityVerified ? (
              <p className="mt-1 text-sm text-green-400">✓ ID verified</p>
            ) : (
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <label className="text-sm text-slate-400">
                  <input type="file" accept="image/*,application/pdf" className="ml-1 text-slate-300" onChange={(e) => setIdentityFile(e.target.files?.[0] ?? null)} />
                </label>
                <button type="button" onClick={handleIdentityUpload} disabled={!identityFile || !!docUploading} className="rounded bg-slate-600 px-3 py-1.5 text-sm text-white hover:bg-slate-500 disabled:opacity-50">
                  {docUploading === "identity" ? "Uploading…" : "Upload ID"}
                </button>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-300">Passport photograph</h3>
            {profile.passportPhotoUrl ? (
              <p className="mt-1 text-sm text-green-400">✓ Uploaded</p>
            ) : (
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <label className="text-sm text-slate-400">
                  <input type="file" accept="image/*" className="ml-1 text-slate-300" onChange={(e) => setPassportFile(e.target.files?.[0] ?? null)} />
                </label>
                <button type="button" onClick={handlePassportUpload} disabled={!passportFile || !!docUploading} className="rounded bg-slate-600 px-3 py-1.5 text-sm text-white hover:bg-slate-500 disabled:opacity-50">
                  {docUploading === "passport" ? "Uploading…" : "Upload passport photo"}
                </button>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-300">Proof of address (utility bill, etc.)</h3>
            {profile.proofOfAddressUrl ? (
              <p className="mt-1 text-sm text-green-400">✓ Uploaded</p>
            ) : (
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <label className="text-sm text-slate-400">
                  <input type="file" accept="image/*,application/pdf" className="ml-1 text-slate-300" onChange={(e) => setProofOfAddressFile(e.target.files?.[0] ?? null)} />
                </label>
                <button type="button" onClick={handleProofOfAddressUpload} disabled={!proofOfAddressFile || !!docUploading} className="rounded bg-slate-600 px-3 py-1.5 text-sm text-white hover:bg-slate-500 disabled:opacity-50">
                  {docUploading === "proofOfAddress" ? "Uploading…" : "Upload proof of address"}
                </button>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-300">Driver's licence</h3>
            {profile.licenseExpiryDate && (
              <p className="mt-1 text-sm text-slate-400">
                Expiry: {new Date(profile.licenseExpiryDate).toLocaleDateString()}
                {profile.licenseVerified ? <span className="ml-2 text-green-400">✓ Valid</span> : <span className="ml-2 text-red-400">Expired</span>}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-end gap-3">
              <label className="text-sm text-slate-400">
                Front: <input type="file" accept="image/*,application/pdf" className="ml-1 text-slate-300" onChange={(e) => setLicenseFront(e.target.files?.[0] ?? null)} />
              </label>
              <label className="text-sm text-slate-400">
                Back: <input type="file" accept="image/*,application/pdf" className="ml-1 text-slate-300" onChange={(e) => setLicenseBack(e.target.files?.[0] ?? null)} />
              </label>
              <label className="text-sm text-slate-400">
                Expiry date: <input type="date" value={licenseExpiry} onChange={(e) => setLicenseExpiry(e.target.value)} className="input-field ml-1 inline-block w-auto" />
              </label>
              <button type="button" onClick={handleLicenseUpload} disabled={!licenseFront || !licenseBack || !licenseExpiry || !!docUploading} className="rounded bg-slate-600 px-3 py-1.5 text-sm text-white hover:bg-slate-500 disabled:opacity-50">
                {docUploading === "license" ? "Uploading…" : profile.licenseDocFront ? "Update licence" : "Upload licence"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="font-display text-lg font-bold text-white">3. Agreement & consent</h2>
        <p className="mt-1 text-sm text-slate-400">Confirm your details and agree to driver policies. Save profile to record your signature and date.</p>

        <div className="mt-6 space-y-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={form.verificationInfoCorrect}
              onChange={(e) => setForm((f) => ({ ...f, verificationInfoCorrect: e.target.checked }))}
              className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-sm text-slate-300">I confirm all the information provided is correct.</span>
          </label>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={form.verificationPoliciesAgreed}
              onChange={(e) => setForm((f) => ({ ...f, verificationPoliciesAgreed: e.target.checked }))}
              className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-sm text-slate-300">I agree to abide by the company's driver policies, safety standards, and customer service expectations.</span>
          </label>
          <div className="pt-2">
            <label className="mb-1 block text-sm font-medium text-slate-400">Signature (digital) & date</label>
            <input
              type="text"
              value={form.verificationSignature}
              onChange={(e) => setForm((f) => ({ ...f, verificationSignature: e.target.value }))}
              className="input-field max-w-xs"
              placeholder="Type your full name to sign"
            />
            {profile.verificationSignedAt && (
              <p className="mt-1 text-xs text-slate-500">Signed on {new Date(profile.verificationSignedAt).toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>

      <p className="mt-6">
        <Link href="/" className="text-sm text-slate-400 hover:text-white">← Back to home</Link>
      </p>
    </div>
  );
}
