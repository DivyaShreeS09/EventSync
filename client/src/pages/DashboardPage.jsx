import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth }     from "../context/AuthContext";
import { useToast }    from "../context/ToastContext";
import { eventsAPI, teamsAPI } from "../api";
import { StatCard, Badge, Avatar, Btn, Card, ProgressBar, RowSkeleton } from "../components/UI";

const STAT_ICONS = { "Open Events": "🎪", "My Registrations": "👥", "Pending Review": "⏳", "Approved Teams": "✅", "My Events": "📋", "Approved": "✅", "Awaiting Admin": "🔄", "Teams to Review": "👀", "Total Events": "🎪", "Pending Events": "⏳", "Total Teams": "👥", "Pending Teams": "🔄" };

export default function DashboardPage({ refreshCounts }) {
  const { user }   = useAuth();
  const { notify } = useToast();
  const navigate   = useNavigate();

  const [stats,        setStats]        = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [actionQueue,  setActionQueue]  = useState([]);
  const [loading,      setLoading]      = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [evRes, teamRes] = await Promise.all([eventsAPI.getAll(), teamsAPI.getAll()]);
      const evs   = evRes.data.data;
      const teams = teamRes.data.data;

      if (user.role === "Student") {
        setStats([
          { label: "Open Events",      value: evs.filter((e) => e.regStatus === "Open").length,           color: "var(--indigo)", icon: STAT_ICONS["Open Events"] },
          { label: "My Registrations", value: teams.length,                                                color: "var(--violet)", icon: STAT_ICONS["My Registrations"] },
          { label: "Pending Review",   value: teams.filter((t) => t.approvalStatus === "Pending").length,  color: "var(--amber)",  icon: STAT_ICONS["Pending Review"] },
          { label: "Approved Teams",   value: teams.filter((t) => t.approvalStatus === "Approved").length, color: "var(--emerald)",icon: STAT_ICONS["Approved Teams"] },
        ]);
        setRecentEvents(evs.slice(0, 5));
      } else if (user.role === "Organizer") {
        const pending = teams.filter((t) => t.approvalStatus === "Pending");
        setStats([
          { label: "My Events",       value: evs.length,                                                    color: "var(--indigo)", icon: STAT_ICONS["My Events"] },
          { label: "Approved",        value: evs.filter((e) => e.approvalStatus === "Approved").length,     color: "var(--emerald)",icon: STAT_ICONS["Approved"] },
          { label: "Awaiting Admin",  value: evs.filter((e) => e.approvalStatus === "Pending").length,      color: "var(--amber)",  icon: STAT_ICONS["Awaiting Admin"] },
          { label: "Teams to Review", value: pending.length,                                                 color: "var(--rose)",   icon: STAT_ICONS["Teams to Review"] },
        ]);
        setRecentEvents(evs.slice(0, 5));
        setActionQueue(pending.slice(0, 4));
      } else {
        const pendingEvs   = evs.filter((e) => e.approvalStatus === "Pending");
        const pendingTeams = teams.filter((t) => t.approvalStatus === "Pending");
        setStats([
          { label: "Total Events",   value: evs.length,          color: "var(--indigo)", icon: STAT_ICONS["Total Events"] },
          { label: "Pending Events", value: pendingEvs.length,   color: "var(--amber)",  icon: STAT_ICONS["Pending Events"] },
          { label: "Total Teams",    value: teams.length,         color: "var(--violet)", icon: STAT_ICONS["Total Teams"] },
          { label: "Pending Teams",  value: pendingTeams.length,  color: "var(--rose)",   icon: STAT_ICONS["Pending Teams"] },
        ]);
        setRecentEvents(evs.slice(0, 5));
        setActionQueue(pendingEvs.slice(0, 3));
      }
    } catch (e) {
      notify(e.response?.data?.error || e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [user.role]);

  useEffect(() => { load(); }, [load]);

  const approveEvent = async (id) => { await eventsAPI.approve(id); notify("Event approved and published! 🎉", "success"); refreshCounts(); load(); };
  const approveTeam  = async (id) => { await teamsAPI.approve(id);  notify("Team approved! ✅", "success");               refreshCounts(); load(); };

  const WORKFLOW = [
    { step: "1", label: "Organizer submits event", role: "Organizer", icon: "📋" },
    { step: "2", label: "Admin approves",          role: "Admin",     icon: "✅" },
    { step: "3", label: "Event goes live",         role: null,        icon: "🎪" },
    { step: "4", label: "Student registers team",  role: "Student",   icon: "👥" },
    { step: "5", label: "Organizer approves team", role: "Organizer", icon: "🏆" },
  ];

  const CAT_BG = { Technical: "linear-gradient(135deg,#9B2335,#7A1A28)", Cultural: "linear-gradient(135deg,#C4435A,#9B2335)", Sports: "linear-gradient(135deg,#10b981,#06b6d4)" };

  return (
    <div>
      {/* ── Hero welcome banner ─────────────────────────────────────── */}
      <div style={{
        borderRadius: 20, marginBottom: "2rem",
        background: "linear-gradient(135deg,rgba(155,35,53,0.18),rgba(196,67,90,0.12))",
        border: "1px solid rgba(155,35,53,0.2)",
        padding: "1.75rem 2rem",
        position: "relative", overflow: "hidden",
      }}>
        <div className="orb" style={{ width: 300, height: 300, top: "-80px", right: "-60px", background: "rgba(196,67,90,0.15)", animationDelay: "0s" }} />
        <div className="orb" style={{ width: 200, height: 200, bottom: "-60px", left: "20%", background: "rgba(155,35,53,0.12)", animationDelay: "-7s" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 6, lineHeight: 1.2 }}>
            Welcome back, <span className="grad-text">{(user.name || "").split(" ")[0]} 👋</span>
          </h1>
          <p style={{ fontSize: 14, color: "var(--text2)", margin: 0 }}>
            Signed in as <strong style={{ color: "var(--indigo)" }}>{user.role}</strong>
            {user.college ? <span style={{ color: "var(--text3)" }}> · {user.college}</span> : ""}
          </p>
        </div>
      </div>

      {/* ── Incomplete profile warning ───────────────────────────────── */}
      {user.role === "Student" && (!user.registerNo || !user.college || !user.program) && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem",
          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: 14, padding: "0.9rem 1.25rem",
        }}>
          <span style={{ fontSize: 18 }}>⚠</span>
          <p style={{ margin: 0, fontSize: 13, color: "var(--amber)", fontWeight: 600 }}>
            Please complete your profile before registering for events. Use the "✏ Profile" button in the header to add your missing details.
          </p>
        </div>
      )}

      {/* ── Approval workflow ───────────────────────────────────────── */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(99,102,241,0.14)",
        borderRadius: 16, padding: "1.25rem 1.75rem", marginBottom: "2rem",
      }}>
        <p style={{ margin: "0 0 12px", fontSize: 11, color: "var(--indigo)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          📋 Approval Workflow
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {WORKFLOW.map((s, i) => {
            const active = s.role === user.role;
            return (
              <React.Fragment key={i}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: active ? "linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.15))" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: "var(--rfull)", padding: "5px 12px",
                  transition: "all 0.2s",
                }}>
                  <span style={{ fontSize: 14 }}>{s.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: active ? 700 : 400, color: active ? "var(--text1)" : "var(--text3)" }}>{s.label}</span>
                </div>
                {i < WORKFLOW.length - 1 && <span style={{ color: "var(--text3)", fontSize: 14 }}>→</span>}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── Stats grid ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: "2rem" }}>
        {loading
          ? [0,1,2,3].map((i) => <div key={i} style={{ height: 100, borderRadius: "var(--r14)" }} className="skeleton" />)
          : (stats || []).map((s) => <StatCard key={s.label} {...s} />)
        }
      </div>

      {/* ── Action queue ───────────────────────────────────────────── */}
      {actionQueue.length > 0 && (
        <div style={{
          background: "rgba(245,158,11,0.06)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 18, padding: "1.25rem 1.5rem", marginBottom: "1.5rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20, animation: "pulse 2s ease-in-out infinite" }}>⏳</span>
              <p style={{ margin: 0, fontWeight: 800, color: "var(--text1)", fontSize: 15 }}>
                {user.role === "Admin" ? "Events" : "Teams"} Awaiting Your Approval
                <span style={{ marginLeft: 8, background: "rgba(245,158,11,0.2)", color: "var(--amber)", fontSize: 12, padding: "2px 9px", borderRadius: 20, fontWeight: 700 }}>{actionQueue.length}</span>
              </p>
            </div>
            <Btn size="sm" variant="warning" onClick={() => navigate(user.role === "Admin" ? "/event-approvals" : "/team-approvals")}>
              Review All →
            </Btn>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {actionQueue.map((item) => (
              <div key={item._id} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "rgba(255,255,255,0.03)", borderRadius: 12,
                padding: "10px 14px",
              }}>
                {user.role === "Admin"
                  ? (item.poster
                      ? <img src={item.poster} alt={item.name} style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, objectFit: "cover" }} />
                      : <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{item.image}</div>)
                  : <Avatar name={item.name} size={36} />
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text3)" }}>
                    {user.role === "Admin"
                      ? `by ${item.organizer?.name || "Organizer"} · ${item.date}`
                      : `${item.college} · ${item.event?.name}`}
                  </p>
                </div>
                <Btn size="sm" variant="success" onClick={() => user.role === "Admin" ? approveEvent(item._id) : approveTeam(item._id)}>✓ Approve</Btn>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent events ───────────────────────────────────────────── */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18, padding: "1.5rem",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎪</div>
            <p style={{ margin: 0, fontWeight: 800, color: "var(--text1)", fontSize: 15 }}>Recent Events</p>
          </div>
          <Btn size="sm" onClick={() => navigate("/events")}>View All →</Btn>
        </div>

        {loading
          ? [0,1,2].map((i) => <RowSkeleton key={i} />)
          : recentEvents.map((ev, i) => (
            <div key={ev._id} onClick={() => navigate(`/events?event=${ev._id}`)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "11px 0",
                borderBottom: i < recentEvents.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.paddingLeft = "8px"}
              onMouseLeave={e => e.currentTarget.style.paddingLeft = "0"}
            >
              {ev.poster ? (
                <img src={ev.poster} alt={ev.name} style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, objectFit: "cover" }} />
              ) : (
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: CAT_BG[ev.category] || "rgba(99,102,241,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>{ev.image}</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text3)" }}>📅 {ev.date} · 📍 {ev.venue}</p>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <Badge label={ev.category} />
                <Badge label={ev.approvalStatus} />
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
