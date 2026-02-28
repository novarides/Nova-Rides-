"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { VehicleGrid } from "@/components/VehicleGrid";
import type { Vehicle } from "@/lib/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const city = searchParams.get("city") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const sort = searchParams.get("sort") || "featured";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const vehicleType = searchParams.get("vehicleType") || "";

    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (sort) params.set("sort", sort);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (vehicleType) params.set("vehicleType", vehicleType);

    setLoading(true);
    fetch(`/api/search?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setVehicles(d.success ? d.data : []);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-12">
      <h1 className="font-display text-2xl font-bold text-[var(--black)]">Find a car</h1>
      <p className="mt-1 text-[var(--grey-600)]">Browse vehicles from Nova Rides hosts.</p>
      {loading ? (
        <div className="mt-8 flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        </div>
      ) : (
        <VehicleGrid vehicles={vehicles} className="mt-8" />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[1200px] px-6 py-12 text-center text-[var(--grey-600)]">Loading…</div>}>
      <SearchContent />
    </Suspense>
  );
}
