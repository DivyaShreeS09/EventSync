import React, { useState } from "react";

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = "var(--indigo)" }) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      border: `2.5px solid ${color}30`,
      borderTop: `2.5px solid ${color}`,
      borderRadius: "50%",
      animation: "spin 0.75s linear infinite",
      display: "inline-block",
    }} />
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name = "?", size = 36 }) {
  const initials = (name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const gradients = [
    "linear-gradient(135deg,#9B2335,#7A1A28)",
    "linear-gradient(135deg,#7A1A28,#C4435A)",
    "linear-gradient(135deg,#10b981,#06b6d4)",
    "linear-gradient(135deg,#C9A84C,#B8860B)",
    "linear-gradient(135deg,#f43f5e,#f97316)",
    "linear-gradient(135deg,#9B2335,#C4435A)",
  ];
  const grad = gradients[(name || "").charCodeAt(0) % gradients.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: grad,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.34, fontWeight: 800, color: "#fff", flexShrink: 0,
      boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
    }}>{initials}</div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
const BADGE_STYLES = {
  Approved:  { color: "#34d399", bg: "rgba(16,185,129,0.15)",   border: "rgba(16,185,129,0.3)"  },
  Pending:   { color: "#fbbf24", bg: "rgba(245,158,11,0.15)",   border: "rgba(245,158,11,0.3)"  },
  Rejected:  { color: "#fb7185", bg: "rgba(244,63,94,0.15)",    border: "rgba(244,63,94,0.3)"   },
  Open:      { color: "#34d399", bg: "rgba(16,185,129,0.15)",   border: "rgba(16,185,129,0.3)"  },
  Closed:    { color: "#fb7185", bg: "rgba(244,63,94,0.15)",    border: "rgba(244,63,94,0.3)"   },
  Technical: { color: "#818cf8", bg: "rgba(99,102,241,0.15)",   border: "rgba(99,102,241,0.3)"  },
  Cultural:  { color: "#e879f9", bg: "rgba(217,70,239,0.15)",   border: "rgba(217,70,239,0.3)"  },
  Sports:    { color: "#34d399", bg: "rgba(16,185,129,0.15)",   border: "rgba(16,185,129,0.3)"  },
  Admin:     { color: "#fb7185", bg: "rgba(244,63,94,0.15)",    border: "rgba(244,63,94,0.3)"   },
  Organizer: { color: "#fbbf24", bg: "rgba(245,158,11,0.15)",   border: "rgba(245,158,11,0.3)"  },
  Student:   { color: "#818cf8", bg: "rgba(99,102,241,0.15)",   border: "rgba(99,102,241,0.3)"  },
};

export function Badge({ label, prefix }) {
  const s = BADGE_STYLES[label] || { color: "var(--text2)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)" };
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      fontSize: 11, fontWeight: 700,
      padding: "3px 10px", borderRadius: "var(--rfull)",
      display: "inline-flex", alignItems: "center",
      letterSpacing: "0.03em", whiteSpace: "nowrap",
    }}>
      {prefix && <span style={{ marginRight: 4 }}>{prefix}</span>}
      {label}
    </span>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
const BTN_VARIANTS = {
  default: { background: "rgba(255,255,255,0.06)", border: "1px solid var(--border2)", color: "var(--text1)" },
  primary: { background: "linear-gradient(135deg,#9B2335,#7A1A28)", border: "none", color: "#fff" },
  success: { background: "rgba(16,185,129,0.15)",  border: "1px solid rgba(16,185,129,0.35)",  color: "#34d399" },
  danger:  { background: "rgba(244,63,94,0.15)",   border: "1px solid rgba(244,63,94,0.35)",   color: "#fb7185" },
  warning: { background: "rgba(245,158,11,0.15)",  border: "1px solid rgba(245,158,11,0.35)",  color: "#fbbf24" },
  ghost:   { background: "transparent",            border: "1px solid var(--border)",          color: "var(--text2)" },
};
const BTN_SIZES = {
  sm: { padding: "5px 13px", fontSize: 12, borderRadius: "var(--r8)" },
  md: { padding: "9px 20px", fontSize: 13, borderRadius: "var(--r10)" },
  lg: { padding: "12px 28px", fontSize: 15, borderRadius: "var(--r12)" },
};

