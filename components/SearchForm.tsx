"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchForm() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl flex-wrap items-end gap-3 rounded-xl bg-slate-800/80 p-4 ring-1 ring-slate-700">
      <div className="min-w-[140px] flex-1">
        <label className="mb-1 block text-xs font-medium text-slate-400">Location</label>
        <input
          type="text"
          placeholder="City (e.g. Lagos)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="input-field"
        />
      </div>
      <div className="min-w-[140px]">
        <label className="mb-1 block text-xs font-medium text-slate-400">Start</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="input-field"
        />
      </div>
      <div className="min-w-[140px]">
        <label className="mb-1 block text-xs font-medium text-slate-400">End</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="input-field"
        />
      </div>
      <button type="submit" className="btn-primary whitespace-nowrap">
        Search
      </button>
    </form>
  );
}
