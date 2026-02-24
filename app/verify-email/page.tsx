"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"checking" | "success" | "failed">("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("failed");
      setError("Missing verification link.");
      return;
    }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => {
        setStatus(d.success ? "success" : "failed");
        if (!d.success) setError(d.error || "Verification failed");
      })
      .catch(() => {
        setStatus("failed");
        setError("Something went wrong.");
      });
  }, [token]);

  if (status === "checking") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        <p className="mt-4 text-slate-400">Verifying your email…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 text-green-400 text-2xl">✓</div>
        <h1 className="mt-4 font-display text-xl font-bold text-white">Email verified</h1>
        <p className="mt-2 text-slate-400">Your Nova Rides account is verified. You can now use all features.</p>
        <Link href="/" className="mt-6 inline-block btn-primary">Go to Nova Rides</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-red-400 text-2xl">✕</div>
      <h1 className="mt-4 font-display text-xl font-bold text-white">Verification failed</h1>
      <p className="mt-2 text-slate-400">{error}</p>
      <Link href="/" className="mt-6 inline-block btn-secondary">Back to home</Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-slate-400">Loading…</div>}>
      <VerifyContent />
    </Suspense>
  );
}
