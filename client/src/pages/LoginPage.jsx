import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth }     from "../context/AuthContext";
import { useToast }    from "../context/ToastContext";
import { Btn, Field, Spinner } from "../components/UI";

const DEMO = [
  { label: "Admin",     email: "admin@eventsync.com",  password: "admin123",   gradient: "linear-gradient(135deg,#f43f5e,#f97316)" },
  { label: "Organizer", email: "meena@eventsync.com",  password: "org123",     gradient: "linear-gradient(135deg,#f59e0b,#f97316)" },
  { label: "Student",   email: "arjun@eventsync.com",  password: "student123", gradient: "linear-gradient(135deg,#6366f1,#06b6d4)" },
];

const TICKER_ITEMS = [
  "🏆 HackVerse 2026 — Registration Open",
  "🎭 Culturanza Fest — April 15",
  "🤖 Robowar Championship — April 18",
  "🏃 Athletics Grand Prix — April 22",
  "🎵 Crescendo Music Fest — May 10",
  "💻 CodeQuest 2026 — May 2",
];

export default function LoginPage() {
  const { login, register } = useAuth();
  const { notify }          = useToast();
  const navigate            = useNavigate();

  const [tab,     setTab]     = useState("login");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [form,    setForm]    = useState({ name: "", email: "", password: "", role: "Student", college: "", registerNo: "", program: "" });
  const [bgIndex, setBgIndex] = useState(0);

  const BG_IMAGES = ["/images/hero-bg.png", "/images/hackathon-bg.png", "/images/cultural-bg.png"];

  useEffect(() => {
    const iv = setInterval(() => setBgIndex(i => (i + 1) % BG_IMAGES.length), 6000);
    return () => clearInterval(iv);
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (tab === "register" && form.role === "Student" && (!form.registerNo.trim() || !form.college.trim() || !form.program.trim())) {
      setError("Register number, college and program are required for student accounts");
      return;
    }
    setLoading(true);
    try {
      if (tab === "login") {
        const user = await login(form.email, form.password);
        notify(`Welcome back, ${user.name.split(" ")[0]}! 🎉`, "success");
      } else {
        const user = await register(form);
        notify(`Welcome to EventSync, ${user.name.split(" ")[0]}! 🚀`, "success");
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (acc) => {
    setLoading(true); setError("");
    try {
      const user = await login(acc.email, acc.password);
      notify(`Signed in as ${user.role} 🎯`, "success");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", position: "relative", overflow: "hidden" }}>

      {/* ── Background image slideshow ── */}
      {BG_IMAGES.map((src, i) => (
        <div key={i} style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${src})`,
          backgroundSize: "cover", backgroundPosition: "center",
          transition: "opacity 1.5s ease",
          opacity: bgIndex === i ? 1 : 0,
          zIndex: 0,
        }} />
      ))}

      {/* ── Overlay ── */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(13,6,8,0.96) 0%, rgba(30,10,14,0.90) 40%, rgba(13,6,8,0.95) 100%)", zIndex: 1 }} />

      {/* ── Animated orbs ── */}
      <div className="orb" style={{ width: 600, height: 600, top: "-15%", left: "-10%", background: "rgba(155,35,53,0.18)", animationDelay: "0s", zIndex: 1 }} />
      <div className="orb" style={{ width: 400, height: 400, bottom: "-10%", right: "-5%", background: "rgba(196,67,90,0.14)", animationDelay: "-5s", zIndex: 1 }} />

      {/* ── Left hero panel ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "3rem 4rem", position: "relative", zIndex: 2,
      }}>
        {/* Logo */}
        <div style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "2.5rem" }}>
            <div style={{
              //width: 52, height: 52, borderRadius: 16,
              //background: "linear-gradient(135deg,#6366f1,#8b5cf6,#d946ef)",
              //display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40//, boxShadow: "0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(139,92,246,0.25)",
              //animation: "glow-pulse 3s ease-in-out infinite",
            }}>🎓</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>
                <span className="grad-text">CampusConnect</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 3 }}>Inter-College Platform</div>
            </div>
          </div>

          <h1 style={{ fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.04em", marginBottom: "1rem" }}>
            Connecting<br />
            <span className="grad-text"> Colleges Through Events</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--text2)", lineHeight: 1.7, maxWidth: 440 }}>
            The premier platform for inter-college event management. Connect students, organizers, and administrators seamlessly.
          </p>
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: "2.5rem" }}>
          {["🏆 Hackathons", "🎭 Cultural Fests", "🏃 Sports Events", "🎵 Music Shows"].map(f => (
            <span key={f} style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(12px)",
              borderRadius: "var(--rfull)",
              padding: "7px 16px", fontSize: 13, color: "var(--text2)",
            }}>{f}</span>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 32 }}>
          {[["6+", "Live Events"], ["50+", "Colleges"], ["100+", "Teams"]].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: 24, fontWeight: 900, background: "linear-gradient(135deg,#C4435A,#9B2335,#C9A84C)", backgroundSize: "200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{n}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        width: "min(480px, 48vw)", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "3rem 3rem", position: "relative", zIndex: 2,
        background: "rgba(9,9,26,0.85)", backdropFilter: "blur(24px)",
        borderLeft: "1px solid rgba(255,255,255,0.07)",
      }}>

        <div className="fade-in">
          {/* Title */}
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text1)", letterSpacing: "-0.03em", marginBottom: 6 }}>
              {tab === "login" ? "Welcome back 👋" : "Join CampusConnect 🚀"}
            </h2>
            <p style={{ fontSize: 13, color: "var(--text3)" }}>
              {tab === "login" ? "Sign in to manage your events and registrations" : "Create your account to get started"}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: "var(--r12)", padding: 4, marginBottom: "1.75rem", border: "1px solid var(--border)" }}>
            {["login", "register"].map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(""); }} style={{
                flex: 1, padding: "10px", borderRadius: "var(--r10)",
                background: tab === t ? "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.3))" : "transparent",
                border: tab === t ? "1px solid rgba(99,102,241,0.4)" : "1px solid transparent",
                color: tab === t ? "#e0e0ff" : "var(--text3)",
                fontWeight: 600, fontSize: 13, cursor: "pointer",
                transition: "all 0.2s",
              }}>
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)",
              borderRadius: "var(--r10)", padding: "11px 14px", marginBottom: "1.25rem",
              fontSize: 13, color: "#fca5a5", display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit}>
            {tab === "register" && (
              <>
                <Field label="Full Name" required>
                  <input value={form.name} onChange={set("name")} placeholder="Your full name" required />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Role">
                    <select value={form.role} onChange={set("role")}>
                      <option>Student</option>
                      <option>Organizer</option>
                    </select>
                  </Field>
                  <Field label="College" required={form.role === "Student"}>
                    <input value={form.college} onChange={set("college")} placeholder="Your college" />
                  </Field>
                </div>
                {form.role === "Student" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Register Number" required>
                      <input value={form.registerNo} onChange={set("registerNo")} placeholder="e.g. 3122225XXXXXX" />
                    </Field>
                    <Field label="Program" required>
                      <input value={form.program} onChange={set("program")} placeholder="e.g. B.E. CSE AIML" />
                    </Field>
                  </div>
                )}
              </>
            )}
            <Field label="Email" required>
              <input type="email" value={form.email} onChange={set("email")} placeholder="you@college.edu" required />
            </Field>
            <Field label="Password" required>
              <input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" required minLength={6} />
            </Field>

            {tab === "login" && (
              <div style={{ textAlign: "right", marginBottom: "0.75rem", marginTop: "-0.5rem" }}>
                <Link to="/forgot-password" style={{ fontSize: 12.5, color: "var(--indigo)", fontWeight: 600, textDecoration: "none" }}>
                  Forgot Password?
                </Link>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px", borderRadius: "var(--r12)",
              background: "linear-gradient(135deg, #9B2335, #7A1A28, #C4435A)",
              backgroundSize: "200% auto",
              color: "#fff", fontWeight: 700, fontSize: 15,
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 8px 32px rgba(155,35,53,0.45)",
              transition: "all 0.2s",
              animation: "gradientShift 4s ease infinite",
              marginTop: 4,
            }}>
              {loading ? <Spinner size={16} color="#fff" /> : (tab === "login" ? "Sign In →" : "Create Account →")}
            </button>
          </form>

          {/* Quick demo login */}
          {tab === "login" && (
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                <span style={{ fontSize: 11, color: "var(--text3)", letterSpacing: "0.08em" }}>QUICK DEMO</span>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {DEMO.map((d) => (
                  <button key={d.label} onClick={() => quickLogin(d)} disabled={loading} style={{
                    padding: "10px 8px", borderRadius: "var(--r10)",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "var(--text2)", fontSize: 12, fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = d.gradient; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "transparent"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text2)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; }}
                  >
                    {loading ? <Spinner size={12} color="currentColor" /> : (
                      <>
                        <span style={{ fontSize: 16 }}>{d.label === "Admin" ? "👑" : d.label === "Organizer" ? "🎯" : "🎓"}</span>
                        <span>{d.label}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Ticker tape at bottom ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3,
        background: "rgba(155,35,53,0.18)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(155,35,53,0.3)",
        padding: "8px 0", overflow: "hidden",
      }}>
        <div className="ticker-wrap">
          <div className="ticker-content" style={{ fontSize: 12, color: "rgba(220,218,255,0.7)", letterSpacing: "0.04em" }}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} style={{ marginRight: "4rem" }}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
