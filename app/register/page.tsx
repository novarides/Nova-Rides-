"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"host" | "renter">(roleParam === "host" ? "host" : "renter");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationLink, setVerificationLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms || !acceptedPrivacy) {
      setError("Please accept Terms and Privacy policy.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          phone: phone || undefined,
          role,
          acceptedTerms,
          acceptedPrivacy,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Registration failed");
        return;
      }
      if (data.data?.verificationLink) {
        setVerificationLink(data.data.verificationLink);
        return;
      }
      router.push("/profile");
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (verificationLink) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 text-green-400 text-2xl">✓</div>
        <h1 className="mt-4 font-display text-2xl font-bold text-white">Account created</h1>
        <p className="mt-2 text-slate-400">Verification email is not configured. Use the link below to verify your email (valid 24 hours):</p>
        <a href={verificationLink} className="mt-4 block break-all rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-300 hover:bg-amber-500/20">
          {verificationLink}
        </a>
        <p className="mt-2 text-xs text-slate-500">Click the link above or copy it to your browser.</p>
        <button type="button" onClick={() => router.push("/profile")} className="mt-6 btn-primary w-full">
          Go to profile
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-white">Create your Nova Rides account</h1>
      <p className="mt-2 text-slate-400">Join as a host or renter.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setRole("renter")}
            className={`flex-1 rounded-lg border py-2 text-sm font-medium transition ${
              role === "renter" ? "border-amber-500 bg-amber-500/20 text-amber-400" : "border-slate-600 text-slate-400 hover:border-slate-500"
            }`}
          >
            Renter
          </button>
          <button
            type="button"
            onClick={() => setRole("host")}
            className={`flex-1 rounded-lg border py-2 text-sm font-medium transition ${
              role === "host" ? "border-amber-500 bg-amber-500/20 text-amber-400" : "border-slate-600 text-slate-400 hover:border-slate-500"
            }`}
          >
            Host
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">First name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Last name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="input-field" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-400">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-400">Phone (optional)</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="+234..." />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-400">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="input-field" />
        </div>
        <label className="flex items-start gap-2">
          <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1 rounded border-slate-600" />
          <span className="text-sm text-slate-400">I accept the <Link href="/terms" className="text-amber-400 hover:underline">Terms & Conditions</Link></span>
        </label>
        <label className="flex items-start gap-2">
          <input type="checkbox" checked={acceptedPrivacy} onChange={(e) => setAcceptedPrivacy(e.target.checked)} className="mt-1 rounded border-slate-600" />
          <span className="text-sm text-slate-400">I accept the <Link href="/privacy" className="text-amber-400 hover:underline">Privacy Policy</Link></span>
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account? <Link href="/login" className="text-amber-400 hover:text-amber-300">Log in</Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16 text-center text-slate-400">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
