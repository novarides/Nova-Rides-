"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Booking {
  id: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  securityDeposit: number;
  status: string;
  paymentStatus: string;
  bookingType: string;
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

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({ paystack: false, stripe: false });
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);

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
        <p className="text-slate-400">Booking not found.</p>
        <Link href="/search" className="mt-4 inline-block text-amber-400 hover:text-amber-300">Back to search</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/search" className="text-sm text-slate-400 hover:text-white">← Back to search</Link>
      <div className="card mt-6 p-6">
        <h1 className="font-display text-xl font-bold text-white">
          {isPending ? "Booking requested" : "Booking confirmed"}
        </h1>
        {vehicle && <p className="mt-1 text-slate-400">{vehicle.title}</p>}
        <dl className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs text-slate-500">Start</dt>
            <dd className="text-white">{new Date(booking.startDate).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">End</dt>
            <dd className="text-white">{new Date(booking.endDate).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Status</dt>
            <dd className="text-white capitalize">{booking.status}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Payment</dt>
            <dd className="text-white capitalize">{booking.paymentStatus}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Total</dt>
            <dd className="text-amber-400 font-semibold">
              {vehicle?.currency || "NGN"} {booking.totalPrice.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Security deposit</dt>
            <dd className="text-slate-300">{vehicle?.currency || "NGN"} {booking.securityDeposit.toLocaleString()}</dd>
          </div>
        </dl>

        {isPending && (
          <p className="mt-6 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-amber-200">
            Waiting for the host to confirm your request. You’ll be able to pay once it’s confirmed.
          </p>
        )}

        {canPay && (
          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-slate-300">Pay {vehicle?.currency || "NGN"} {totalAmount.toLocaleString()}</p>
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
              <p className="text-xs text-slate-500">Set PAYSTACK_SECRET_KEY and/or STRIPE_SECRET_KEY for live payments.</p>
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
