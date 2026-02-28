import Link from "next/link";
import type { Vehicle } from "@/lib/types";

export function VehicleGrid({ vehicles, className = "" }: { vehicles: Vehicle[]; className?: string }) {
  if (!vehicles.length) {
    return (
      <div className={`rounded-[14px] border border-dashed border-[var(--grey-200)] bg-[var(--grey-100)] py-16 text-center text-[var(--grey-600)] ${className}`}>
        No vehicles found. Try different search or check back later.
      </div>
    );
  }

  return (
    <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}>
      {vehicles.map((v, i) => (
        <Link
          key={v.id}
          href={`/vehicles/${v.id}`}
          className="group card block overflow-hidden transition hover:border-[var(--grey-400)] hover:-translate-y-0.5 hover:shadow-lg"
          style={{ animationDelay: `${i * 0.07}s` }}
        >
          <div className="relative h-[200px] w-full bg-[var(--grey-100)]">
            {v.images?.[0] ? (
              <img src={v.images[0]} alt={v.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EBEBEB] to-[#F4F4F4]">
                <svg className="opacity-20" width="120" height="60" viewBox="0 0 120 60" fill="var(--black)">
                  <path d="M10 42h100v4H10zM18 42l8-16h48l10 16H18zm10-4h52l-6-10H32l-4 10zM16 42l-4 2-2-2h6zm88 0l4 2 2-2h-6z" />
                  <circle cx="30" cy="44" r="6" fill="var(--black)" />
                  <circle cx="90" cy="44" r="6" fill="var(--black)" />
                </svg>
              </div>
            )}
            {v.featured && (
              <span className="absolute left-3 top-3 font-display text-[10px] font-bold tracking-wider uppercase text-[var(--black)] bg-[var(--accent)] px-2.5 py-1 rounded-full">
                Featured
              </span>
            )}
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-base font-bold text-[var(--black)] tracking-tight">
                {v.title}
              </h3>
            </div>
            <p className="mt-1 text-xs text-[var(--grey-600)]">
              {v.location.city} · {v.vehicleClass} · {v.year}
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-[var(--grey-200)] pt-3.5">
              <span className="font-display text-lg font-bold text-[var(--black)]">
                ₦{v.pricePerDay.toLocaleString()}
                <span className="font-sans text-xs font-normal text-[var(--grey-600)]"> / day</span>
              </span>
              {v.rating != null && (
                <span className="flex items-center gap-1 text-[13px] font-medium text-[var(--black)]">
                  <span className="text-[var(--accent)]">★</span>
                  {v.rating}
                  <span className="font-normal text-[var(--grey-400)]">({v.reviewCount ?? 0})</span>
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
