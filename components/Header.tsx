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

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-amber-400">
          Nova Rides
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/search"
            className={`text-sm font-medium ${pathname === "/search" ? "text-amber-400" : "text-slate-300 hover:text-white"}`}
          >
            Find a car
          </Link>
          {user ? (
            <>
              <Link
                href={user.role === "host" ? "/dashboard/host" : "/dashboard/renter"}
                className="text-sm font-medium text-slate-300 hover:text-white"
              >
                Dashboard
              </Link>
              <Link href="/profile" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-600" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-medium text-slate-300">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </span>
                )}
                <span className="text-slate-500">{user.firstName} {user.lastName}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-slate-400 hover:text-white"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white">
                Log in
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
