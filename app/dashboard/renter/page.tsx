"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Booking {
  id: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
}

interface Vehicle {
  id: string;
  title: string;
}

export default function RenterDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.user) setUser(d.data.user);
        else window.location.href = "/login";
      });
  }, []);

  useEffect(() => {
    fetch("/api/bookings?as=renter", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => d.success && setBookings(d.data));
  }, []);

  useEffect(() => {
    const ids = Array.from(new Set(bookings.map((b) => b.vehicleId)));
    ids.forEach((id) => {
      fetch("/api/vehicles/" + id)
        .then((r) => r.json())
        .then((d) => d.success && setVehicles((prev) => ({ ...prev, [id]: d.data })));
    });
  }, [bookings]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-white">Your trips</h1>
      <p className="mt-1 text-slate-400">Booking history and active rentals.</p>

      {bookings.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <p className="text-slate-400">You haven’t booked any trips yet.</p>
          <Link href="/search" className="mt-4 inline-block btn-primary">Find a car</Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {bookings.map((b) => (
            <li key={b.id} className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-white">{vehicles[b.vehicleId]?.title ?? "Vehicle"}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="text-slate-400">Status:</span> <span className="capitalize text-slate-300">{b.status}</span>
                    {" · "}
                    <span className="text-slate-400">Payment:</span> <span className="capitalize text-slate-300">{b.paymentStatus}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold text-amber-400">NGN {b.totalPrice.toLocaleString()}</span>
                  <Link href={"/bookings/" + b.id} className="text-sm text-amber-400 hover:text-amber-300">View details →</Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
