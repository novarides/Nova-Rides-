"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Vehicle } from "@/lib/types";
import { differenceInDays, parseISO } from "date-fns";

export function BookingWidget({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const start = startDate ? parseISO(startDate) : null;
  const end = endDate ? parseISO(endDate) : null;
  const days = start && end ? differenceInDays(end, start) || 1 : 0;
  const subtotal = days * vehicle.pricePerDay;
  const deposit = Math.round(vehicle.pricePerDay * 0.5);
  const total = subtotal + deposit;

  const handleBook = async () => {
    if (!startDate || !endDate) {
      setError("Select start and end dates.");
      return;
    }
    if (days < vehicle.minRentalDays) {
      setError(`Minimum rental is ${vehicle.minRentalDays} days.`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const authCheck = await fetch("/api/auth/me", { credentials: "include" });
      const authData = await authCheck.json();
      if (!authData.success || !authData.data?.user) {
        setLoading(false);
        router.push(`/login?redirect=${encodeURIComponent(`/vehicles/${vehicle.id}`)}`);
        return;
      }
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          vehicleId: vehicle.id,
          startDate,
          endDate,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Booking failed");
        return;
      }
      router.push(`/bookings/${data.data.id}`);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 sticky top-24">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[var(--accent)]">
          {vehicle.currency} {vehicle.pricePerDay.toLocaleString()}
        </span>
        <span className="text-[var(--grey-600)]">/ day</span>
      </div>
      {vehicle.pricePerWeek != null && (
        <p className="mt-1 text-sm text-[var(--grey-600)]">
          {vehicle.currency} {vehicle.pricePerWeek.toLocaleString()} per week
        </p>
      )}
      <div className="mt-6 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--grey-600)]">Start date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--grey-600)]">End date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field"
          />
        </div>
      </div>
      {days > 0 && (
        <div className="mt-4 space-y-2 border-t border-[var(--grey-200)] pt-4 text-sm">
          <div className="flex justify-between text-[var(--grey-600)]">
            <span>{vehicle.currency} {vehicle.pricePerDay.toLocaleString()} × {days} days</span>
            <span>{vehicle.currency} {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[var(--grey-600)]">
            <span>Security deposit</span>
            <span>{vehicle.currency} {deposit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold text-[var(--black)] pt-2">
            <span>Total</span>
            <span>{vehicle.currency} {total.toLocaleString()}</span>
          </div>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleBook}
        disabled={loading}
        className="btn-primary mt-6 w-full disabled:opacity-50"
      >
        {loading ? "Booking…" : vehicle.bookingType === "instant" ? "Book now" : "Request to book"}
      </button>
      <p className="mt-3 text-center text-xs text-[var(--grey-600)]">
        {vehicle.bookingType === "instant" ? "Instant confirmation" : "Host will confirm within 24h"}
      </p>
    </div>
  );
}
