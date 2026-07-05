import React, { useState } from "react";
import { Badge, Btn, ProgressBar } from "./UI";

const CATEGORY_THEMES = {
  Technical: {
    gradient: "linear-gradient(135deg,#9B2335,#7A1A28)",
    glow: "rgba(155,35,53,0.35)",
    bg: "rgba(155,35,53,0.10)",
    border: "rgba(155,35,53,0.25)",
  },
  Cultural: {
    gradient: "linear-gradient(135deg,#C4435A,#9B2335)",
    glow: "rgba(196,67,90,0.35)",
    bg: "rgba(196,67,90,0.10)",
    border: "rgba(196,67,90,0.25)",
  },
  Sports: {
    gradient: "linear-gradient(135deg,#10b981,#06b6d4)",
    glow: "rgba(16,185,129,0.3)",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
  },
};

export default function EventCard({ ev, role, onView, onRegister, onRegisterSolo, onApprove, onReject, onToggleReg, onDelete }) {
  const approved = ev.teamCount || 0;
  const [hov, setHov] = useState(false);
  const theme = CATEGORY_THEMES[ev.category] || CATEGORY_THEMES.Technical;
  const canSolo = ev.registrationType === "SOLO" || ev.registrationType === "BOTH";
  const canTeam = ev.registrationType === "TEAM" || ev.registrationType === "BOTH" || !ev.registrationType;

  return (
    <div
      onClick={() => onView && onView(ev)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", flexDirection: "column",
        background: hov ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hov ? theme.border : "rgba(255,255,255,0.08)"}`,
        borderRadius: 20,
        overflow: "hidden",
        transition: "all 0.28s cubic-bezier(0.22,1,0.36,1)",
        transform: hov ? "translateY(-5px)" : "none",
        boxShadow: hov ? `0 24px 64px ${theme.glow}, 0 0 0 1px ${theme.border}` : "none",
        cursor: "pointer",
        minHeight: 310,
        backdropFilter: "blur(12px)",
        position: "relative",
      }}
    >
      {/* ── Top accent strip / poster ── */}
      {ev.poster ? (
        <img src={ev.poster} alt={ev.name} style={{ width: "100%", height: 120, objectFit: "cover" }} />
      ) : (
        <div style={{
          height: 3,
          background: theme.gradient,
          boxShadow: `0 0 12px ${theme.glow}`,
        }} />
      )}

      {/* ── Card content ── */}
      <div style={{ padding: "1.25rem 1.4rem", flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26,
            boxShadow: hov ? `0 0 20px ${theme.glow}` : "none",
            transition: "box-shadow 0.25s",
          }}>
            {ev.image}
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Badge label={ev.category} />
            {role === "Admin"                 && <Badge label={ev.approvalStatus} />}
            {ev.approvalStatus === "Approved" && <Badge label={ev.regStatus} />}
          </div>
        </div>

        {/* Title */}
        <p style={{
          margin: "0 0 6px", fontSize: 16, fontWeight: 800,
          color: "var(--text1)", lineHeight: 1.3, letterSpacing: "-0.02em",
        }}>{ev.name}</p>

        {/* Description */}
        <p style={{
          margin: "0 0 1rem", fontSize: 12.5, color: "var(--text3)",
          lineHeight: 1.6, flex: 1,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{ev.description}</p>

        {/* Meta */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text3)", marginBottom: "0.75rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ opacity: 0.7 }}>📅</span> {ev.date}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ opacity: 0.7 }}>📍</span> {ev.venue}
          </span>
        </div>

        {/* Capacity */}
        <div style={{ marginBottom: "0.9rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: "var(--text3)" }}>Team capacity</span>
            <span style={{ fontSize: 12, color: "var(--text2)", fontWeight: 700 }}>{approved}/{ev.maxTeams}</span>
          </div>
          <ProgressBar value={approved} max={ev.maxTeams} />
        </div>

        {/* Rejection reason */}
        {ev.rejectReason && (
          <div style={{
            background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)",
            borderRadius: 10, padding: "8px 12px", marginBottom: "0.75rem",
            borderLeft: "3px solid rgba(244,63,94,0.5)",
          }}>
            <p style={{ margin: 0, fontSize: 11, color: "#fca5a5", lineHeight: 1.5 }}>
              <span style={{ fontWeight: 700 }}>Admin feedback:</span> {ev.rejectReason}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "auto" }}>
          {role === "Student" && ev.approvalStatus === "Approved" && ev.regStatus === "Open" && canTeam && (
            <Btn variant="primary" size="sm" full onClick={() => onRegister && onRegister(ev)}>
              🎯 Register Team
            </Btn>
          )}
          {role === "Student" && ev.approvalStatus === "Approved" && ev.regStatus === "Open" && canSolo && (
            <Btn variant="primary" size="sm" full onClick={() => onRegisterSolo && onRegisterSolo(ev)}>
              🙋 Register Solo
            </Btn>
          )}
          {(role === "Organizer" || role === "Admin") && ev.approvalStatus === "Approved" && (
            <Btn size="sm" variant={ev.regStatus === "Open" ? "danger" : "success"} onClick={() => onToggleReg && onToggleReg(ev._id)}>
              {ev.regStatus === "Open" ? "🔒 Close Reg" : "🔓 Open Reg"}
            </Btn>
          )}
          {role === "Admin" && ev.approvalStatus === "Pending" && (
            <>
              <Btn size="sm" variant="success" onClick={() => onApprove && onApprove(ev._id)}>✓ Approve</Btn>
              <Btn size="sm" variant="danger"  onClick={() => onReject  && onReject(ev)}>✕ Reject</Btn>
            </>
          )}
          {(role === "Admin" || role === "Organizer") && (
            <Btn size="sm" variant="danger" onClick={() => onDelete && onDelete(ev._id)}>🗑 Delete</Btn>
          )}
        </div>
      </div>
    </div>
  );
}
