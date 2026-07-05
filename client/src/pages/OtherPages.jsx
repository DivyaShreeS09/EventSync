// ── AnalyticsPage ─────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { useToast }      from "../context/ToastContext";
import { analyticsAPI, usersAPI } from "../api";
import { StatCard, ProgressBar, Avatar, Badge, Btn, EmptyState, PageHeader, RowSkeleton } from "../components/UI";

const CAT_THEMES = {
  Technical: { color: "#E8697A", gradient: "linear-gradient(135deg,#9B2335,#7A1A28)" },
  Cultural:  { color: "#C4435A", gradient: "linear-gradient(135deg,#C4435A,#9B2335)" },
  Sports:    { color: "#34d399", gradient: "linear-gradient(135deg,#10b981,#06b6d4)" },
};

export function AnalyticsPage() {
  const { notify } = useToast();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.get()
      .then((r) => setData(r.data.data))
      .catch((e) => notify(e.response?.data?.error || e.message, "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <PageHeader title="Analytics" subtitle="Platform-wide participation overview" icon="📊" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 12, marginBottom: "2rem" }}>
        {[0,1,2,3,4,5,6,7].map((i) => <div key={i} style={{ height: 100, borderRadius: "var(--r14)" }} className="skeleton" />)}
      </div>
    </div>
  );

  if (!data) return <EmptyState icon="📊" title="Analytics unavailable" sub="Could not load analytics data." />;

  const maxCollege = Math.max(...(data.collegeStats || []).map((c) => c.teamCount), 1);
  const maxCat     = Math.max(...(data.categoryStats || []).map((c) => c.teamCount), 1);
  const maxMonth   = Math.max(...(data.monthlyTeams  || []).map((m) => m.count),     1);

  const STATS = [
    { label: "Total Events",    value: data.totalEvents,    color: "var(--indigo)", icon: "🎪" },
    { label: "Approved Events", value: data.approvedEvents, color: "var(--emerald)",icon: "✅" },
    { label: "Pending Events",  value: data.pendingEvents,  color: "var(--amber)",  icon: "⏳" },
    { label: "Rejected Events", value: data.rejectedEvents, color: "var(--rose)",   icon: "❌" },
    { label: "Total Teams",     value: data.totalTeams,     color: "var(--violet)", icon: "👥" },
    { label: "Approved Teams",  value: data.approvedTeams,  color: "var(--emerald)",icon: "🏆" },
    { label: "Pending Teams",   value: data.pendingTeams,   color: "var(--amber)",  icon: "🔄" },
    { label: "Total Users",     value: data.totalUsers,     color: "var(--cyan)",   icon: "👤" },
  ];

  const PanelCard = ({ children, title, icon }) => (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 18, padding: "1.4rem 1.6rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(155,35,53,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
        <p style={{ margin: 0, fontWeight: 800, color: "var(--text1)", fontSize: 15 }}>{title}</p>
      </div>
      {children}
    </div>
  );

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Platform-wide participation & performance overview." icon="📊" />

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 12, marginBottom: "2rem" }}>
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>

        {/* Category breakdown */}
        <PanelCard title="By Category" icon="🏷">
          {(data.categoryStats || []).map((cs) => {
            const theme = CAT_THEMES[cs.category] || CAT_THEMES.Technical;
            return (
              <div key={cs.category} style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: theme.gradient }} />
                    <span style={{ fontSize: 14, color: "var(--text1)", fontWeight: 700 }}>{cs.category}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text3)" }}>{cs.eventCount} events · <strong style={{ color: theme.color }}>{cs.teamCount}</strong> teams</span>
                </div>
                <ProgressBar value={cs.teamCount} max={maxCat} color={theme.color} />
              </div>
            );
          })}
        </PanelCard>

        {/* Top colleges */}
        <PanelCard title="Top Colleges" icon="🏫">
          {(data.collegeStats || []).length === 0
            ? <p style={{ fontSize: 13, color: "var(--text3)" }}>No data yet</p>
            : (data.collegeStats || []).map((c, i) => (
              <div key={c.college} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
                <span style={{
                  fontSize: 11, fontWeight: 800, color: i < 3 ? "var(--amber)" : "var(--text3)",
                  width: 22, textAlign: "right",
                }}>#{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "var(--text1)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150 }}>{c.college}</span>
                    <span style={{ fontSize: 12, color: "var(--violet)", fontWeight: 700 }}>{c.teamCount}</span>
                  </div>
                  <ProgressBar value={c.teamCount} max={maxCollege} color="var(--burgundy)" />
                </div>
              </div>
            ))
          }
        </PanelCard>
      </div>

      {/* Event capacity */}
      <PanelCard title="Event Capacity (Approved Teams)" icon="📈">
        {(data.capacityStats || []).length === 0
          ? <p style={{ fontSize: 13, color: "var(--text3)" }}>No approved events yet</p>
          : (data.capacityStats || []).map((ev) => (
            <div key={ev.id} style={{ display: "grid", gridTemplateColumns: "200px 1fr 80px", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: "var(--text1)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.name}</span>
              <ProgressBar value={ev.approvedCount} max={ev.maxTeams} />
              <span style={{ fontSize: 12, color: "var(--text3)", textAlign: "right", fontWeight: 600 }}>{ev.approvedCount}/{ev.maxTeams}</span>
            </div>
          ))
        }
      </PanelCard>

      {/* Monthly bar chart */}
      {(data.monthlyTeams || []).length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <PanelCard title="Monthly Team Registrations" icon="📅">
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 100 }}>
              {data.monthlyTeams.map((m) => {
                const pct = Math.round((m.count / maxMonth) * 100);
                return (
                  <div key={m._id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--burgundy)", fontWeight: 800 }}>{m.count}</span>
                    <div style={{
                      width: "100%", height: `${Math.max(pct, 5)}%`,
                      background: "linear-gradient(180deg,var(--burgundy),var(--wine))",
                      borderRadius: "6px 6px 0 0", minHeight: 5,
                      boxShadow: "0 0 10px rgba(155,35,53,0.4)",
                    }} />
                    <span style={{ fontSize: 10, color: "var(--text3)", textAlign: "center" }}>{m._id}</span>
                  </div>
                );
              })}
            </div>
          </PanelCard>
        </div>
      )}
    </div>
  );
}

