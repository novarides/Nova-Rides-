import { notFound } from "next/navigation";
import Link from "next/link";
import { getStore } from "@/lib/store";
import { BookingWidget } from "./BookingWidget";

export default async function VehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getStore();
  const vehicle = store.vehicles.find((v) => v.id === id);
  if (!vehicle || vehicle.status !== "active") notFound();

  const host = store.users.find((u) => u.id === vehicle.hostId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-[16/10] rounded-xl bg-slate-700 overflow-hidden flex items-center justify-center text-slate-500">
            {vehicle.images?.[0] ? (
              <img src={vehicle.images[0]} alt={vehicle.title} className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg">{vehicle.year} {vehicle.make} {vehicle.model}</span>
            )}
          </div>
          <div className="card p-6">
            <h1 className="font-display text-2xl font-bold text-white">{vehicle.title}</h1>
            <p className="mt-2 text-slate-400">
              {vehicle.year} {vehicle.make} {vehicle.model} · {vehicle.vehicleClass}
            </p>
            <p className="mt-4 text-slate-300">{vehicle.description}</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium text-slate-500">Mileage</dt>
                <dd className="mt-1 text-white">{vehicle.mileage.toLocaleString()} km</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Location</dt>
                <dd className="mt-1 text-white">{vehicle.location.city}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Booking</dt>
                <dd className="mt-1 text-white">{vehicle.bookingType === "instant" ? "Instant" : "Request to book"}</dd>
              </div>
            </dl>
          </div>
          {host && (
            <div className="card p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-600 flex items-center justify-center text-slate-300 font-semibold">
                {host.firstName[0]}{host.lastName[0]}
              </div>
              <div>
                <p className="font-medium text-white">
                  {host.firstName} {host.lastName}
                  {host.hostVerifiedBadge && (
                    <span className="ml-2 text-amber-400">✓ Verified host</span>
                  )}
                </p>
                <p className="text-sm text-slate-500">{host.email}</p>
              </div>
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <BookingWidget vehicle={vehicle} />
        </div>
      </div>
    </div>
  );
}
