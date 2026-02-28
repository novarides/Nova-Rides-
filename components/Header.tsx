"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HeaderContent } from "./HeaderContent";

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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => d.success && d.data?.user && setUser(d.data.user))
      .catch(() => setUser(null));
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    setMenuOpen(false);
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
      if (data.success) {
        setMenuOpen(false);
        window.location.href = role === "host" ? "/dashboard/host" : "/dashboard/renter";
      }
    } finally {
      setSwitching(false);
    }
  };

  return (
    <HeaderContent
      pathname={pathname}
      user={user}
      switching={switching}
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
      onLogout={handleLogout}
      onSwitchRole={handleSwitchAndGo}
    />
  );
}
