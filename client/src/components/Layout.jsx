import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { notifAPI } from "../api";
import { Avatar, Badge, NotifDot, Spinner } from "./UI";
import EditProfileModal from "./EditProfileModal";

const NAV = {
  Student: [
    { path: "/dashboard",    icon: "🏠", label: "Dashboard" },
    { path: "/events",       icon: "🎪", label: "Browse Events" },
    { path: "/my-teams",     icon: "👥", label: "My Registrations" },
  ],
  Organizer: [
    { path: "/dashboard",        icon: "🏠", label: "Dashboard" },
    { path: "/events",           icon: "🎪", label: "Browse Events" },
    { path: "/my-events",        icon: "📋", label: "My Events",      pendingKey: "pendingEvents" },
    { path: "/team-approvals",   icon: "✅", label: "Team Approvals", pendingKey: "pendingTeams" },
  ],
  Admin: [
    { path: "/dashboard",        icon: "🏠", label: "Dashboard" },
    { path: "/events",           icon: "🎪", label: "All Events" },
    { path: "/event-approvals",  icon: "📋", label: "Event Approvals", pendingKey: "pendingEvents" },
    { path: "/all-teams",        icon: "👥", label: "All Teams",        pendingKey: "pendingTeams" },
    { path: "/users",            icon: "👤", label: "Users" },
    { path: "/analytics",        icon: "📊", label: "Analytics" },
  ],
};

const ROLE_CONFIG = {
  Admin:     { gradient: "linear-gradient(135deg,#9B2335,#C4435A)", icon: "👑" },
  Organizer: { gradient: "linear-gradient(135deg,#7A1A28,#9B2335)", icon: "🎯" },
  Student:   { gradient: "linear-gradient(135deg,#5C0015,#9B2335)", icon: "🎓" },
};

