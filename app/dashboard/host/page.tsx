"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Vehicle {
  id: string;
  title: string;
  pricePerDay: number;
  currency: string;
  status: string;
}

interface RenterSummary {
  id: string;
  firstName: string;
  lastName: string;
  rating: number;
  reviewCount: number;
}

interface Booking {
  id: string;
  vehicleId: string;
  renterId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  bookingType: string;
  renterSummary?: RenterSummary;
  hasHostReviewedGuest?: boolean;
  vehicleTitle?: string;
}

export default function HostDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const vehicleIdsWithBookings = new Set(bookings.map((b) => b.vehicleId));

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.user) setUser(d.data.user);
        else window.location.href = "/login";
      });
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetch("/api/vehicles?hostId=" + user.id)
      .then((r) => r.json())
      .then((d) => d.success && setVehicles(d.data));
    fetch("/api/bookings?as=host", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => d.success && setBookings(d.data));
  }, [user?.id]);

  const handleAccept = async (b: Booking) => {
    const res = await fetch("/api/bookings/" + b.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: "confirmed" }),
    });
    if (res.ok) {
      const d = await res.json();
      if (d.success) setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: "confirmed" } : x)));
    }
  };

  const handleDecline = async (b: Booking) => {
    const res = await fetch("/api/bookings/" + b.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: "rejected" }),
    });
    if (res.ok) {
      const d = await res.json();
      if (d.success) setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: "rejected" } : x)));
    }
  };

  const handleDeleteVehicle = async (v: Vehicle) => {
    if (vehicleIdsWithBookings.has(v.id)) return;
    setDeleteError("");
    setDeletingId(v.id);
    try {
      const res = await fetch("/api/vehicles/" + v.id, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (!data.success) {
        setDeleteError(data.error || "Could not delete");
        return;
      }
      setVehicles((prev) => prev.filter((x) => x.id !== v.id));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmitReview = async (b: Booking) => {
    if (!b.renterId) return;
    setReviewError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bookingId: b.id,
          revieweeId: b.renterId,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setReviewError(data.error || "Failed to submit review");
        return;
      }
      setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, hasHostReviewedGuest: true } : x)));
      setReviewingId(null);
      setReviewRating(5);
      setReviewComment("");
    } catch {
      setReviewError("Something went wrong.");
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-white">Host dashboard</h1>
      <p className="mt-1 text-slate-400">Manage your vehicles and bookings.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-6">
          <h2 className="text-sm font-medium text-slate-500">Your vehicles</h2>
          <p className="mt-2 text-2xl font-bold text-white">{vehicles.length}</p>
          <Link href="/dashboard/host/vehicles" className="mt-2 text-sm text-amber-400 hover:text-amber-300">Manage →</Link>
        </div>
        <div className="card p-6">
          <h2 className="text-sm font-medium text-slate-500">Bookings</h2>
          <p className="mt-2 text-2xl font-bold text-white">{bookings.length}</p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-white">My vehicles</h2>
        {deleteError && <p className="mt-2 text-sm text-red-400">{deleteError}</p>}
        {vehicles.length === 0 ? (
          <div className="card mt-4 p-8 text-center text-slate-500">
            No vehicles yet. <Link href="/dashboard/host/vehicles/new" className="text-amber-400 hover:underline">List your first car</Link>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {vehicles.map((v) => (
              <li key={v.id} className="card flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-white">{v.title}</p>
                  <p className="text-sm text-slate-500">{v.currency} {v.pricePerDay.toLocaleString()}/day · {v.status}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={"/dashboard/host/vehicles/" + v.id + "/edit"} className="text-sm text-amber-400 hover:text-amber-300">Edit</Link>
                  <Link href={"/vehicles/" + v.id} className="text-sm text-slate-400 hover:text-white">View</Link>
                  {vehicleIdsWithBookings.has(v.id) ? (
                    <span className="text-xs text-slate-500" title="Cannot delete: vehicle has bookings">Has bookings</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDeleteVehicle(v)}
                      disabled={deletingId === v.id}
                      className="rounded bg-red-600/80 px-2 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
                    >
                      {deletingId === v.id ? "Deleting…" : "Delete"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-white">Recent bookings</h2>
        {bookings.length === 0 ? (
          <div className="card mt-4 p-8 text-center text-slate-500">No bookings yet.</div>
        ) : (
          <ul className="mt-4 space-y-3">
            {bookings.slice(0, 10).map((b) => (
              <li key={b.id} className="card flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  {b.vehicleTitle && <p className="font-medium text-white truncate">{b.vehicleTitle}</p>}
                  <p className="text-sm text-slate-400">{new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}</p>
                  {b.renterSummary && (
                    <p className="mt-1 text-sm text-slate-300">
                      Guest: {b.renterSummary.firstName} {b.renterSummary.lastName}
                      {b.renterSummary.reviewCount > 0 && (
                        <span className="ml-2 text-amber-400">★ {b.renterSummary.rating} ({b.renterSummary.reviewCount} reviews)</span>
                      )}
                      {b.renterSummary.reviewCount === 0 && <span className="ml-2 text-slate-500">No reviews yet</span>}
                    </p>
                  )}
                  <p className="text-sm text-slate-500 capitalize mt-0.5">{b.status} · {b.paymentStatus}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {b.status === "pending" && (
                    <>
                      <button type="button" onClick={() => handleAccept(b)} className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">
                        Accept
                      </button>
                      <button type="button" onClick={() => handleDecline(b)} className="rounded bg-red-600/80 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600">
                        Decline
                      </button>
                    </>
                  )}
                  {b.status === "completed" && !b.hasHostReviewedGuest && (
                    <>
                      {reviewingId !== b.id ? (
                        <button type="button" onClick={() => setReviewingId(b.id)} className="rounded bg-slate-600 px-3 py-1.5 text-sm text-white hover:bg-slate-500">
                          Rate this guest
                        </button>
                      ) : (
                        <div className="rounded-lg border border-slate-600 bg-slate-800/50 p-3 space-y-2 min-w-[200px]">
                          <label className="block text-xs text-slate-400">Rating</label>
                          <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} className="input-field py-1 text-sm">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <option key={n} value={n}>{n} ★</option>
                            ))}
                          </select>
                          <label className="block text-xs text-slate-400">Comment (optional)</label>
                          <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} className="input-field text-sm min-h-[60px]" placeholder="How was this guest?" />
                          {reviewError && <p className="text-xs text-red-400">{reviewError}</p>}
                          <div className="flex gap-2">
                            <button type="button" onClick={() => handleSubmitReview(b)} className="rounded bg-amber-600 px-2 py-1 text-xs text-white hover:bg-amber-500">Submit</button>
                            <button type="button" onClick={() => { setReviewingId(null); setReviewError(""); }} className="rounded bg-slate-600 px-2 py-1 text-xs text-slate-300 hover:bg-slate-500">Cancel</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {b.status === "completed" && b.hasHostReviewedGuest && <span className="text-xs text-green-400">✓ Reviewed</span>}
                  <span className="text-amber-400 font-medium">{b.totalPrice.toLocaleString()} NGN</span>
                  <Link href={"/bookings/" + b.id} className="text-sm text-slate-400 hover:text-white">View</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