export function Btn({ children, variant = "default", size = "md", onClick, disabled, loading, style = {}, type = "button", full }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...BTN_VARIANTS[variant],
        ...BTN_SIZES[size],
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        cursor: (disabled || loading) ? "not-allowed" : "pointer",
        opacity: (disabled || loading) ? 0.55 : 1,
        whiteSpace: "nowrap",
        transition: "all 0.2s",
        width: full ? "100%" : undefined,
        boxShadow: variant === "primary" ? "0 4px 20px rgba(155,35,53,0.4)" : undefined,
        ...style,
      }}
    >
      {loading && <Spinner size={12} color="currentColor" />}
      {children}
    </button>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, hover = false, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: hovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? "rgba(155,35,53,0.25)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: "var(--r16)",
        padding: "1.25rem 1.5rem",
        transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered ? "0 20px 50px rgba(155,35,53,0.15)" : "none",
        cursor: onClick ? "pointer" : "default",
        backdropFilter: "blur(10px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, color = "var(--indigo)", icon }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(255,255,255,0.065)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${hov ? "rgba(155,35,53,0.25)" : "rgba(255,255,255,0.08)"}`,        borderRadius: "var(--r14)",
        padding: "1.3rem 1.5rem",
        transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? "0 16px 40px rgba(155,35,53,0.18)" : "none",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 100, height: 100, borderRadius: "50%",
        background: `${color}20`, filter: "blur(30px)",
        pointerEvents: "none",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
        <div>
          <p style={{ margin: "0 0 10px", fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>{label}</p>
          <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color, letterSpacing: "-0.04em", lineHeight: 1 }}>
            {value !== undefined ? value : <Spinner size={22} color={color} />}
          </p>
        </div>
        {icon && (
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: `${color}18`,
            border: `1px solid ${color}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, color,
          }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
export function ProgressBar({ value, max, color = "var(--indigo)" }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const c = pct > 80 ? "var(--rose)" : pct > 55 ? "var(--amber)" : color;
  return (
    <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 6, height: 6, overflow: "hidden" }}>
      <div style={{
        width: `${pct}%`, height: "100%",
        background: `linear-gradient(90deg, ${c}, ${c}99)`,
        borderRadius: 6, transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)",
        boxShadow: `0 0 8px ${c}60`,
      }} />
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, subtitle, onClose, children, wide }) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 500, padding: "1rem",
      }}
    >
      <div className="zoom-in" style={{
        background: "rgba(9,9,26,0.98)",
        border: `1px solid rgba(155,35,53,0.2)`,
        borderRadius: 22,
        padding: "2rem 2.25rem",
        width: "100%",
        maxWidth: wide ? 720 : 560,
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(155,35,53,0.12)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--text1)", letterSpacing: "-0.02em" }}>{title}</h2>
            {subtitle && <p style={{ margin: "5px 0 0", fontSize: 13, color: "var(--text3)" }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
            borderRadius: "var(--r8)", color: "var(--text3)", padding: "5px 11px",
            fontSize: 16, cursor: "pointer", marginLeft: 16,
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(244,63,94,0.1)"; e.currentTarget.style.color = "var(--rose)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text3)"; }}
          >✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
export function Field({ label, error, required, children }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontWeight: 700 }}>
        {label}{required && <span style={{ color: "var(--rose)", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && <p style={{ margin: "5px 0 0", fontSize: 12, color: "var(--rose)" }}>{error}</p>}
    </div>
  );
}

// ── InfoBox ───────────────────────────────────────────────────────────────────
export function InfoBox({ color = "var(--indigo)", icon = "ℹ", children }) {
  return (
    <div style={{
      background: `${color}18`,
      border: `1px solid ${color}30`,
      borderRadius: "var(--r10)",
      padding: "11px 15px",
      marginBottom: "1rem",
      display: "flex", gap: 10, alignItems: "flex-start",
    }}>
      <span style={{ color, fontSize: 15, marginTop: 1, flexShrink: 0 }}>{icon}</span>
      <p style={{ margin: 0, fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon = "🎪", title, sub, action }) {
  return (
    <div style={{ textAlign: "center", padding: "5rem 2rem", color: "var(--text3)" }}>
      <div style={{ fontSize: 56, marginBottom: "1.25rem", animation: "float 3s ease-in-out infinite" }}>{icon}</div>
      <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text2)" }}>{title}</p>
      <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.6 }}>{sub}</p>
      {action && <div style={{ marginTop: "1.75rem" }}>{action}</div>}
    </div>
  );
}

// ── NotifDot ──────────────────────────────────────────────────────────────────
export function NotifDot({ count }) {
  if (!count) return null;
  return (
    <span style={{
      position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
      background: "linear-gradient(135deg,var(--rose),var(--orange))",
      color: "#fff",
      fontSize: 10, fontWeight: 800,
      minWidth: 20, height: 20, borderRadius: 10,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
      boxShadow: "0 0 10px rgba(244,63,94,0.4)",
    }}>
      {count > 9 ? "9+" : count}
    </span>
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action, icon }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {icon && (
            <div style={{
              width: 50, height: 50, borderRadius: 14,
              background: "linear-gradient(135deg,rgba(155,35,53,0.25),rgba(122,26,40,0.15))",
              border: "1px solid rgba(155,35,53,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24,
            }}>{icon}</div>
          )}
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--text1)", letterSpacing: "-0.03em", marginBottom: 4 }}>{title}</h1>
            {subtitle && <p style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.5 }}>{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div style={{ height: 1, background: "linear-gradient(90deg,rgba(155,35,53,0.4),transparent)", marginTop: "1.25rem" }} />
    </div>
  );
}

// ── RejectModal ───────────────────────────────────────────────────────────────
export function RejectModal({ title, onClose, onConfirm }) {
  const [reason,  setReason]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const submit = async () => {
    if (!reason.trim()) { setError("Please provide a reason"); return; }
    setLoading(true);
    try { await onConfirm(reason); }
    catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal title={title || "Reject"} subtitle="Provide constructive feedback so the submitter can improve and resubmit." onClose={onClose}>
      <Field label="Reason for rejection" required error={error}>
        <textarea
          value={reason}
          onChange={(e) => { setReason(e.target.value); setError(""); }}
          placeholder="e.g. Date conflicts with another approved event. Please reschedule."
          style={{ minHeight: 96 }}
        />
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: "0.75rem" }}>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="danger" onClick={submit} loading={loading}>Confirm Rejection</Btn>
      </div>
    </Modal>
  );
}

// ── TeamMembersDisplay ────────────────────────────────────────────────────────
export function TeamMembersDisplay({ members = [] }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
      {members.map((m, i) => (
        <span key={i} style={{
          background: "rgba(155,35,53,0.12)",
          color: "var(--text2)",
          fontSize: 12,
          padding: "3px 10px",
          borderRadius: "var(--rfull)",
          border: "1px solid rgba(155,35,53,0.25)",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          {m.isLeader && <span style={{ color: "var(--amber)", fontSize: 10 }}>★</span>}
          {m.name}
        </span>
      ))}
    </div>
  );
}

// ── PosterView ────────────────────────────────────────────────────────────────
// Shows a poster without cropping (object-fit: contain) and opens a full-view
// lightbox on click. Used anywhere the *complete* poster must stay visible
// (event detail, registration detail) — card thumbnails use a plain <img cover>.
export function PosterView({ src, alt, height = 260 }) {
  const [open, setOpen] = useState(false);
  if (!src) return null;
  return (
    <>
      <div
        onClick={() => setOpen(true)}
        title="Click to view full poster"
        style={{
          width: "100%", height, borderRadius: 14, marginBottom: "1.25rem",
          background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", cursor: "zoom-in",
        }}
      >
        <img src={src} alt={alt} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
      </div>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 999, padding: "2rem",
            background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <img src={src} alt={alt} style={{ maxWidth: "92vw", maxHeight: "92vh", objectFit: "contain", borderRadius: 8, boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }} />
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            style={{
              position: "absolute", top: 20, right: 24,
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 14, cursor: "pointer",
            }}
          >✕ Close</button>
        </div>
      )}
    </>
  );
}

// ── Skeleton loaders ──────────────────────────────────────────────────────────
export function CardSkeleton() {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "var(--r16)", padding: "1.25rem 1.5rem" }}>
      <div className="skeleton" style={{ height: 50, width: 50, borderRadius: 14, marginBottom: 18 }} />
      <div className="skeleton" style={{ height: 18, width: "68%", marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 13, width: "90%", marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 13, width: "55%", marginBottom: 18 }} />
      <div className="skeleton" style={{ height: 40, width: "100%", borderRadius: 10 }} />
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "var(--r12)", padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
      <div className="skeleton" style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 14, width: "42%", marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 12, width: "68%"  }} />
      </div>
    </div>
  );
}
