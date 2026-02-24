import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">How Nova Rides works</h1>
      <p className="mt-4 text-slate-400">
        Nova Rides is a peer-to-peer car sharing platform. Hosts list their vehicles; renters search, book, and pay through the platform.
      </p>
      <div className="mt-12 space-y-8">
        <section>
          <h2 className="font-display text-xl font-bold text-amber-400">For renters</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-slate-300">
            <li>Search by location and dates.</li>
            <li>Choose instant book or request to book.</li>
            <li>Pay securely; security deposit may apply.</li>
            <li>Meet the host, get the keys, and drive.</li>
            <li>Return the car and leave a review.</li>
          </ol>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-amber-400">For hosts</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-slate-300">
            <li>Create an account and list your vehicle with photos and pricing.</li>
            <li>Set availability and booking type (instant or approval).</li>
            <li>Accept or decline booking requests.</li>
            <li>Hand off the keys and get paid through the platform.</li>
          </ol>
        </section>
      </div>
      <p className="mt-12">
        <Link href="/search" className="text-amber-400 hover:text-amber-300">Find a car →</Link>
      </p>
    </div>
  );
}
