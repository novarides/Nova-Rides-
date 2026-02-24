import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/80 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <Link href="/" className="font-display text-lg font-bold text-amber-400">
              Nova Rides
            </Link>
            <p className="mt-2 max-w-xs text-sm text-slate-500">
              Peer-to-peer car sharing. Rent from hosts or list your car.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-300">Product</h3>
              <ul className="mt-3 space-y-2">
                <li><Link href="/search" className="text-sm text-slate-500 hover:text-white">Find a car</Link></li>
                <li><Link href="/search?featured=1" className="text-sm text-slate-500 hover:text-white">Featured</Link></li>
                <li><Link href="/how-it-works" className="text-sm text-slate-500 hover:text-white">How it works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-300">Host</h3>
              <ul className="mt-3 space-y-2">
                <li><Link href="/register?role=host" className="text-sm text-slate-500 hover:text-white">List your car</Link></li>
                <li><Link href="/dashboard/host" className="text-sm text-slate-500 hover:text-white">Host dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-300">Legal</h3>
              <ul className="mt-3 space-y-2">
                <li><Link href="/terms" className="text-sm text-slate-500 hover:text-white">Terms</Link></li>
                <li><Link href="/privacy" className="text-sm text-slate-500 hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-8 border-t border-slate-800 pt-8 text-center text-sm text-slate-600">
          © {new Date().getFullYear()} Nova Rides. Peer-to-peer car sharing.
        </p>
      </div>
    </footer>
  );
}
