"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface RenterSummary {
  id: string;
  firstName: string;
  lastName: string;
  rating: number;
  reviewCount: number;
}

interface HostSummary {
  id: string;
  firstName: string;
  lastName: string;
  rating: number;
  reviewCount: number;
}

interface Booking {
  id: string;
  vehicleId: string;
  hostId?: string;
  renterId?: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  securityDeposit: number;
  status: string;
  paymentStatus: string;
  bookingType: string;
  renterSummary?: RenterSummary;
  hasHostReviewedGuest?: boolean;
  reviewsAboutRenter?: { rating: number; comment: string; createdAt: string }[];
  hostSummary?: HostSummary;
  hasRenterReviewedHost?: boolean;
}

interface Vehicle {
  id: string;
  title: string;
  currency: string;
}

interface PaymentConfig {
  paystack: boolean;
  stripe: boolean;
}

interface CurrentUser {
  id: string;
  role: string;
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  // user/setUser required for isHost and host/renter review UI
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({ paystack: false, stripe: false });
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => d.success && d.data?.user && setUser({ id: d.data.user.id, role: d.data.user.role }));
  }, []);

  useEffect(() => {
    fetch("/api/bookings/" + id, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setBooking(d.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!booking?.vehicleId) return;
    fetch("/api/vehicles/" + booking.vehicleId)
      .then((r) => r.json())
      .then((d) => d.success && setVehicle(d.data));
  }, [booking?.vehicleId]);

  useEffect(() => {
    fetch("/api/payments/config")
      .then((r) => r.json())
      .then((d) => d.success && d.data && setPaymentConfig({ paystack: d.data.paystack, stripe: d.data.stripe }));
  }, []);

  const totalAmount = booking ? booking.totalPrice + booking.securityDeposit : 0;
  const canPay = booking && booking.paymentStatus !== "paid" && (booking.status === "confirmed" || booking.bookingType === "instant");
  const isPending = booking?.status === "pending";
  const isHost = user && booking && booking.hostId === user.id;

  const handleAccept = async () => {
    if (!booking) return;
    const res = await fetch("/api/bookings/" + booking.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: "confirmed" }),
    });
    if (res.ok) {
      const d = await res.json();
      if (d.success) {
        const refetch = await fetch("/api/bookings/" + booking.id, { credentials: "include" });
        const refetchData = await refetch.json();
        if (refetchData.success && refetchData.data) setBooking(refetchData.data);
        else setBooking((b) => (b ? { ...b, status: "confirmed" } : null));
      }
    }
  };

  const handleDecline = async () => {
    if (!booking) return;
    const res = await fetch("/api/bookings/" + booking.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: "rejected" }),
    });
    if (res.ok) {
      const d = await res.json();
      if (d.success) {
        const refetch = await fetch("/api/bookings/" + booking.id, { credentials: "include" });
        const refetchData = await refetch.json();
        if (refetchData.success && refetchData.data) setBooking(refetchData.data);
        else setBooking((b) => (b ? { ...b, status: "rejected" } : null));
      }
    }
  };

  const handleSubmitReview = async () => {
    if (!booking?.renterId) return;
    setReviewError("");
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ bookingId: booking.id, revieweeId: booking.renterId, rating: reviewRating, comment: reviewComment.trim() }) });
      const data = await res.json();
      if (!data.success) { setReviewError(data.error || "Failed"); return; }
      setBooking((b) => (b ? { ...b, hasHostReviewedGuest: true } : null));
      setReviewComment("");
    } catch { setReviewError("Something went wrong."); }
    finally { setSubmittingReview(false); }
  };

  const handleSubmitHostReview = async () => {
    if (!booking?.hostId) return;
    setReviewError("");
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ bookingId: booking.id, revieweeId: booking.hostId, rating: reviewRating, comment: reviewComment.trim() }) });
      const data = await res.json();
      if (!data.success) { setReviewError(data.error || "Failed"); return; }
      setBooking((b) => (b ? { ...b, hasRenterReviewedHost: true } : null));
      setReviewComment("");
    } catch { setReviewError("Something went wrong."); }
    finally { setSubmittingReview(false); }
  };

  const handlePaystack = async () => {
    if (!booking) return;
    setPaying("paystack");
    try {
      const res = await fetch("/api/payments/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const data = await res.json();
      if (data.success && data.data?.authorizationUrl) {
        window.location.href = data.data.authorizationUrl;
        return;
      }
      setPaying(null);
      alert(data.error || "Could not start Paystack payment");
    } catch {
      setPaying(null);
    }
  };

  const handleStripe = async () => {
    if (!booking) return;
    setPaying("stripe");
    try {
      const res = await fetch("/api/payments/stripe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookingId: booking.id, currency: "usd" }),
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
        return;
      }
      setPaying(null);
      alert(data.error || "Could not start Stripe payment");
    } catch {
      setPaying(null);
    }
  };

  const handleSimulatedPay = async () => {
    if (!booking) return;
    setPaying("simulate");
    try {
      const res = await fetch("/api/payments/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bookingId: booking.id,
          amount: totalAmount,
          currency: vehicle?.currency || "NGN",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBooking((b) => (b ? { ...b, paymentStatus: "paid" } : null));
      }
    } finally {
      setPaying(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-[var(--grey-600)]">Booking not found.</p>
        <Link href="/search" className="mt-4 inline-block text-[var(--accent)] hover:opacity-80">Back to search</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href={isHost ? "/dashboard/host" : "/search"} className="text-sm text-[var(--grey-600)] hover:text-[var(--black)]">← Back to {isHost ? "host dashboard" : "search"}</Link>
      <div className="card mt-6 p-6">
        <h1 className="font-display text-xl font-bold text-[var(--black)]">
          {isHost ? (isPending ? "Booking request" : "Booking details") : isPending ? "Booking requested" : "Booking confirmed"}
        </h1>
        {vehicle && <p className="mt-1 text-[var(--grey-600)]">{vehicle.title}</p>}
        {isHost && booking?.renterSummary && (
          <div className="mt-3 rounded-lg border border-[var(--grey-200)] bg-[var(--grey-100)] p-3">
            <p className="text-sm font-medium text-[var(--black)]">Guest: {booking.renterSummary.firstName} {booking.renterSummary.lastName}</p>
            <p className="text-sm text-[var(--grey-600)]">
              {booking.renterSummary.reviewCount > 0 ? <>★ {booking.renterSummary.rating} ({booking.renterSummary.reviewCount} reviews)</> : "No reviews yet"}
            </p>
            {booking.reviewsAboutRenter && booking.reviewsAboutRenter.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-[var(--grey-600)]">Reviews from other hosts</p>
                {booking.reviewsAboutRenter.slice(0, 3).map((r, i) => (
                  <p key={i} className="text-xs text-[var(--grey-600)]">★ {r.rating} — {r.comment || "—"}</p>
                ))}
              </div>
            )}
          </div>
        )}
        <dl className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs text-[var(--grey-600)]">Start</dt>
            <dd className="text-[var(--black)]">{new Date(booking.startDate).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--grey-600)]">End</dt>
            <dd className="text-[var(--black)]">{new Date(booking.endDate).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--grey-600)]">Status</dt>
            <dd className="text-[var(--black)] capitalize">{booking.status}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--grey-600)]">Payment</dt>
            <dd className="text-[var(--black)] capitalize">{booking.paymentStatus}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--grey-600)]">Total</dt>
            <dd className="text-[var(--accent)] font-semibold">
              {vehicle?.currency || "NGN"} {booking.totalPrice.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--grey-600)]">Security deposit</dt>
            <dd className="text-[var(--grey-600)]">{vehicle?.currency || "NGN"} {booking.securityDeposit.toLocaleString()}</dd>
          </div>
        </dl>

        {isPending && !isHost && (
          <p className="mt-6 rounded-lg bg-[var(--accent-light)] border border-[var(--accent)]/30 px-4 py-3 text-sm text-[var(--accent)]">
            Waiting for the host to confirm your request. You’ll be able to pay once it’s confirmed.
          </p>
        )}

        {isHost && isPending && (
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={handleAccept} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">Accept booking</button>
            <button type="button" onClick={handleDecline} className="rounded-lg bg-red-600/80 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">Decline</button>
          </div>
        )}

        {isHost && booking?.status === "completed" && !booking.hasHostReviewedGuest && booking.renterId && (
          <div className="mt-6 rounded-lg border border-[var(--grey-200)] bg-[var(--grey-100)] p-4">
            <h3 className="text-sm font-medium text-[var(--black)]">Rate this guest</h3>
            <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} className="input-field mt-2 py-1.5 text-sm">
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} ★</option>)}
            </select>
            <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} className="input-field mt-2 w-full min-h-[80px] text-sm" placeholder="How was this guest? (optional)" />
            {reviewError && <p className="mt-2 text-sm text-red-400">{reviewError}</p>}
            <button type="button" onClick={handleSubmitReview} disabled={submittingReview} className="mt-3 rounded bg-[var(--accent)] px-3 py-1.5 text-sm text-[var(--black)] hover:opacity-90 disabled:opacity-50">{submittingReview ? "Submitting…" : "Submit review"}</button>
          </div>
        )}

        {isHost && booking?.status === "completed" && booking.hasHostReviewedGuest && (
          <p className="mt-6 text-sm text-green-400">You have reviewed this guest.</p>
        )}

        {!isHost && booking?.status === "completed" && !booking.hasRenterReviewedHost && booking.hostId && (
          <div className="mt-6 rounded-lg border border-[var(--grey-200)] bg-[var(--grey-100)] p-4">
            <h3 className="text-sm font-medium text-[var(--black)]">Rate this host</h3>
            <p className="mt-1 text-xs text-[var(--grey-600)]">How was your experience with {booking.hostSummary?.firstName ?? "the host"}?</p>
            <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} className="input-field mt-2 py-1.5 text-sm">
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} ★</option>)}
            </select>
            <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} className="input-field mt-2 w-full min-h-[80px] text-sm" placeholder="How was your host? (optional)" />
            {reviewError && <p className="mt-2 text-sm text-red-400">{reviewError}</p>}
            <button type="button" onClick={handleSubmitHostReview} disabled={submittingReview} className="mt-3 rounded bg-[var(--accent)] px-3 py-1.5 text-sm text-[var(--black)] hover:opacity-90 disabled:opacity-50">{submittingReview ? "Submitting…" : "Submit review"}</button>
          </div>
        )}

        {!isHost && booking?.status === "completed" && booking.hasRenterReviewedHost && (
          <p className="mt-6 text-sm text-green-400">You have reviewed this host.</p>
        )}

        {canPay && (
          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-[var(--grey-600)]">Pay {vehicle?.currency || "NGN"} {totalAmount.toLocaleString()}</p>
            <div className="flex flex-col gap-2">
              {paymentConfig.paystack && (
                <button
                  type="button"
                  onClick={handlePaystack}
                  disabled={!!paying}
                  className="w-full rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 disabled:opacity-50 transition"
                >
                  {paying === "paystack" ? "Redirecting…" : "Pay with Paystack (NGN – Nigeria)"}
                </button>
              )}
              {paymentConfig.stripe && (
                <button
                  type="button"
                  onClick={handleStripe}
                  disabled={!!paying}
                  className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 disabled:opacity-50 transition"
                >
                  {paying === "stripe" ? "Redirecting…" : "Pay with Card / Stripe (USD – International)"}
                </button>
              )}
              {(!paymentConfig.paystack || !paymentConfig.stripe) && (
                <button
                  type="button"
                  onClick={handleSimulatedPay}
                  disabled={!!paying}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {paying === "simulate" ? "Processing…" : "Pay now (test mode)"}
                </button>
              )}
            </div>
            {!paymentConfig.paystack && !paymentConfig.stripe && (
              <p className="text-xs text-[var(--grey-600)]">Set PAYSTACK_SECRET_KEY and/or STRIPE_SECRET_KEY for live payments.</p>
            )}
          </div>
        )}

        {booking.paymentStatus === "paid" && (
          <p className="mt-6 text-center text-sm text-green-400">Payment complete. Check your dashboard for trip details.</p>
        )}
      </div>
    </div>
  );
}
