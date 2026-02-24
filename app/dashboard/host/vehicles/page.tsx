"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Vehicle {
  id: string;
  title: string;
  pricePerDay: number;
  currency: string;
  status: string;
}

export default function HostVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.success || !d.data?.user) window.location.href = "/login";
        return d.data.user.id;
      })
      .then((id: string) => {
        if (id) fetch("/api/vehicles?hostId=" + id).then((r) => r.json()).then((d) => d.success && setVehicles(d.data));
      });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">My vehicles</h1>
        <Link href="/dashboard/host/vehicles/new" className="btn-primary">Add vehicle</Link>
      </div>
      {vehicles.length === 0 ? (
        <div className="card mt-8 p-12 text-center text-slate-500">
          No vehicles. <Link href="/dashboard/host/vehicles/new" className="text-amber-400 hover:underline">List your first car</Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {vehicles.map((v) => (
            <li key={v.id} className="card flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-white">{v.title}</p>
                <p className="text-sm text-slate-500">{v.currency} {v.pricePerDay.toLocaleString()}/day · {v.status}</p>
              </div>
              <Link href={"/vehicles/" + v.id} className="text-sm text-amber-400 hover:text-amber-300">Edit / View</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
