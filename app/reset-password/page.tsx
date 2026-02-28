"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage("Invalid reset link. Request a new one from the login page.");
      setStatus("error");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setStatus("error");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords don’t match.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong.");
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 text-center">
        <p className="text-[var(--grey-600)]">This reset link is invalid or missing. Request a new one from the login page.</p>
        <Link href="/forgot-password" className="mt-4 inline-block btn-primary">Request reset link</Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 text-green-600 text-2xl">✓</div>
        <h1 className="mt-4 font-display text-2xl font-bold text-[var(--black)]">Password updated</h1>
        <p className="mt-2 text-[var(--grey-600)]">You can now log in with your new password.</p>
        <Link href="/login" className="mt-6 inline-block btn-primary">Log in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-[var(--black)]">Set new password</h1>
      <p className="mt-2 text-[var(--grey-600)]">Enter your new password below.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--grey-600)]">New password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="input-field"
            placeholder="••••••••"
            disabled={status === "loading"}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--grey-600)]">Confirm password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            className="input-field"
            placeholder="••••••••"
            disabled={status === "loading"}
          />
        </div>
        {message && <p className="text-sm text-red-600">{message}</p>}
        <button type="submit" disabled={status === "loading"} className="btn-primary w-full disabled:opacity-50">
          {status === "loading" ? "Updating…" : "Update password"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--grey-600)]">
        <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">Back to log in</Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16 text-center text-[var(--grey-600)]">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
