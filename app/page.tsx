import Link from "next/link";
import { SearchForm } from "@/components/SearchForm";
import { VehicleGrid } from "@/components/VehicleGrid";
import { getStore } from "@/lib/store";

export default async function HomePage() {
  const store = getStore();
  const featured = store.vehicles.filter((v) => v.status === "active").sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <div>
      <section className="relative border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Car sharing, <span className="text-amber-400">reimagined</span>
          </h1>
          <p className="mt-4 text-lg text-slate-400 sm:text-xl">
            Rent from local hosts or list your car. Nova Rides connects you peer-to-peer.
          </p>
          <div className="mt-10">
            <SearchForm />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-white">Featured vehicles</h2>
          <Link href="/search" className="text-sm font-medium text-amber-400 hover:text-amber-300">
            View all →
          </Link>
        </div>
        <VehicleGrid vehicles={featured} className="mt-6" />
      </section>

      <section className="border-t border-slate-800 bg-slate-900/50 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-2xl font-bold text-white text-center">How Nova Rides works</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="card p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-bold">1</div>
              <h3 className="mt-4 font-semibold text-white">Search</h3>
              <p className="mt-2 text-sm text-slate-400">Enter location and dates. Browse cars from verified hosts.</p>
            </div>
            <div className="card p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-bold">2</div>
              <h3 className="mt-4 font-semibold text-white">Book</h3>
              <p className="mt-2 text-sm text-slate-400">Instant book or request. Pay securely on the platform.</p>
            </div>
            <div className="card p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 font-bold">3</div>
              <h3 className="mt-4 font-semibold text-white">Drive</h3>
              <p className="mt-2 text-sm text-slate-400">Meet your host, get the keys, and hit the road.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
