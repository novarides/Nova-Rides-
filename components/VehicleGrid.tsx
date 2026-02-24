import Link from "next/link";
import type { Vehicle } from "@/lib/types";

export function VehicleGrid({ vehicles, className = "" }: { vehicles: Vehicle[]; className?: string }) {
  if (!vehicles.length) {
    return (
      <div className={`rounded-xl border border-dashed border-slate-600 bg-slate-800/30 py-16 text-center text-slate-500 ${className}`}>
        No vehicles found. Try different search or check back later.
      </div>
    );
  }

  return (
    <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {vehicles.map((v) => (
        <Link key={v.id} href={`/vehicles/${v.id}`} className="group card block transition hover:ring-2 hover:ring-amber-500/50">
          <div className="aspect-[4/3] bg-slate-700 flex items-center justify-center text-slate-500 text-sm">
            {v.images?.[0] ? (
              <img src={v.images[0]} alt={v.title} className="h-full w-full object-cover" />
            ) : (
              <span>{v.year} {v.make} {v.model}</span>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-white group-hover:text-amber-400">{v.title}</h3>
              {v.featured && (
                <span className="shrink-0 rounded bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                  Featured
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {v.location.city} · {v.vehicleClass}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-semibold text-amber-400">
                {v.currency} {v.pricePerDay.toLocaleString()}
                <span className="text-sm font-normal text-slate-500">/day</span>
              </span>
              {v.rating != null && (
                <span className="text-sm text-slate-400">★ {v.rating} ({v.reviewCount ?? 0})</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
