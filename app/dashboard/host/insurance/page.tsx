import Link from "next/link";

export default function HostInsurancePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/dashboard/host/vehicles/new" className="text-sm text-slate-400 hover:text-white">← Back to list your vehicle</Link>
      <h1 className="mt-6 font-display text-2xl font-bold text-white">Vehicle insurance</h1>
      <p className="mt-2 text-slate-400">
        Purchase or manage insurance for your listed vehicles. Our insurance partner integration will be available here soon.
      </p>
      <div className="mt-8 rounded-lg border border-slate-600 bg-slate-800/30 p-6 text-center">
        <p className="text-slate-400">Insurance purchase and API integration coming soon.</p>
        <p className="mt-2 text-sm text-slate-500">You can add the insurance company API here when ready.</p>
        <Link href="/dashboard/host/vehicles" className="mt-6 inline-block btn-secondary">
          Back to my vehicles
        </Link>
      </div>
    </div>
  );
}
