"use client";

import { useEffect, useState } from "react";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  verified: boolean;
  banned: boolean;
  bannedAt?: string;
  bannedReason?: string;
  bannedBy?: string;
  createdAt: string;
}

export default function AdminPage() {
  const [auth, setAuth] = useState<"loading" | "ok" | "denied">("loading");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userError, setUserError] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.user?.role === "admin") setAuth("ok");
        else setAuth("denied");
      })
      .catch(() => setAuth("denied"));
  }, []);

  useEffect(() => {
    if (auth !== "ok") return;
    setUsersLoading(true);
    setUserError("");
    fetch("/api/admin/users", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUsers(d.data);
        else setUserError(d.error || "Failed to load users");
      })
      .catch(() => setUserError("Failed to load users"))
      .finally(() => setUsersLoading(false));
  }, [auth]);

  const handleBan = async (userId: string) => {
    const reason = window.prompt("Reason for permanent ban (rule violation):")?.trim() || "Rule violation";
    setActingId(userId);
    setUserError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!data.success) {
        setUserError(data.error || "Failed to ban");
        return;
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, banned: true, bannedAt: new Date().toISOString(), bannedReason: reason }
            : u
        )
      );
    } finally {
      setActingId(null);
    }
  };

  const handleUnban = async (userId: string) => {
    if (!window.confirm("Remove ban for this user?")) return;
    setActingId(userId);
    setUserError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/unban`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) {
        setUserError(data.error || "Failed to unban");
        return;
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, banned: false, bannedAt: undefined, bannedReason: undefined, bannedBy: undefined }
            : u
        )
      );
    } finally {
      setActingId(null);
    }
  };

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

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-white">User management – permanent ban</h2>
        <p className="mt-1 text-sm text-slate-400">Ban users who break rules. Banned users cannot log in or use the platform. Admins cannot be banned.</p>
        {userError && <p className="mt-2 text-sm text-red-400">{userError}</p>}
        {usersLoading ? (
          <div className="card mt-4 p-8 text-center text-slate-400">Loading users…</div>
        ) : (
          <div className="card mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-600 text-slate-400">
                  <th className="p-3 font-medium">User</th>
                  <th className="p-3 font-medium">Role</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-700/50">
                    <td className="p-3">
                      <p className="font-medium text-white">{u.firstName} {u.lastName}</p>
                      <p className="text-slate-400">{u.email}</p>
                      {u.banned && u.bannedReason && (
                        <p className="mt-1 text-xs text-red-400">Ban reason: {u.bannedReason}</p>
                      )}
                    </td>
                    <td className="p-3 text-slate-300 capitalize">{u.role}</td>
                    <td className="p-3">
                      {u.banned ? (
                        <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-400">Banned</span>
                      ) : (
                        <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-400">Active</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {u.role === "admin" ? (
                        <span className="text-xs text-slate-500">—</span>
                      ) : u.banned ? (
                        <button
                          type="button"
                          onClick={() => handleUnban(u.id)}
                          disabled={actingId === u.id}
                          className="rounded bg-slate-600 px-2 py-1 text-xs text-white hover:bg-slate-500 disabled:opacity-50"
                        >
                          {actingId === u.id ? "…" : "Unban"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBan(u.id)}
                          disabled={actingId === u.id}
                          className="rounded bg-red-600/80 px-2 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
                        >
                          {actingId === u.id ? "…" : "Ban"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
