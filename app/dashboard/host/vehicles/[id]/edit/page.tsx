"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const VEHICLE_CLASSES = ["economy", "compact", "midsize", "fullsize", "luxury", "suv", "van", "sports", "electric"];
const MILES_TO_KM = 1.60934;
const DEFAULT_MILEAGE_KM = Math.round(200 * MILES_TO_KM);

interface VehicleData {
  id: string;
  hostId: string;
  title: string;
  description: string;
  year: number;
  make: string;
  model: string;
  mileage: number;
  vehicleClass: string;
  pricePerDay: number;
  pricePerWeek?: number;
  currency: string;
  location: { city: string; lat?: number; lng?: number };
  availability: string[];
  minRentalDays: number;
  bookingType: string;
  licensePlate?: string;
  vin?: string;
  color?: string;
  mileagePerDay?: number;
  mileagePerDayUnit?: "km" | "miles";
  status: string;
}

export default function EditVehiclePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleData | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/vehicles/" + id).then((r) => r.json()),
    ]).then(([authRes, vehicleRes]) => {
      if (!authRes.success || !authRes.data?.user) {
        window.location.href = "/login";
        return;
      }
      if (!vehicleRes.success || !vehicleRes.data) {
        setLoadError("Vehicle not found.");
        return;
      }
      const v = vehicleRes.data as VehicleData;
      if (v.hostId !== authRes.data.user.id) {
        setLoadError("You can only edit your own vehicles.");
        return;
      }
      setUserId(authRes.data.user.id);
      setForm({
        ...v,
        location: v.location || { city: "", lat: 6.5244, lng: 3.3792 },
        availability: Array.isArray(v.availability) ? v.availability : [],
        mileagePerDay: v.mileagePerDay ?? DEFAULT_MILEAGE_KM,
        mileagePerDayUnit: (v.mileagePerDayUnit as "km" | "miles") || "km",
      });
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError("");
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        year: form.year,
        make: form.make,
        model: form.model,
        mileage: form.mileage,
        vehicleClass: form.vehicleClass,
        pricePerDay: form.pricePerDay,
        pricePerWeek: form.pricePerWeek || undefined,
        currency: form.currency,
        location: form.location,
        availability: form.availability,
        minRentalDays: form.minRentalDays,
        bookingType: form.bookingType,
        licensePlate: form.licensePlate || undefined,
        vin: form.vin || undefined,
        color: form.color || undefined,
        mileagePerDay: form.mileagePerDay,
        mileagePerDayUnit: form.mileagePerDayUnit,
        status: form.status,
      };
      const res = await fetch("/api/vehicles/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to update");
        return;
      }
      router.push("/dashboard/host/vehicles");
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <p className="text-red-400">{loadError}</p>
        <Link href="/dashboard/host/vehicles" className="mt-4 inline-block text-amber-400 hover:text-amber-300">← Back to my vehicles</Link>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        <p className="mt-4 text-slate-400">Loading…</p>
      </div>
    );
  }

  const mileageMiles = form.mileagePerDayUnit === "miles" ? (form.mileagePerDay ?? 0) : Math.round((form.mileagePerDay || 0) / MILES_TO_KM * 10) / 10;
  const mileageKm = form.mileagePerDayUnit === "km" ? (form.mileagePerDay ?? 0) : Math.round((form.mileagePerDay || 0) * MILES_TO_KM);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/dashboard/host/vehicles" className="text-sm text-slate-400 hover:text-white">← Back to my vehicles</Link>
      <h1 className="mt-6 font-display text-2xl font-bold text-white">Edit your vehicle</h1>
      <p className="mt-1 text-slate-400">Update your listing details.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-400">Listing title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => f ? { ...f, title: e.target.value } : null)}
            required
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-400">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => f ? { ...f, description: e.target.value } : null)}
            rows={3}
            className="input-field"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Year</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm((f) => f ? { ...f, year: Number(e.target.value) } : null)}
              min={1990}
              max={new Date().getFullYear() + 1}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Make</label>
            <input type="text" value={form.make} onChange={(e) => setForm((f) => f ? { ...f, make: e.target.value } : null)} required className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Model</label>
            <input type="text" value={form.model} onChange={(e) => setForm((f) => f ? { ...f, model: e.target.value } : null)} required className="input-field" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">License plate</label>
            <input type="text" value={form.licensePlate || ""} onChange={(e) => setForm((f) => f ? { ...f, licensePlate: e.target.value } : null)} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">VIN</label>
            <input type="text" value={form.vin || ""} onChange={(e) => setForm((f) => f ? { ...f, vin: e.target.value } : null)} className="input-field" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-400">Color</label>
          <input type="text" value={form.color || ""} onChange={(e) => setForm((f) => f ? { ...f, color: e.target.value } : null)} className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-400">Vehicle class</label>
          <select
            value={form.vehicleClass}
            onChange={(e) => setForm((f) => f ? { ...f, vehicleClass: e.target.value } : null)}
            className="input-field"
          >
            {VEHICLE_CLASSES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="rounded-lg border border-slate-600 bg-slate-800/30 p-4">
          <h3 className="text-sm font-medium text-white">Mileage per day (included)</h3>
          <div className="mt-3 flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs text-slate-500">Value</label>
              <input
                type="number"
                value={form.mileagePerDay || ""}
                onChange={(e) => setForm((f) => f ? { ...f, mileagePerDay: Number(e.target.value) || 0 } : null)}
                min={1}
                className="input-field w-28"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Unit</label>
              <select
                value={form.mileagePerDayUnit}
                onChange={(e) => setForm((f) => f ? { ...f, mileagePerDayUnit: e.target.value as "km" | "miles" } : null)}
                className="input-field"
              >
                <option value="km">km</option>
                <option value="miles">miles</option>
              </select>
            </div>
            <p className="text-sm text-slate-400">
              = {form.mileagePerDayUnit === "km" ? mileageMiles.toFixed(1) : mileageKm} {form.mileagePerDayUnit === "km" ? "miles" : "km"} per day
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Price per day ({form.currency})</label>
            <input
              type="number"
              value={form.pricePerDay || ""}
              onChange={(e) => setForm((f) => f ? { ...f, pricePerDay: Number(e.target.value) || 0 } : null)}
              required
              min={0}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Price per week (optional)</label>
            <input
              type="number"
              value={form.pricePerWeek || ""}
              onChange={(e) => setForm((f) => f ? { ...f, pricePerWeek: Number(e.target.value) || 0 } : null)}
              min={0}
              className="input-field"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Min rental days</label>
            <input
              type="number"
              value={form.minRentalDays}
              onChange={(e) => setForm((f) => f ? { ...f, minRentalDays: Number(e.target.value) || 1 } : null)}
              min={1}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Booking type</label>
            <select
              value={form.bookingType}
              onChange={(e) => setForm((f) => f ? { ...f, bookingType: e.target.value } : null)}
              className="input-field"
            >
              <option value="approval">Request to book</option>
              <option value="instant">Instant book</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-400">City</label>
          <input
            type="text"
            value={form.location.city}
            onChange={(e) => setForm((f) => f ? { ...f, location: { ...f.location, city: e.target.value } } : null)}
            required
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-400">Listing status</label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => f ? { ...f, status: e.target.value } : null)}
            className="input-field"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending_approval">Pending approval</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? "Saving…" : "Save changes"}
          </button>
          <Link href={"/vehicles/" + id} className="btn-secondary">View listing</Link>
          <button type="button" onClick={() => router.back()} className="text-slate-400 hover:text-white">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
