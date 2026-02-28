"use client";

import Link from "next/link";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

type NavItem = { label: string; href: string; guestOnly?: boolean };
const NAV_ITEMS: NavItem[] = [
  { label: "Find a car", href: "/search" },
  { label: "How it works", href: "/how-it-works", guestOnly: true },
];

function linkClass(active: boolean) {
  return "text-sm font-medium px-3.5 py-2 rounded-lg transition " + (active ? "text-[var(--black)] font-semibold bg-[var(--grey-100)]" : "text-[var(--grey-600)] hover:text-[var(--black)] hover:bg-[var(--grey-100)]");
}
function mobileLinkClass(active: boolean) {
  return "block w-full text-left py-4 text-lg font-medium border-b border-[var(--grey-200)] " + (active ? "text-[var(--accent)]" : "text-[var(--black)]");
}

interface HeaderContentProps {
  pathname: string;
  user: User | null;
  switching: boolean;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  onLogout: () => void;
  onSwitchRole: (role: "host" | "renter") => void;
}

export function HeaderContent({
  pathname,
  user,
  switching,
  menuOpen,
  setMenuOpen,
  onLogout,
  onSwitchRole,
}: HeaderContentProps) {
  return (
    <div role="banner" className="sticky top-0 z-50 flex h-[68px] items-center justify-between border-b border-[var(--grey-200)] bg-[var(--white)] px-6 md:px-12">
      <Link href="/" className="font-display text-xl font-bold tracking-tight text-[var(--black)]">
        Nova<span className="text-[var(--accent)]">Rides</span>
      </Link>

      <nav className="hidden md:flex items-center gap-1">
        <Link href="/search" className={linkClass(pathname === "/search" || pathname === "/")}>
          Find a car
        </Link>
        {user ? (
          <>
            {user.role !== "admin" && (
              <>
                <Link
                  href="/dashboard/host"
                  onClick={(e) => {
                    if (user.role !== "host") {
                      e.preventDefault();
                      onSwitchRole("host");
                    }
                  }}
                  className={linkClass(pathname === "/dashboard/host") + (switching ? " pointer-events-none opacity-60" : "")}
                >
                  Host
                </Link>
                <Link
                  href="/dashboard/renter"
                  onClick={(e) => {
                    if (user.role !== "renter") {
                      e.preventDefault();
                      onSwitchRole("renter");
                    }
                  }}
                  className={linkClass(pathname === "/dashboard/renter") + (switching ? " pointer-events-none opacity-60" : "")}
                >
                  Renter
                </Link>
              </>
            )}
            {user.role === "admin" && (
              <Link href="/dashboard/admin" className={linkClass(pathname === "/dashboard/admin")}>
                Dashboard
              </Link>
            )}
            <div className="ml-2 flex items-center gap-3 border-l border-[var(--grey-200)] pl-4">
              <Link href="/profile" className="flex items-center gap-2">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--black)] font-display text-[13px] font-semibold text-[var(--white)]">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </span>
                )}
                <span className="text-sm font-medium text-[var(--black)] hidden sm:inline">
                  {user.firstName} {user.lastName}
                </span>
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="text-[13px] text-[var(--grey-600)] hover:text-[var(--black)] hover:bg-[var(--grey-100)] px-3 py-2 rounded-lg transition"
              >
                Log out
              </button>
            </div>
          </>
        ) : (
          <>
            <Link href="/how-it-works" className={linkClass(pathname === "/how-it-works")}>
              How it works
            </Link>
            <Link href="/login" className={linkClass(pathname === "/login")}>
              Log in
            </Link>
            <Link href="/register" className="btn-primary text-sm ml-1">
              Sign up
            </Link>
          </>
        )}
      </nav>

      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="md:hidden flex flex-col justify-center gap-1.5 w-10 h-10 rounded-lg hover:bg-[var(--grey-100)] transition"
        aria-label="Open menu"
      >
        <span className="block w-6 h-0.5 rounded-full bg-[var(--black)]" />
        <span className="block w-6 h-0.5 rounded-full bg-[var(--black)]" />
        <span className="block w-6 h-0.5 rounded-full bg-[var(--black)]" />
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/40 md:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-sm bg-[var(--white)] shadow-xl md:hidden flex flex-col transform transition-transform duration-200 ease-out translate-x-0">
            <div className="flex items-center justify-between h-[68px] px-6 border-b border-[var(--grey-200)]">
              <Link href="/" onClick={() => setMenuOpen(false)} className="font-display text-xl font-bold text-[var(--black)]">
                Nova<span className="text-[var(--accent)]">Rides</span>
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex flex-col justify-center gap-1.5 w-10 h-10 rounded-lg hover:bg-[var(--grey-100)] transition"
                aria-label="Close menu"
              >
                <span className="block w-6 h-0.5 rounded-full bg-[var(--black)] rotate-45 translate-y-1" />
                <span className="block w-6 h-0.5 rounded-full bg-[var(--black)] -rotate-45 -translate-y-1" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-6 py-4">
              {NAV_ITEMS.filter((item) => !(item.guestOnly && user)).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={mobileLinkClass(pathname === item.href || (item.href === "/search" && pathname === "/"))}
                >
                  {item.label}
                </Link>
              ))}
              {user && (
                <>
                  {user.role !== "admin" && (
                    <>
                      <button
                        type="button"
                        onClick={() => onSwitchRole("host")}
                        disabled={switching}
                        className={mobileLinkClass(pathname === "/dashboard/host") + " border-0"}
                      >
                        Host
                      </button>
                      <button
                        type="button"
                        onClick={() => onSwitchRole("renter")}
                        disabled={switching}
                        className={mobileLinkClass(pathname === "/dashboard/renter") + " border-0"}
                      >
                        Renter
                      </button>
                    </>
                  )}
                  {user.role === "admin" && (
                    <Link href="/dashboard/admin" onClick={() => setMenuOpen(false)} className={mobileLinkClass(pathname === "/dashboard/admin")}>
                      Dashboard
                    </Link>
                  )}
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className={mobileLinkClass(pathname === "/profile")}>
                    Profile
                  </Link>
                  <button type="button" onClick={onLogout} className="block w-full text-left py-4 text-lg font-medium text-[var(--grey-600)] hover:text-[var(--black)]">
                    Log out
                  </button>
                </>
              )}
              {!user && (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className={mobileLinkClass(pathname === "/login")}>
                    Log in
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="block w-full text-left py-4 text-lg font-medium text-[var(--accent)]">
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
