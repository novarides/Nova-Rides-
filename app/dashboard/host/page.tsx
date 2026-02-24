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

interface Booking {
  id: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  bookingType: string;
}

export default function HostDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

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
        {vehicles.length === 0 ? (
          <div className="card mt-4 p-8 text-center text-slate-500">
            No vehicles yet. <Link href="/dashboard/host/vehicles/new" className="text-amber-400 hover:underline">List your first car</Link>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {vehicles.map((v) => (
              <li key={v.id} className="card flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-white">{v.title}</p>
                  <p className="text-sm text-slate-500">{v.currency} {v.pricePerDay.toLocaleString()}/day · {v.status}</p>
                </div>
                <Link href={"/vehicles/" + v.id} className="text-sm text-amber-400 hover:text-amber-300">View</Link>
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
                <div>
                  <p className="text-sm text-slate-400">{new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}</p>
                  <p className="font-medium text-white">{b.status} · {b.paymentStatus}</p>
                </div>
                <div className="flex items-center gap-3">
                  {b.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={async () => {
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
                        }}
                        className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
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
                        }}
                        className="rounded bg-red-600/80 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </>
                  )}
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