// ── UsersPage ─────────────────────────────────────────────────────────────────
export function UsersPage() {
  const { notify } = useToast();
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");

  const load = () => {
    usersAPI.getAll()
      .then((r) => setUsers(r.data.data))
      .catch((e) => notify(e.response?.data?.error || e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm("Delete this user?")) return;
    await usersAPI.remove(id);
    notify("User deleted", "error");
    load();
  };

  const filtered = users.filter((u) =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleCounts = {
    Admin:     users.filter((u) => u.role === "Admin").length,
    Organizer: users.filter((u) => u.role === "Organizer").length,
    Student:   users.filter((u) => u.role === "Student").length,
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={`${users.length} registered users across all roles`}
        icon="👤"
        action={
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search users…"
            style={{ width: 220 }}
          />
        }
      />

      {/* Role summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "2rem" }}>
        <StatCard label="Admins"     value={roleCounts.Admin}     color="var(--rose)"    icon="👑" />
        <StatCard label="Organizers" value={roleCounts.Organizer} color="var(--champagne)"   icon="🎯" />
        <StatCard label="Students"   value={roleCounts.Student}   color="var(--burgundy)"  icon="🎓" />
      </div>

      {loading
        ? [0,1,2,3].map((i) => <RowSkeleton key={i} />)
        : filtered.length === 0
        ? <EmptyState icon="👤" title="No users found" sub="No registered users match your search." />
        : (
          <div style={{ display: "grid", gap: 8 }}>
            {filtered.map((u) => (
              <div key={u._id} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "1rem 1.5rem",
                display: "flex", alignItems: "center", gap: 16,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.25)"; e.currentTarget.style.background = "rgba(99,102,241,0.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              >
                <Avatar name={u.name} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: "var(--text1)", fontSize: 14 }}>{u.name}</span>
                    <Badge label={u.role} />
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {u.email} · {u.college || "—"}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: "var(--text3)" }}>{new Date(u.createdAt).toLocaleDateString()}</span>
                  <Btn size="sm" variant="danger" onClick={() => remove(u._id)}>🗑 Delete</Btn>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
