import Link from "next/link";

const SOCIAL_LINKS = [
  {
    label: "X (Twitter)",
    href: "https://x.com/Novarides_",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/novarides_/",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@novarides_",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
  },
];

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
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-300">Follow us</h3>
              <div className="mt-2 flex gap-3">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-slate-400 hover:bg-amber-500/20 hover:text-amber-400 transition"
                    title={s.label}
                    aria-label={s.label}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
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
