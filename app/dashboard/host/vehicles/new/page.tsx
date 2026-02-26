"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const VEHICLE_CLASSES = ["economy", "compact", "midsize", "fullsize", "luxury", "suv", "van", "sports", "electric"];
const MILES_TO_KM = 1.60934;
const DEFAULT_MILEAGE_MILES = 200;
const DEFAULT_MILEAGE_KM = Math.round(200 * MILES_TO_KM); // ~322 km

export default function NewVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roadworthinessFile, setRoadworthinessFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [priceRecommendation, setPriceRecommendation] = useState<{ price: number; reasoning: string } | null>(null);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState("");
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
    licensePlate: "",
    vin: "",
    color: "",
    mileagePerDay: DEFAULT_MILEAGE_KM,
    mileagePerDayUnit: "km" as "km" | "miles",
    listingInfoCorrect: false,
    listingPoliciesAgreed: false,
    listingSignature: "",
  });

  const mileageMiles = form.mileagePerDayUnit === "miles" ? form.mileagePerDay : Math.round((form.mileagePerDay / MILES_TO_KM) * 10) / 10;
  const mileageKm = form.mileagePerDayUnit === "km" ? form.mileagePerDay : Math.round(form.mileagePerDay * MILES_TO_KM);

  const handleGetRecommendation = async () => {
    setRecommendError("");
    setPriceRecommendation(null);
    setRecommendLoading(true);
    try {
      const res = await fetch("/api/vehicles/recommend-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          make: form.make,
          model: form.model,
          year: form.year,
          vehicleClass: form.vehicleClass,
          city: form.location.city,
          currency: form.currency,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setRecommendError(data.error || "Could not get recommendation");
        return;
      }
      setPriceRecommendation({
        price: data.data.recommendedPricePerDay,
        reasoning: data.data.reasoning || "Suggested based on vehicle and market.",
      });
    } catch {
      setRecommendError("Something went wrong.");
    } finally {
      setRecommendLoading(false);
    }
  };

  const handleApplyRecommendation = () => {
    if (!priceRecommendation) return;
    setForm((f) => ({ ...f, pricePerDay: priceRecommendation.price }));
    setPriceRecommendation(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const valid = files.filter((f) => f.type.startsWith("image/"));
    if (valid.length + imageFiles.length > 10) {
      setError("Maximum 10 photos. Some were not added.");
      valid.splice(10 - imageFiles.length);
    }
    setImageFiles((prev) => [...prev, ...valid].slice(0, 10));
    const newPreviews = valid.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 10));
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.listingInfoCorrect || !form.listingPoliciesAgreed) {
      setError("Please confirm both agreement checkboxes.");
      return;
    }
    if (!form.listingSignature.trim()) {
      setError("Please sign with your full name.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        listingSignedAt: new Date().toISOString(),
      };
      const useFormData = roadworthinessFile || imageFiles.length > 0;
      if (useFormData) {
        const fd = new FormData();
        fd.set("data", JSON.stringify(payload));
        if (roadworthinessFile) fd.set("roadworthiness", roadworthinessFile);
        imageFiles.forEach((file) => fd.append("images", file));
        const res = await fetch("/api/vehicles", { method: "POST", credentials: "include", body: fd });
        const data = await res.json();
        if (!data.success) {
          setError(data.error || "Failed to create listing");
          return;
        }
      } else {
        const res = await fetch("/api/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.success) {
          setError(data.error || "Failed to create listing");
          return;
        }
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
            <label className="mb-1 block text-sm font-medium text-slate-400">License plate number</label>
            <input
              type="text"
              value={form.licensePlate}
              onChange={(e) => setForm((f) => ({ ...f, licensePlate: e.target.value }))}
              className="input-field"
              placeholder="e.g. ABC 123 XY"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-400">Vehicle Identification Number (VIN)</label>
            <input
              type="text"
              value={form.vin}
              onChange={(e) => setForm((f) => ({ ...f, vin: e.target.value }))}
              className="input-field"
              placeholder="17-character VIN"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-400">Vehicle color</label>
          <input
            type="text"
            value={form.color}
            onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
            className="input-field"
            placeholder="e.g. Black, Silver"
          />
        </div>

        <div className="rounded-lg border border-slate-600 bg-slate-800/30 p-4">
          <h3 className="text-sm font-medium text-white">Vehicle photos</h3>
          <p className="mt-1 text-xs text-slate-400">Upload up to 10 photos so renters can see your car. JPEG, PNG, GIF, or WebP. Max 5MB each.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {imagePreviews.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt="" className="h-20 w-20 rounded-lg object-cover border border-slate-600" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white hover:bg-red-500"
                  aria-label="Remove photo"
                >
                  ×
                </button>
              </div>
            ))}
            {imageFiles.length < 10 && (
              <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-500 bg-slate-800/50 text-slate-400 hover:border-amber-500/50 hover:text-amber-400 transition">
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple className="hidden" onChange={handleImageChange} />
                <span className="text-2xl">+</span>
              </label>
            )}
          </div>
          {imageFiles.length > 0 && <p className="mt-2 text-xs text-slate-500">{imageFiles.length} photo(s) selected</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-400">Vehicle Roadworthiness Certificate</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            className="input-field text-sm text-slate-300"
            onChange={(e) => setRoadworthinessFile(e.target.files?.[0] ?? null)}
          />
          <p className="mt-1 text-xs text-slate-500">Upload a clear image or PDF of the certificate.</p>
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
        <div className="rounded-lg border border-slate-600 bg-slate-800/30 p-4">
          <h3 className="text-sm font-medium text-white">Mileage per day (included)</h3>
          <p className="mt-1 text-xs text-slate-400">Recommended: 200 miles (~322 km) per day included. Excess mileage may incur fees.</p>
          <div className="mt-3 flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs text-slate-500">Value</label>
              <input
                type="number"
                value={form.mileagePerDay || ""}
                onChange={(e) => setForm((f) => ({ ...f, mileagePerDay: Number(e.target.value) || 0 }))}
                min={1}
                className="input-field w-28"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Unit</label>
              <select
                value={form.mileagePerDayUnit}
                onChange={(e) => {
                  const unit = e.target.value as "km" | "miles";
                  setForm((f) => ({
                    ...f,
                    mileagePerDayUnit: unit,
                    mileagePerDay: unit === "km" ? Math.round((f.mileagePerDay || 0) * (unit === "km" ? 1 : 1 / MILES_TO_KM)) : Math.round((f.mileagePerDay || 0) * MILES_TO_KM * 10) / 10,
                  }));
                }}
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
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-400">Price per day ({form.currency})</label>
              <button
                type="button"
                onClick={handleGetRecommendation}
                disabled={recommendLoading}
                className="text-xs font-medium text-amber-400 hover:text-amber-300 disabled:opacity-50"
              >
                {recommendLoading ? "Getting suggestion…" : "Get AI recommendation"}
              </button>
            </div>
            <input
              type="number"
              value={form.pricePerDay || ""}
              onChange={(e) => setForm((f) => ({ ...f, pricePerDay: Number(e.target.value) || 0 }))}
              required
              min={0}
              className="input-field"
            />
            {recommendError && <p className="mt-1 text-xs text-red-400">{recommendError}</p>}
            {priceRecommendation && (
              <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2">
                <p className="text-xs text-amber-200">
                  Suggested: <strong>{form.currency} {priceRecommendation.price.toLocaleString()}</strong>/day
                </p>
                <p className="mt-1 text-xs text-slate-400">{priceRecommendation.reasoning}</p>
                <button
                  type="button"
                  onClick={handleApplyRecommendation}
                  className="mt-2 rounded bg-amber-600 px-2 py-1 text-xs font-medium text-white hover:bg-amber-500"
                >
                  Apply suggestion
                </button>
              </div>
            )}
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

        <div className="rounded-lg border border-slate-600 bg-slate-800/30 p-4">
          <h3 className="text-sm font-medium text-white">Vehicle insurance</h3>
          <p className="mt-1 text-xs text-slate-400">Get cover for your listed vehicle. Purchase or renew insurance through our partner before or after listing.</p>
          <a
            href="/dashboard/host/insurance"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/30 transition"
          >
            Purchase / manage vehicle insurance
            <span className="text-amber-400/80">→</span>
          </a>
        </div>

        <div className="rounded-lg border border-slate-600 bg-slate-800/30 p-4">
          <h3 className="text-sm font-medium text-white">4. Agreement & consent</h3>
          <p className="mt-1 text-xs text-slate-400">Confirm your details and agree to company policies.</p>
          <label className="mt-4 flex items-start gap-3">
            <input
              type="checkbox"
              checked={form.listingInfoCorrect}
              onChange={(e) => setForm((f) => ({ ...f, listingInfoCorrect: e.target.checked }))}
              className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-sm text-slate-300">I confirm all the information provided is correct.</span>
          </label>
          <label className="mt-3 flex items-start gap-3">
            <input
              type="checkbox"
              checked={form.listingPoliciesAgreed}
              onChange={(e) => setForm((f) => ({ ...f, listingPoliciesAgreed: e.target.checked }))}
              className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-sm text-slate-300">I agree to abide by the company's driver policies, safety standards, and customer service expectations.</span>
          </label>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-400">Signature (digital) & date</label>
            <input
              type="text"
              value={form.listingSignature}
              onChange={(e) => setForm((f) => ({ ...f, listingSignature: e.target.value }))}
              className="input-field max-w-xs"
              placeholder="Type your full name to sign"
            />
          </div>
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
