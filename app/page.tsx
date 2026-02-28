import Link from "next/link";
import Image from "next/image";
import { SearchForm } from "@/components/SearchForm";
import { VehicleGrid } from "@/components/VehicleGrid";
import { getStore } from "@/lib/store";

const LAGOS_SKYLINE_IMAGE =
  "https://images.unsplash.com/photo-1582575172868-d7e1c8d1f83a?w=1920&q=80";

export default async function HomePage() {
  const store = getStore();
  const featured = store.vehicles
    .filter((v) => v.status === "active")
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <div>
      {/* Hero with Lagos skyline */}
      <section className="relative overflow-hidden bg-[var(--black)] px-6 pt-[72px] pb-14 md:px-12">
        <div className="absolute inset-0">
          <Image
            src={LAGOS_SKYLINE_IMAGE}
            alt="Lagos skyline"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[var(--black)]/75" />
        </div>
        <div className="absolute top-[-60px] right-[-60px] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(232,160,32,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--accent)] mb-4">
            Peer-to-peer rentals
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-[var(--white)] md:text-[44px] md:leading-[1.1] md:tracking-[-1.5px]">
            Find your
            <br />
            perfect drive.
          </h1>
          <p className="mt-2 text-base font-light text-[var(--grey-400)] mb-9">
            Browse verified vehicles from Nova Rides hosts across Lagos.
          </p>
          <SearchForm />
        </div>
      </section>

      {/* Featured vehicles */}
      <section className="mx-auto max-w-[1200px] px-6 py-10 md:px-12 md:py-16">
        <div className="flex items-center justify-between mb-7">
          <h2 className="font-display text-2xl font-bold text-[var(--black)]">
            Featured vehicles
          </h2>
          <Link
            href="/search"
            className="text-sm font-medium text-[var(--grey-600)] hover:text-[var(--black)] transition"
          >
            View all →
          </Link>
        </div>
        <VehicleGrid vehicles={featured} />
      </section>

      {/* How it works */}
      <section className="border-t border-[var(--grey-200)] bg-[var(--grey-100)] px-6 py-16 md:px-12">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="font-display text-2xl font-bold text-[var(--black)] text-center">
            How Nova Rides works
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="card p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]/20 font-display text-lg font-bold text-[var(--accent)]">
                1
              </div>
              <h3 className="mt-4 font-display font-semibold text-[var(--black)]">Search</h3>
              <p className="mt-2 text-sm text-[var(--grey-600)] font-light">
                Enter location and dates. Browse cars from verified hosts.
              </p>
            </div>
            <div className="card p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]/20 font-display text-lg font-bold text-[var(--accent)]">
                2
              </div>
              <h3 className="mt-4 font-display font-semibold text-[var(--black)]">Book</h3>
              <p className="mt-2 text-sm text-[var(--grey-600)] font-light">
                Instant book or request. Pay securely on the platform.
              </p>
            </div>
            <div className="card p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]/20 font-display text-lg font-bold text-[var(--accent)]">
                3
              </div>
              <h3 className="mt-4 font-display font-semibold text-[var(--black)]">Drive</h3>
              <p className="mt-2 text-sm text-[var(--grey-600)] font-light">
                Meet your host, get the keys, and hit the road.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
