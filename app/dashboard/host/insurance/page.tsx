import Link from "next/link";

export default function HostInsurancePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/dashboard/host/vehicles/new" className="text-sm text-[var(--grey-600)] hover:text-[var(--black)]">← Back to list your vehicle</Link>
      <h1 className="mt-6 font-display text-2xl font-bold text-[var(--black)]">Vehicle insurance</h1>
      <p className="mt-2 text-[var(--grey-600)]">
        Purchase or manage insurance for your listed vehicles. Our insurance partner integration will be available here soon.
      </p>
      <div className="mt-8 rounded-lg border border-[var(--grey-200)] bg-[var(--grey-100)] p-6 text-center">
        <p className="text-[var(--grey-600)]">Insurance purchase and API integration coming soon.</p>
        <p className="mt-2 text-sm text-[var(--grey-600)]">You can add the insurance company API here when ready.</p>
        <Link href="/dashboard/host/vehicles" className="mt-6 inline-block btn-secondary">
          Back to my vehicles
        </Link>
      </div>
    </div>
  );
}
