import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { teamsAPI, soloAPI } from "../api";
import { Badge, Avatar, Btn, PageHeader, EmptyState, RowSkeleton, PosterView } from "../components/UI";

export default function RegistrationDetailPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [reg,     setReg]     = useState(null);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(true);

  const isTeam = type === "team";

  useEffect(() => {
    setLoading(true);
    const fetcher = isTeam ? teamsAPI.getById(id) : soloAPI.getById(id);
    fetcher
      .then((r) => setReg(r.data.data))
      .catch((e) => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  }, [type, id]);

  if (loading) return <div><PageHeader title="Registration Detail" icon="🔎" /><RowSkeleton /><RowSkeleton /></div>;
  if (error || !reg) return <EmptyState icon="⚠" title="Registration not found" sub={error || "This registration could not be loaded."} action={<Btn onClick={() => navigate("/dashboard")}>← Back to Dashboard</Btn>} />;

  const ev = reg.event || {};
  const approved = reg.approvalStatus === "Approved";

  return (
    <div>
      <PageHeader
        title={isTeam ? `Team Registration: ${reg.name}` : `Solo Registration: ${reg.name}`}
        subtitle={`For: ${ev.name || "—"}`}
        icon={isTeam ? "👥" : "🙋"}
        action={<Btn onClick={() => navigate(-1)}>← Back</Btn>}
      />

      {/* Verified / status banner */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem",
        background: approved ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
        border: `1px solid ${approved ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
        borderRadius: 14, padding: "1rem 1.5rem",
      }}>
        <span style={{ fontSize: 24 }}>{approved ? "✅" : reg.approvalStatus === "Rejected" ? "❌" : "⏳"}</span>
        <div>
          <p style={{ margin: 0, fontWeight: 800, color: "var(--text1)", fontSize: 15 }}>
            {approved ? "Verified — Approved Registration" : `Status: ${reg.approvalStatus}`}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text3)" }}>
            {isTeam ? "Team" : "Solo"} registration submitted on {reg.registeredOn}
          </p>
        </div>
        <div style={{ marginLeft: "auto" }}><Badge label={reg.approvalStatus} /></div>
      </div>

      {/* Event card */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <PosterView src={ev.poster} alt={ev.name} height={280} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text1)" }}>{ev.name}</span>
          <Badge label={ev.category} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["📅 Date", ev.date], ["📍 Venue", ev.venue]].map(([k, v]) => (
            <div key={k} style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: 12, padding: "11px 14px" }}>
              <p style={{ margin: "0 0 3px", fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700 }}>{k}</p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text1)", fontWeight: 700 }}>{v || "—"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Registrant / team details */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "1.5rem" }}>
        {isTeam ? (
          <>
            <p style={{ margin: "0 0 1rem", fontWeight: 800, color: "var(--text1)", fontSize: 15 }}>Team: {reg.name} ({reg.college})</p>
            <div style={{ display: "grid", gap: 8 }}>
              {(reg.members || []).map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 14px" }}>
                  <Avatar name={m.name} size={36} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text1)" }}>
                      {m.name} {m.isLeader && <span style={{ color: "var(--amber)", fontSize: 11 }}>★ Leader</span>}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text3)" }}>
                      🆔 {m.registerNo || "—"} · ✉ {m.email || "—"} · 🎓 {m.program || "—"} · 🏫 {m.college || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p style={{ margin: "0 0 1rem", fontWeight: 800, color: "var(--text1)", fontSize: 15 }}>Registrant Details</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 14px" }}>
              <Avatar name={reg.name} size={36} />
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--text1)" }}>{reg.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text3)" }}>
                  🆔 {reg.registerNo || "—"} · ✉ {reg.email || "—"} · 🎓 {reg.program || "—"} · 🏫 {reg.college || "—"}
                </p>
              </div>
            </div>
          </>
        )}
        {reg.rejectReason && (
          <div style={{ marginTop: "1rem", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderLeft: "3px solid var(--rose)", borderRadius: 10, padding: "11px 14px" }}>
            <p style={{ margin: "0 0 4px", fontSize: 10, color: "var(--rose)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>Feedback</p>
            <p style={{ margin: 0, fontSize: 13, color: "#fca5a5", lineHeight: 1.5 }}>{reg.rejectReason}</p>
          </div>
        )}
      </div>
    </div>
  );
}
