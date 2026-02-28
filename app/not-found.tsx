import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="font-display text-4xl font-bold text-[var(--black)]">404</h1>
      <p className="mt-2 text-[var(--grey-600)]">This page could not be found.</p>
      <Link
        href="/"
        className="mt-6 btn-primary"
      >
        Back to home
      </Link>
    </div>
  );
}
