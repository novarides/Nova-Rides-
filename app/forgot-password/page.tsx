"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    setResetUrl(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        if (data.data?.resetUrl) setResetUrl(data.data.resetUrl);
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong.");
    }
  };

  if (status === "success") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 text-green-600 text-2xl">✓</div>
        <h1 className="mt-4 font-display text-2xl font-bold text-[var(--black)]">Check your email</h1>
        <p className="mt-2 text-[var(--grey-600)]">
          If an account exists for <strong>{email}</strong>, we’ve sent a link to reset your password. It expires in 1 hour.
        </p>
        {resetUrl && (
          <div className="mt-6 rounded-lg border border-[var(--grey-200)] bg-[var(--grey-100)] p-4">
            <p className="text-sm font-medium text-[var(--black)] mb-2">No email configured? Use this link to reset your password:</p>
            <a href={resetUrl} className="text-[var(--accent)] hover:underline break-all text-sm">
              {resetUrl}
            </a>
            <Link href={resetUrl} className="mt-3 inline-block btn-primary w-full text-center">
              Open reset page
            </Link>
          </div>
        )}
        {!resetUrl && (
          <p className="mt-4 text-sm text-[var(--grey-600)]">
            Didn’t get it? Check spam or <button type="button" onClick={() => { setStatus("idle"); setMessage(""); }} className="text-[var(--accent)] hover:underline">try again</button>.
          </p>
        )}
        <Link href="/login" className="mt-6 inline-block btn-secondary">Back to log in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-[var(--black)]">Forgot password?</h1>
      <p className="mt-2 text-[var(--grey-600)]">Enter your email and we’ll send you a link to reset your password.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--grey-600)]">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
            placeholder="you@example.com"
            disabled={status === "loading"}
          />
        </div>
        {message && <p className="text-sm text-red-600">{message}</p>}
        <button type="submit" disabled={status === "loading"} className="btn-primary w-full disabled:opacity-50">
          {status === "loading" ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--grey-600)]">
        <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">Back to log in</Link>
      </p>
    </div>
  );
}
