"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const VEHICLE_CLASSES = ["economy", "compact", "midsize", "fullsize", "luxury", "suv", "van", "sports", "electric"];

export default function NewVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    year: new Date().getFullYear(),
    make: "",
    model: "",
    mileage: 0,
    vehicleClass: "midsize",
    pricePerDay: 0,
    pricePerWeek: 0,
    currency: "NGN",
    minRentalDays: 1,
    bookingType: "approval" as "instant" | "approval",
    location: { city: "", lat: 6.5244, lng: 3.3792 },
    availability: [] as string[],
    images: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to create listing");
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-white">List your vehicle</h1>
      <p className="mt-1 text-slate-400">Add a new car to Nova Rides.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-400">Listing title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            className="input-field"
            placeholder="e.g. Mercedes AMG GLE 63S"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-400">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="input-field"
            placeholder="Describe your vehicle..."
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Year</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
              min={1990}
              max={new Date().getFullYear() + 1}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Make</label>
            <input
              type="text"
              value={form.make}
              onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
              required
              className="input-field"
              placeholder="Toyota"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Model</label>
            <input
              type="text"
              value={form.model}
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              required
              className="input-field"
              placeholder="Camry"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Mileage (km)</label>
            <input
              type="number"
              value={form.mileage || ""}
              onChange={(e) => setForm((f) => ({ ...f, mileage: Number(e.target.value) || 0 }))}
              min={0}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Vehicle class</label>
            <select
              value={form.vehicleClass}
              onChange={(e) => setForm((f) => ({ ...f, vehicleClass: e.target.value as typeof form.vehicleClass }))}
              className="input-field"
            >
              {VEHICLE_CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Price per day (NGN)</label>
            <input
              type="number"
              value={form.pricePerDay || ""}
              onChange={(e) => setForm((f) => ({ ...f, pricePerDay: Number(e.target.value) || 0 }))}
              required
              min={0}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Price per week (NGN, optional)</label>
            <input
              type="number"
              value={form.pricePerWeek || ""}
              onChange={(e) => setForm((f) => ({ ...f, pricePerWeek: Number(e.target.value) || 0 }))}
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
              onChange={(e) => setForm((f) => ({ ...f, minRentalDays: Number(e.target.value) || 1 }))}
              min={1}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Booking type</label>
            <select
              value={form.bookingType}
              onChange={(e) => setForm((f) => ({ ...f, bookingType: e.target.value as "instant" | "approval" }))}
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
            onChange={(e) => setForm((f) => ({ ...f, location: { ...f.location, city: e.target.value } }))}
            required
            className="input-field"
            placeholder="Lagos"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? "Creating…" : "Create listing"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
