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
    <form onSubmit={handleSubmit} className="flex max-w-[640px] items-center gap-2 rounded-xl bg-[var(--white)] px-5 py-1.5 shadow-sm">
      <svg className="h-4 w-4 shrink-0 text-[var(--grey-400)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        placeholder="City, neighbourhood, or car model…"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm text-[var(--black)] placeholder-[var(--grey-400)] outline-none"
      />
      <button type="submit" className="font-display font-semibold text-sm text-[var(--black)] bg-[var(--accent)] hover:bg-[#d4901a] px-5 py-2.5 rounded-lg transition whitespace-nowrap">
        Search
      </button>
    </form>
  );
}
