"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PaymentCallbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const bookingId = params.id as string;
  const gateway = searchParams.get("gateway");
  const reference = searchParams.get("reference");
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!gateway || !bookingId) {
      setStatus("failed");
      setError("Invalid callback");
      return;
    }

    if (gateway === "paystack" && reference) {
      fetch(`/api/payments/paystack/verify?reference=${encodeURIComponent(reference)}`)
        .then((r) => r.json())
        .then((d) => {
          setStatus(d.success ? "success" : "failed");
          if (!d.success) setError(d.error || "Verification failed");
        })
        .catch(() => {
          setStatus("failed");
          setError("Network error");
        });
      return;
    }

    if (gateway === "stripe" && sessionId) {
      fetch(`/api/payments/stripe/verify?session_id=${encodeURIComponent(sessionId)}`)
        .then((r) => r.json())
        .then((d) => {
          setStatus(d.success ? "success" : "failed");
          if (!d.success) setError(d.error || "Verification failed");
        })
        .catch(() => {
          setStatus("failed");
          setError("Network error");
        });
      return;
    }

    setStatus("failed");
    setError("Missing reference or session_id");
  }, [gateway, bookingId, reference, sessionId]);

  if (status === "verifying") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        <p className="mt-4 text-[var(--grey-600)]">Confirming your payment…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 text-green-400 text-2xl">✓</div>
        <h1 className="mt-4 font-display text-xl font-bold text-[var(--black)]">Payment successful</h1>
        <p className="mt-2 text-[var(--grey-600)]">Your booking is confirmed and paid.</p>
        <Link href={`/bookings/${bookingId}`} className="mt-6 inline-block btn-primary">
          View booking
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-red-400 text-2xl">✕</div>
      <h1 className="mt-4 font-display text-xl font-bold text-[var(--black)]">Payment failed</h1>
      <p className="mt-2 text-[var(--grey-600)]">{error || "We couldn’t confirm your payment."}</p>
      <Link href={`/bookings/${bookingId}`} className="mt-6 inline-block btn-secondary">
        Back to booking
      </Link>
    </div>
  );
}
