"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [auth, setAuth] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.user?.role === "admin") setAuth("ok");
        else setAuth("denied");
      })
      .catch(() => setAuth("denied"));
  }, []);

  if (auth === "loading") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (auth === "denied") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-xl font-bold text-white">Admin access required</h1>
        <p className="mt-2 text-slate-400">Only admins can view this panel.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-white">Admin panel</h1>
      <p className="mt-1 text-slate-400">User management, vehicle approval, bookings, disputes, payouts, analytics.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-6">
          <h2 className="font-medium text-white">User management</h2>
          <p className="mt-1 text-sm text-slate-500">View, suspend, verify users.</p>
        </div>
        <div className="card p-6">
          <h2 className="font-medium text-white">Vehicle moderation</h2>
          <p className="mt-1 text-sm text-slate-500">Approve or reject listings.</p>
        </div>
        <div className="card p-6">
          <h2 className="font-medium text-white">Booking oversight</h2>
          <p className="mt-1 text-sm text-slate-500">Dispute resolution, refunds.</p>
        </div>
        <div className="card p-6">
          <h2 className="font-medium text-white">Platform fees</h2>
          <p className="mt-1 text-sm text-slate-500">Configure fees and payouts.</p>
        </div>
        <div className="card p-6">
          <h2 className="font-medium text-white">Analytics & reports</h2>
          <p className="mt-1 text-sm text-slate-500">Dashboard and exports.</p>
        </div>
        <div className="card p-6">
          <h2 className="font-medium text-white">CMS</h2>
          <p className="mt-1 text-sm text-slate-500">FAQs, policies, promo codes.</p>
        </div>
      </div>
    </div>
  );
}
