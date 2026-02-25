import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="font-display text-4xl font-bold text-white">404</h1>
      <p className="mt-2 text-slate-400">This page could not be found.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-amber-400"
      >
        Back to home
      </Link>
    </div>
  );
}
