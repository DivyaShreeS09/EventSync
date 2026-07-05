import React, { useState, useEffect, useCallback } from "react";
import { useToast }  from "../context/ToastContext";
import { teamsAPI, soloAPI } from "../api";
import { Avatar, Badge, Btn, EmptyState, InfoBox, Modal, PageHeader, RejectModal, RowSkeleton, TeamMembersDisplay } from "../components/UI";

// ── Solo Registration Detail Modal ────────────────────────────────────────────
function SoloDetailModal({ reg, onClose }) {
  return (
    <Modal title={reg.name} onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(155,35,53,0.06)", border: "1px solid rgba(155,35,53,0.15)", borderRadius: 14, padding: "1.25rem", marginBottom: "1.5rem" }}>
        <Avatar name={reg.name} size={56} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "var(--text1)", letterSpacing: "-0.02em" }}>{reg.name}</p>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text3)" }}>🆔 {reg.registerNo}</p>
        </div>
        <Badge label={reg.approvalStatus} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1rem" }}>
        {[["🎪 Event", reg.event?.name || "—"], ["✉ Email", reg.email], ["📅 Registered", reg.registeredOn], ["🆔 Register No.", reg.registerNo]].map(([k, v]) => (
          <div key={k} style={{ background: "rgba(155,35,53,0.06)", borderRadius: 10, padding: "10px 14px" }}>
            <p style={{ margin: "0 0 3px", fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>{k}</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text1)", fontWeight: 700 }}>{v}</p>
          </div>
        ))}
      </div>
      {reg.rejectReason && (
        <div style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", borderLeft: "3px solid var(--rose)", borderRadius: 10, padding: "10px 14px" }}>
          <p style={{ margin: "0 0 4px", fontSize: 10, color: "var(--rose)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>Organizer Feedback</p>
          <p style={{ margin: 0, fontSize: 13, color: "#fca5a5", lineHeight: 1.5 }}>{reg.rejectReason}</p>
        </div>
      )}
    </Modal>
  );
}

// ── Team Detail Modal ─────────────────────────────────────────────────────────
function TeamDetailModal({ team, onClose }) {
  return (
    <Modal title={team.name} onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(155,35,53,0.06)", border: "1px solid rgba(155,35,53,0.15)", borderRadius: 14, padding: "1.25rem", marginBottom: "1.5rem" }}>
        <Avatar name={team.name} size={56} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "var(--text1)", letterSpacing: "-0.02em" }}>{team.name}</p>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text3)" }}>🏫 {team.college}</p>
        </div>
        <Badge label={team.approvalStatus} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1rem" }}>
        {[["🎪 Event", team.event?.name || "—"], ["👤 Leader", team.leader], ["📅 Registered", team.registeredOn], ["👥 Members", team.members?.length || 0]].map(([k, v]) => (
          <div key={k} style={{ background: "rgba(155,35,53,0.06)", borderRadius: 10, padding: "10px 14px" }}>
            <p style={{ margin: "0 0 3px", fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>{k}</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text1)", fontWeight: 700 }}>{v}</p>
          </div>
        ))}
      </div>

      {team.rejectReason && (
        <div style={{ marginBottom: "1rem", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", borderLeft: "3px solid var(--rose)", borderRadius: 10, padding: "10px 14px" }}>
          <p style={{ margin: "0 0 4px", fontSize: 10, color: "var(--rose)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>Organizer Feedback</p>
          <p style={{ margin: 0, fontSize: 13, color: "#fca5a5", lineHeight: 1.5 }}>{team.rejectReason}</p>
        </div>
      )}

      <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 800, color: "var(--text1)" }}>Members ({team.members?.length || 0})</p>
      <div style={{ display: "grid", gap: 7 }}>
        {(team.members || []).map((m, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "9px 14px" }}>
            <Avatar name={m.name} size={30} />
            <span style={{ fontSize: 13, color: "var(--text1)", fontWeight: 600, flex: 1 }}>{m.name}</span>
            {m.isLeader && <span style={{ fontSize: 11, color: "var(--amber)", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", padding: "2px 10px", borderRadius: 20, fontWeight: 700 }}>★ Leader</span>}
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ── Status section header ─────────────────────────────────────────────────────
function StatusGroup({ status, count }) {
  const conf = {
    Pending:  { color: "var(--amber)",  icon: "⏳", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)"  },
    Approved: { color: "var(--emerald)",icon: "✅", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)"  },
    Rejected: { color: "var(--rose)",   icon: "❌", bg: "rgba(244,63,94,0.1)",   border: "rgba(244,63,94,0.25)"   },
  }[status];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
      <span style={{ fontSize: 18 }}>{conf.icon}</span>
      <span style={{ fontSize: 14, fontWeight: 800, color: conf.color }}>{status}</span>
      <span style={{ background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color, fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>{count}</span>
    </div>
  );
}

// ── MyTeamsPage ───────────────────────────────────────────────────────────────
export function MyTeamsPage() {
  const { notify }  = useToast();
  const [teams,    setTeams]    = useState([]);
  const [solo,     setSolo]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [selectedSolo, setSelectedSolo] = useState(null);

  useEffect(() => {
    Promise.all([teamsAPI.getAll(), soloAPI.getAll()])
      .then(([t, s]) => { setTeams(t.data.data); setSolo(s.data.data); })
      .catch((e) => notify(e.response?.data?.error || e.message, "error"))
      .finally(() => setLoading(false));
  }, []);

  const isEmpty = teams.length === 0 && solo.length === 0;

  return (
    <div>
      <PageHeader title="My Registrations" subtitle="Track your team and solo registration requests and approval status." icon="👥" />
      <InfoBox color="var(--indigo)" icon="ℹ">After submitting, the organizer reviews your registration. Check here for status updates and any feedback.</InfoBox>

      {loading ? [0,1,2].map((i) => <RowSkeleton key={i} />) :
       isEmpty ? <EmptyState icon="👥" title="No registrations yet" sub="Browse events and register solo or as a team." /> : (
        <div style={{ display: "grid", gap: 10 }}>
          {teams.map((team) => (
            <div
              key={team._id}
              onClick={() => setSelected(team)}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16, padding: "1.25rem 1.5rem",
                cursor: "pointer", transition: "all 0.22s cubic-bezier(0.22,1,0.36,1)",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(155,35,53,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(155,35,53,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Avatar name={team.name} size={48} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 800, color: "var(--text1)", fontSize: 15 }}>{team.name}</span>
                    <Badge label="TEAM" />
                    <Badge label={team.approvalStatus} />
                  </div>
                  <p style={{ margin: "0 0 3px", fontSize: 12, color: "var(--text3)" }}>🏫 {team.college} · 👤 Leader: {team.leader}</p>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--burgundy)", fontWeight: 600 }}>🎪 {team.event?.name}</p>
                  {team.approvalStatus === "Rejected" && team.rejectReason && (
                    <div style={{ marginTop: 10, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderLeft: "3px solid var(--rose)", borderRadius: 8, padding: "8px 12px" }}>
                      <p style={{ margin: "0 0 2px", fontSize: 10, color: "var(--rose)", fontWeight: 800, textTransform: "uppercase" }}>Organizer Feedback</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#fca5a5" }}>{team.rejectReason}</p>
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 11, color: "var(--text3)", flexShrink: 0 }}>{team.registeredOn}</span>
              </div>
            </div>
          ))}
          {solo.map((reg) => (
            <div
              key={reg._id}
              onClick={() => setSelectedSolo(reg)}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16, padding: "1.25rem 1.5rem",
                cursor: "pointer", transition: "all 0.22s cubic-bezier(0.22,1,0.36,1)",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(155,35,53,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(155,35,53,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Avatar name={reg.name} size={48} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 800, color: "var(--text1)", fontSize: 15 }}>{reg.name}</span>
                    <Badge label="SOLO" />
                    <Badge label={reg.approvalStatus} />
                  </div>
                  <p style={{ margin: "0 0 3px", fontSize: 12, color: "var(--text3)" }}>🆔 {reg.registerNo}</p>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--burgundy)", fontWeight: 600 }}>🎪 {reg.event?.name}</p>
                  {reg.approvalStatus === "Rejected" && reg.rejectReason && (
                    <div style={{ marginTop: 10, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderLeft: "3px solid var(--rose)", borderRadius: 8, padding: "8px 12px" }}>
                      <p style={{ margin: "0 0 2px", fontSize: 10, color: "var(--rose)", fontWeight: 800, textTransform: "uppercase" }}>Organizer Feedback</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#fca5a5" }}>{reg.rejectReason}</p>
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 11, color: "var(--text3)", flexShrink: 0 }}>{reg.registeredOn}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {selected && <TeamDetailModal team={selected} onClose={() => setSelected(null)} />}
      {selectedSolo && <SoloDetailModal reg={selectedSolo} onClose={() => setSelectedSolo(null)} />}
    </div>
  );
}

// ── TeamApprovalsPage ─────────────────────────────────────────────────────────
export function TeamApprovalsPage({ refreshCounts }) {
  const { notify }     = useToast();
  const [teams,    setTeams]    = useState([]);
  const [solo,     setSolo]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [rejectTm, setRejectTm] = useState(null);
  const [rejectSolo, setRejectSolo] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([teamsAPI.getAll(), soloAPI.getAll()]);
      setTeams(t.data.data);
      setSolo(s.data.data);
    }
    catch (e) { notify(e.response?.data?.error || e.message, "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve      = async (id) => { try { await teamsAPI.approve(id); notify("Team approved! ✅", "success"); load(); refreshCounts(); } catch (e) { notify(e.response?.data?.error || e.message, "error"); } };
  const remove       = async (id) => { await teamsAPI.remove(id);  notify("Team removed",     "error");   load(); };
  const approveSolo  = async (id) => { try { await soloAPI.approve(id); notify("Registration approved! ✅", "success"); load(); refreshCounts(); } catch (e) { notify(e.response?.data?.error || e.message, "error"); } };
  const removeSolo   = async (id) => { await soloAPI.remove(id);  notify("Registration removed", "error"); load(); };

  const items = [
    ...teams.map((t) => ({ ...t, _kind: "TEAM", _missingRegNo: (t.members || []).some((m) => !m.registerNo) })),
    ...solo.map((s) => ({ ...s, _kind: "SOLO", _missingRegNo: !s.registerNo })),
  ];

  const grouped = {
    Pending:  items.filter((t) => t.approvalStatus === "Pending"),
    Approved: items.filter((t) => t.approvalStatus === "Approved"),
    Rejected: items.filter((t) => t.approvalStatus === "Rejected"),
  };

  return (
    <div>
      <PageHeader title="Team Approvals" subtitle="Review student team and solo registrations for your events." icon="✅" />
      <InfoBox color="var(--amber)" icon="⚠">Only registrations for your events appear here. A registration cannot be approved if any member is missing a register number (required for OD verification).</InfoBox>

      {loading ? [0,1,2].map((i) => <RowSkeleton key={i} />) :
       items.length === 0 ? <EmptyState icon="👥" title="No registrations yet" sub="Students haven't registered for your events yet." /> :
       ["Pending","Approved","Rejected"].map((status) => grouped[status].length > 0 && (
        <div key={status} style={{ marginBottom: "2rem" }}>
          <StatusGroup status={status} count={grouped[status].length} />
          <div style={{ display: "grid", gap: 10 }}>
            {grouped[status].map((item) => (
              <div key={item._id} style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${status === "Pending" ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 16, padding: "1.25rem 1.5rem",
                display: "flex", alignItems: "flex-start", gap: 14,
              }}>
                <Avatar name={item.name} size={46} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 800, color: "var(--text1)", fontSize: 15 }}>{item.name}</span>
                    <Badge label={item._kind} />
                    <Badge label={item.approvalStatus} />
                    {item._missingRegNo && <Badge label="⚠ Missing Register No." />}
                  </div>
                  {item._kind === "TEAM" ? (
                    <p style={{ margin: "0 0 3px", fontSize: 12, color: "var(--text3)" }}>🏫 {item.college} · 👤 Leader: {item.leader}</p>
                  ) : (
                    <p style={{ margin: "0 0 3px", fontSize: 12, color: "var(--text3)" }}>🆔 {item.registerNo || "—"}</p>
                  )}
                  <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--text3)" }}>🎪 {item.event?.name} · 📅 Submitted: {item.registeredOn}</p>
                  {item.rejectReason && <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--rose)" }}>Your feedback: {item.rejectReason}</p>}
                  {item._kind === "TEAM" && <TeamMembersDisplay members={item.members} />}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                  {status === "Pending" && item._kind === "TEAM" && (
                    <>
                      <Btn size="sm" variant="success" disabled={item._missingRegNo} onClick={() => approve(item._id)}>✓ Approve</Btn>
                      <Btn size="sm" variant="danger"  onClick={() => setRejectTm(item)}>✕ Reject</Btn>
                    </>
                  )}
                  {status === "Pending" && item._kind === "SOLO" && (
                    <>
                      <Btn size="sm" variant="success" disabled={item._missingRegNo} onClick={() => approveSolo(item._id)}>✓ Approve</Btn>
                      <Btn size="sm" variant="danger"  onClick={() => setRejectSolo(item)}>✕ Reject</Btn>
                    </>
                  )}
                  {status !== "Pending" && item._kind === "TEAM" && <Btn size="sm" variant="danger" onClick={() => remove(item._id)}>🗑 Remove</Btn>}
                  {status !== "Pending" && item._kind === "SOLO" && <Btn size="sm" variant="danger" onClick={() => removeSolo(item._id)}>🗑 Remove</Btn>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {rejectTm && <RejectModal title={`Reject: ${rejectTm.name}`} onClose={() => setRejectTm(null)} onConfirm={async (r) => { await teamsAPI.reject(rejectTm._id, r); notify("Rejected", "error"); setRejectTm(null); load(); refreshCounts(); }} />}
      {rejectSolo && <RejectModal title={`Reject: ${rejectSolo.name}`} onClose={() => setRejectSolo(null)} onConfirm={async (r) => { await soloAPI.reject(rejectSolo._id, r); notify("Rejected", "error"); setRejectSolo(null); load(); refreshCounts(); }} />}
    </div>
  );
}

// ── AllTeamsPage ──────────────────────────────────────────────────────────────
export function AllTeamsPage() {
  const { notify }     = useToast();
  const [teams,    setTeams]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [search,   setSearch]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await teamsAPI.getAll(); setTeams(r.data.data); }
    catch (e) { notify(e.response?.data?.error || e.message, "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id) => { await teamsAPI.remove(id); notify("Team removed", "error"); load(); };

  const filtered = teams.filter((t) =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.college.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="All Teams"
        subtitle={`${teams.length} registrations across all events`}
        icon="👥"
        action={<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search teams…" style={{ width: 220 }} />}
      />

      {loading ? [0,1,2,3].map((i) => <RowSkeleton key={i} />) :
       filtered.length === 0 ? <EmptyState icon="👥" title="No teams found" sub="No team registrations yet." /> : (
        <div style={{ display: "grid", gap: 8 }}>
          {filtered.map((team) => (
            <div key={team._id}
              onClick={() => setSelected(team)}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "1rem 1.5rem",
                display: "flex", alignItems: "center", gap: 14,
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(155,35,53,0.25)"; e.currentTarget.style.background = "rgba(155,35,53,0.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
            >
              <Avatar name={team.name} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontWeight: 800, color: "var(--text1)", fontSize: 14 }}>{team.name}</span>
                  <Badge label={team.approvalStatus} />
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  🏫 {team.college} · 🎪 {team.event?.name} · 👥 {team.members?.length || 0} members · 👤 {team.leader}
                </p>
              </div>
              <Btn size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); remove(team._id); }}>🗑 Remove</Btn>
            </div>
          ))}
        </div>
      )}
      {selected && <TeamDetailModal team={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