export default function Layout({ children, pendingCounts = {} }) {
  const { user, logout } = useAuth();
  const { notify }       = useToast();
  const navigate         = useNavigate();
  const location         = useLocation();

  const [notifs,      setNotifs]      = useState([]);
  const [showNotifs,  setShowNotifs]  = useState(false);
  const [nLoading,    setNLoading]    = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef();

  const unread = notifs.filter((n) => !n.isRead).length;

  const fetchNotifs = useCallback(async () => {
    try {
      setNLoading(true);
      const res = await notifAPI.getAll();
      setNotifs(res.data.data);
    } catch (_) {}
    finally { setNLoading(false); }
  }, []);

  useEffect(() => {
    fetchNotifs();
    const iv = setInterval(fetchNotifs, 20000);
    return () => clearInterval(iv);
  }, [fetchNotifs]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    notify("Signed out successfully", "info");
    navigate("/login");
  };

  const openNotifs = async () => {
    setShowNotifs((v) => !v);
    if (unread > 0) {
      await notifAPI.readAll().catch(() => {});
      setNotifs((p) => p.map((n) => ({ ...n, isRead: true })));
    }
  };

  const navItems = NAV[user?.role] || [];
  const roleConf = ROLE_CONFIG[user?.role] || {};

  const TYPE_COLORS = {
    success: "var(--emerald)",
    error:   "var(--rose)",
    warning: "var(--amber)",
    info:    "var(--indigo)",
  };

  return (
    <div className="page-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header style={{
        background: "rgba(13,6,8,0.94)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(155,35,53,0.18)",
        padding: "0 1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 62, position: "sticky", top: 0, zIndex: 200,
        boxShadow: "0 4px 32px rgba(0,0,0,0.5)",
      }}>

        {/* Left: Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#9B2335,#7A1A28,#C4435A)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, boxShadow: "0 0 20px rgba(155,35,53,0.5)",
          }}>⚡</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1 }}>
              <span className="grad-text">CampusConnect</span>
            </div>
            <div style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Inter-College</div>
          </div>
        </div>

        {/* Center: Pending pills */}
        <div style={{ display: "flex", gap: 8 }}>
          {user?.role === "Admin" && pendingCounts.pendingEvents > 0 && (
            <button onClick={() => navigate("/event-approvals")} style={{
              background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: "var(--rfull)", padding: "5px 14px", cursor: "pointer",
              color: "var(--amber)", fontSize: 12, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 5,
              animation: "pulse 2s ease-in-out infinite",
            }}>
              ⏳ {pendingCounts.pendingEvents} event{pendingCounts.pendingEvents > 1 ? "s" : ""} pending
            </button>
          )}
          {user?.role === "Organizer" && pendingCounts.pendingTeams > 0 && (
            <button onClick={() => navigate("/team-approvals")} style={{
              background: "rgba(155,35,53,0.15)", border: "1px solid rgba(155,35,53,0.35)",
              borderRadius: "var(--rfull)", padding: "5px 14px", cursor: "pointer",
              color: "#E8697A", fontSize: 12, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 5,
              animation: "pulse 2s ease-in-out infinite",
            }}>
              ⏳ {pendingCounts.pendingTeams} team{pendingCounts.pendingTeams > 1 ? "s" : ""} to review
            </button>
          )}
        </div>

        {/* Right: Notif + User */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

          {/* Notification bell */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button onClick={openNotifs} style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid var(--border2)",
              borderRadius: "var(--r10)", padding: "8px 11px",
              color: unread > 0 ? "#E8697A" : "var(--text2)",
              display: "flex", alignItems: "center", position: "relative",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            >
              {unread > 0 ? "🔔" : "🔕"}
              {unread > 0 && (
                <span style={{
                  position: "absolute", top: -5, right: -5,
                  background: "linear-gradient(135deg,var(--rose),var(--orange))",
                  color: "#fff", fontSize: 9, fontWeight: 800,
                  minWidth: 18, height: 18, borderRadius: 9,
                  display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px",
                  boxShadow: "0 0 10px rgba(244,63,94,0.5)",
                }}>{unread > 9 ? "9+" : unread}</span>
              )}
            </button>

            {showNotifs && (
              <div className="zoom-in" style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0,
                width: 360, background: "rgba(9,9,26,0.97)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: "var(--r16)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.1)",
                zIndex: 300, overflow: "hidden",
                backdropFilter: "blur(20px)",
              }}>
                <div style={{
                  padding: "14px 18px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: "linear-gradient(135deg,rgba(155,35,53,0.18),rgba(122,26,40,0.10))",
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text1)" }}>🔔 Notifications</span>
                  {nLoading && <Spinner size={14} color="var(--burgundy)" />}
                </div>
                <div style={{ maxHeight: 340, overflowY: "auto" }}>
                  {notifs.length === 0
                    ? <p style={{ padding: "2.5rem", textAlign: "center", color: "var(--text3)", fontSize: 13 }}>No notifications yet 🎉</p>
                    : notifs.slice(0, 12).map((n) => (
                      <div key={n._id} style={{
                        padding: "11px 18px", borderBottom: "1px solid var(--border)",
                        background: n.isRead ? "transparent" : "rgba(155,35,53,0.06)",
                        borderLeft: `3px solid ${n.isRead ? "transparent" : (TYPE_COLORS[n.type] || "var(--burgundy)")}`,

                        transition: "background 0.15s",
                      }}>
                        <p style={{ margin: 0, fontSize: 13, color: "var(--text1)", lineHeight: 1.5 }}>{n.message}</p>
                        <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--text3)" }}>
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* User pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--border2)",
            borderRadius: "var(--r12)", padding: "6px 14px 6px 7px",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: roleConf.gradient,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, boxShadow: "0 0 12px rgba(155,35,53,0.4)",
            }}>
              {roleConf.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text1)", fontWeight: 700, lineHeight: 1.2 }}>{(user?.name || "").split(" ")[0]}</p>
              <p style={{ margin: 0, fontSize: 10, color: "var(--text3)" }}>{user?.role}</p>
            </div>
            <button onClick={() => setShowProfile(true)} style={{
              background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
              color: "var(--indigo)", fontSize: 11, fontWeight: 600, marginLeft: 4,
              cursor: "pointer", padding: "3px 10px", borderRadius: "var(--r8)",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,102,241,0.1)"; }}
            >
              ✏ Profile
            </button>
            <button onClick={handleLogout} style={{
              background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)",
              color: "var(--rose)", fontSize: 11, fontWeight: 600, marginLeft: 4,
              cursor: "pointer", padding: "3px 10px", borderRadius: "var(--r8)",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(244,63,94,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(244,63,94,0.1)"; }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1 }}>

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside style={{
          width: 240,
          background: "rgba(13,6,8,0.90)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(155,35,53,0.14)",
          padding: "1.5rem 0 1rem",
          flexShrink: 0, position: "sticky", top: 62,
          height: "calc(100vh - 62px)", overflowY: "auto",
          display: "flex", flexDirection: "column",
        }}>

          {/* Role badge */}
          <div style={{ padding: "0 12px 1.25rem" }}>
            <div style={{
              background: roleConf.gradient,
              borderRadius: "var(--r12)", padding: "12px 14px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -10, right: -10, fontSize: 48, opacity: 0.2 }}>{roleConf.icon}</div>
              <p style={{ margin: "0 0 3px", fontSize: 10, color: "rgba(255,255,255,0.65)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Signed in as</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#fff" }}>{user?.role}</p>
              {user?.college && <p style={{ margin: "3px 0 0", fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{user.college}</p>}
            </div>
          </div>

          {/* Nav label */}
          <div style={{ padding: "0 18px 8px", color: "var(--text3)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Navigation
          </div>

          {/* Nav items */}
          {navItems.map((item) => {
            const active  = location.pathname === item.path;
            const badgeCt = item.pendingKey ? (pendingCounts[item.pendingKey] || 0) : 0;
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                className={active ? "nav-active" : ""}
                style={{
                  display: "flex", alignItems: "center", gap: 11,
                  padding: "11px 18px", cursor: "pointer",
                  fontSize: 14, fontWeight: active ? 600 : 400,
                  color: active ? "var(--text1)" : "var(--text2)",
                  borderLeft: active ? "2px solid var(--indigo)" : "2px solid transparent",
                  background: active ? "linear-gradient(90deg,rgba(155,35,53,0.18),transparent)" : "transparent",
                  transition: "all 0.2s", position: "relative",
                  marginBottom: 2,
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text1)"; }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text2)"; }}}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
                <span>{item.label}</span>
                <NotifDot count={badgeCt} />
              </div>
            );
          })}

          {/* Divider */}
          <div style={{ margin: "1rem 12px", height: 1, background: "var(--border)" }} />

          {/* Workflow info */}
          <div style={{ padding: "0 12px", marginTop: "auto" }}>
            <div style={{
              background: "linear-gradient(135deg,rgba(155,35,53,0.1),rgba(122,26,40,0.06))",
              border: "1px solid rgba(155,35,53,0.22)",
              borderRadius: "var(--r12)", padding: "12px 14px",
            }}>
              <p style={{ margin: "0 0 8px", fontSize: 10, color: "var(--indigo)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                📋 Workflow
              </p>
              {[
                "Organizer submits event",
                "Admin approves / rejects",
                "Student registers team",
                "Organizer approves / rejects",
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: i < 3 ? 6 : 0 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg,var(--burgundy),var(--wine))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, color: "#fff", fontWeight: 800, marginTop: 1,
                  }}>{i + 1}</div>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--text3)", lineHeight: 1.5 }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main style={{ flex: 1, padding: "2rem 2.25rem", overflowX: "hidden", minWidth: 0 }}>
          <div className="fade-in" key={location.pathname}>
            {children}
          </div>
        </main>
      </div>

      {showProfile && <EditProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}
