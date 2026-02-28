"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => d.success && d.data?.user && setUser(d.data.user))
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    window.location.href = "/";
  };

  const handleSwitchAndGo = async (role: "host" | "renter") => {
    if (!user || user.role === role) return;
    setSwitching(true);
    try {
      const res = await fetch("/api/user/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) window.location.href = role === "host" ? "/dashboard/host" : "/dashboard/renter";
    } finally {
      setSwitching(false);
    }
  };

  const linkClass = (active: boolean) =>
    `text-sm font-medium px-3.5 py-2 rounded-lg transition ${active ? "text-[var(--black)] font-semibold bg-[var(--grey-100)]" : "text-[var(--grey-600)] hover:text-[var(--black)] hover:bg-[var(--grey-100)]"}`;

  return (
    <header className="sticky top-0 z-50 flex h-[68px] items-center justify-between border-b border-[var(--grey-200)] bg-[var(--white)] px-6 md:px-12">
      <Link href="/" className="font-display text-xl font-bold tracking-tight text-[var(--black)]">
        Nova<span className="text-[var(--accent)]">Rides</span>
      </Link>
      <nav className="flex items-center gap-1">
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
                      handleSwitchAndGo("host");
                    }
                  }}
                  className={`${linkClass(pathname === "/dashboard/host")} ${switching ? "pointer-events-none opacity-60" : ""}`}
                >
                  Host
                </Link>
                <Link
                  href="/dashboard/renter"
                  onClick={(e) => {
                    if (user.role !== "renter") {
                      e.preventDefault();
                      handleSwitchAndGo("renter");
                    }
                  }}
                  className={`${linkClass(pathname === "/dashboard/renter")} ${switching ? "pointer-events-none opacity-60" : ""}`}
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
                onClick={handleLogout}
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
    </header>
  );
}
