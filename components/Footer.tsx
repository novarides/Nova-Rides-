import Link from "next/link";

const SOCIAL_LINKS = [
  {
    label: "X (Twitter)",
    href: "https://x.com/Novarides_",
    icon: (
      <svg className="h-[15px] w-[15px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.738l7.73-8.835L1.254 2.25H8.08l4.261 5.635 5.902-5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/novarides_/",
    icon: (
      <svg className="h-[15px] w-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@novarides_",
    icon: (
      <svg className="h-[15px] w-[15px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-[var(--black)] text-[var(--white)]">
      <div className="mx-auto max-w-6xl px-6 md:px-12 pt-14 pb-10">
        <div className="grid grid-cols-1 gap-10 pb-10 border-b border-white/10 mb-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="font-display text-xl font-bold text-[var(--white)] block mb-3">
              Nova<span className="text-[var(--accent)]">Rides</span>
            </Link>
            <p className="text-[13px] text-[var(--grey-400)] leading-relaxed max-w-[220px] font-light">
              Peer-to-peer car sharing. Rent from trusted hosts or list your own vehicle.
            </p>
            <div className="flex gap-2.5 mt-5">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-transparent text-[var(--white)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 transition"
                  title={s.label}
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display text-xs font-semibold tracking-widest uppercase text-[var(--grey-400)] mb-4">
              Product
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/search" className="text-sm text-white/75 hover:text-white transition">
                Find a car
              </Link>
              <Link href="/search?featured=1" className="text-sm text-white/75 hover:text-white transition">
                Featured
              </Link>
              <Link href="/how-it-works" className="text-sm text-white/75 hover:text-white transition">
                How it works
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-display text-xs font-semibold tracking-widest uppercase text-[var(--grey-400)] mb-4">
              Host
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/register?role=host" className="text-sm text-white/75 hover:text-white transition">
                List your car
              </Link>
              <Link href="/dashboard/host" className="text-sm text-white/75 hover:text-white transition">
                Host dashboard
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-display text-xs font-semibold tracking-widest uppercase text-[var(--grey-400)] mb-4">
              Legal
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/terms" className="text-sm text-white/75 hover:text-white transition">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-white/75 hover:text-white transition">
                Privacy
              </Link>
              <Link href="/dashboard/host/insurance" className="text-sm text-white/75 hover:text-white transition">
                Insurance
              </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--grey-600)]">
            © {new Date().getFullYear()} Nova Rides. Peer-to-peer car sharing.
          </p>
          <p className="text-xs text-[var(--grey-600)]">Built in Lagos 🇳🇬</p>
        </div>
      </div>
    </footer>
  );
}
