// ── EventsPage.jsx ────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth }    from "../context/AuthContext";
import { useToast }   from "../context/ToastContext";
import { eventsAPI }  from "../api";
import EventCard      from "../components/EventCard";
import { Modal, Field, InfoBox, Btn, Badge, Avatar, ProgressBar, TeamMembersDisplay, RejectModal, EmptyState, PageHeader, CardSkeleton, PosterView } from "../components/UI";

// ── Read-only "your details" summary used by both registration modals ────────
function AccountSummary({ user }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1rem" }}>
      {[["Name", user.name], ["Email", user.email], ["Register No.", user.registerNo || "—"], ["College", user.college || "—"], ["Program", user.program || "—"]].map(([k, v]) => (
        <div key={k} style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: 10, padding: "9px 12px" }}>
          <p style={{ margin: "0 0 2px", fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".07em", fontWeight: 700 }}>{k}</p>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text1)", fontWeight: 700 }}>{v}</p>
        </div>
      ))}
    </div>
  );
}

// ── Register Team Modal ───────────────────────────────────────────────────────
function RegisterTeamModal({ ev, onClose, onSuccess }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", college: user.college || "", memberRegNos: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const profileIncomplete = !user.registerNo || !user.college || !user.program;

  const submit = async () => {
    if (!form.name || !form.college) { setError("Team name and college are required"); return; }
    setLoading(true); setError("");
    try {
      const { teamsAPI } = await import("../api");
      const members = form.memberRegNos.split(/[\n,]/).map((r) => r.trim()).filter(Boolean);
      await teamsAPI.create({ name: form.name, college: form.college, members, eventId: ev._id });
      onSuccess();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  return (
    <Modal title="Register Your Team" subtitle={`For: ${ev.name}`} onClose={onClose}>
      <InfoBox color="var(--indigo)" icon="ℹ">
        You are registered as the team leader using your account details below. Each additional member must already have a CampusConnect student account — enter their register numbers and we'll fetch their details automatically.
      </InfoBox>
      {profileIncomplete && (
        <div style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 10, padding: "11px 14px", marginBottom: "1rem", fontSize: 13, color: "#fca5a5" }}>
          ⚠ Please complete your profile before registering for events.
        </div>
      )}
      {error && <div style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 10, padding: "11px 14px", marginBottom: "1rem", fontSize: 13, color: "#fca5a5", display:"flex", gap:8, alignItems:"center" }}><span>⚠</span>{error}</div>}

      <p style={{ margin: "0 0 8px", fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700 }}>Team Leader (you)</p>
      <AccountSummary user={user} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Team Name" required><input value={form.name}    onChange={set("name")}    placeholder="e.g. PixelCraft" /></Field>
        <Field label="College"   required><input value={form.college} onChange={set("college")} placeholder="e.g. Anna University" /></Field>
      </div>
      <Field label="Other Members — register numbers, one per line or comma-separated">
        <textarea value={form.memberRegNos} onChange={set("memberRegNos")} placeholder={"3122225002\n3122225003"} style={{ minHeight: 80 }} />
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: ".5rem" }}>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={submit} loading={loading} disabled={profileIncomplete}>Submit Registration</Btn>
      </div>
    </Modal>
  );
}

// ── Register Solo Modal ───────────────────────────────────────────────────────
function RegisterSoloModal({ ev, onClose, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const profileIncomplete = !user.registerNo || !user.college || !user.program;

  const submit = async () => {
    setLoading(true); setError("");
    try {
      const { soloAPI } = await import("../api");
      await soloAPI.create({ eventId: ev._id });
      onSuccess();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  return (
    <Modal title="Register as Individual" subtitle={`For: ${ev.name}`} onClose={onClose}>
      <InfoBox color="var(--indigo)" icon="ℹ">
        You'll be registered using your account details below — confirm and submit.
      </InfoBox>
      {profileIncomplete && (
        <div style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 10, padding: "11px 14px", marginBottom: "1rem", fontSize: 13, color: "#fca5a5" }}>
          ⚠ Please complete your profile before registering for events.
        </div>
      )}
      {error && <div style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 10, padding: "11px 14px", marginBottom: "1rem", fontSize: 13, color: "#fca5a5", display:"flex", gap:8, alignItems:"center" }}><span>⚠</span>{error}</div>}
      <AccountSummary user={user} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: ".5rem" }}>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={submit} loading={loading} disabled={profileIncomplete}>Confirm & Register</Btn>
      </div>
    </Modal>
  );
}

// ── Event Detail Modal ────────────────────────────────────────────────────────
function EventDetailModal({ ev, onClose, onRegister, onRegisterSolo, onApprove, onReject, refresh }) {
  const { user }   = useAuth();
  const { notify } = useToast();
  const [teams,    setTeams]    = useState([]);
  const [solo,     setSolo]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [rejectTm, setRejectTm] = useState(null);
  const [rejectSolo, setRejectSolo] = useState(null);

  useEffect(() => {
    Promise.all([eventsAPI.getTeams(ev._id), eventsAPI.getSolo(ev._id)])
      .then(([t, s]) => { setTeams(t.data.data); setSolo(s.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ev._id]);

  const approveTeam = async (id) => {
    try {
      const { teamsAPI } = await import("../api");
      await teamsAPI.approve(id);
      notify("Team approved!", "success");
      refresh && refresh();
      setTeams((p) => p.map((t) => t._id === id ? { ...t, approvalStatus: "Approved" } : t));
    } catch (e) { notify(e.response?.data?.error || e.message, "error"); }
  };
  const removeTeam = async (id) => {
    const { teamsAPI } = await import("../api");
    await teamsAPI.remove(id);
    notify("Team removed", "error");
    setTeams((p) => p.filter((t) => t._id !== id));
  };
  const approveSolo = async (id) => {
    try {
      const { soloAPI } = await import("../api");
      await soloAPI.approve(id);
      notify("Registration approved!", "success");
      refresh && refresh();
      setSolo((p) => p.map((s) => s._id === id ? { ...s, approvalStatus: "Approved" } : s));
    } catch (e) { notify(e.response?.data?.error || e.message, "error"); }
  };
  const removeSolo = async (id) => {
    const { soloAPI } = await import("../api");
    await soloAPI.remove(id);
    notify("Registration removed", "error");
    setSolo((p) => p.filter((s) => s._id !== id));
  };

  const approved = teams.filter((t) => t.approvalStatus === "Approved").length
                 + solo.filter((s) => s.approvalStatus === "Approved").length;
  const canSolo = ev.registrationType === "SOLO" || ev.registrationType === "BOTH";
  const canTeam = ev.registrationType === "TEAM" || ev.registrationType === "BOTH" || !ev.registrationType;

  return (
    <Modal title={ev.name} onClose={onClose} wide>
      <PosterView src={ev.poster} alt={ev.name} height={280} />
      <div style={{ display: "flex", gap: 7, marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <Badge label={ev.category} />
        <Badge label={`Admin: ${ev.approvalStatus}`} />
        {ev.approvalStatus === "Approved" && <Badge label={`Reg: ${ev.regStatus}`} />}
        <Badge label={ev.registrationType || "TEAM"} />
        {!ev.requiresApproval && <Badge label="Auto-approved" />}
      </div>
      <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: "1.5rem", lineHeight: 1.7 }}>{ev.description}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1.25rem" }}>
        {[["📅 Date", ev.date], ["📍 Venue", ev.venue], ["👤 Organizer", ev.organizer?.name], ["👥 Capacity", `${approved}/${ev.maxTeams} approved`]].map(([k, v]) => (
          <div key={k} style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: 12, padding: "11px 14px" }}>
            <p style={{ margin: "0 0 3px", fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700 }}>{k}</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text1)", fontWeight: 700 }}>{v}</p>
          </div>
        ))}
        {ev.registrationDeadline && (
          <div style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: 12, padding: "11px 14px" }}>
            <p style={{ margin: "0 0 3px", fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700 }}>⏰ Reg. Deadline</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text1)", fontWeight: 700 }}>{new Date(ev.registrationDeadline).toLocaleDateString()}</p>
          </div>
        )}
      </div>
      <ProgressBar value={approved} max={ev.maxTeams} />
      {ev.rejectReason && (
        <div style={{ marginTop: "1rem", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderLeft: "3px solid var(--rose)", borderRadius: 10, padding: "11px 14px" }}>
          <p style={{ margin: "0 0 4px", fontSize: 10, color: "var(--rose)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>Admin Feedback</p>
          <p style={{ margin: 0, fontSize: 13, color: "#fca5a5", lineHeight: 1.5 }}>{ev.rejectReason}</p>
        </div>
      )}

      {/* Teams list */}
      {teams.length > 0 && (
        <div style={{ marginTop: "1.25rem" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text1)", marginBottom: ".75rem" }}>Registered Teams ({teams.length})</p>
          <div style={{ display: "grid", gap: 8, maxHeight: 260, overflowY: "auto" }}>
            {teams.map((team) => {
              const missingRegNo = (team.members || []).some((m) => !m.registerNo);
              return (
                <div key={team._id} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,.03)", borderRadius: 8, padding: "10px 12px" }}>
                  <Avatar name={team.name} size={30} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text1)" }}>{team.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "var(--text3)" }}>{team.college} · {team.members?.length || 0} members{missingRegNo ? " · ⚠ missing register no." : ""}</p>
                  </div>
                  <Badge label={team.approvalStatus} />
                  {(user.role === "Organizer" || user.role === "Admin") && team.approvalStatus === "Pending" && (
                    <>
                      <Btn size="sm" variant="success" disabled={missingRegNo} onClick={() => approveTeam(team._id)}>✓</Btn>
                      <Btn size="sm" variant="danger"  onClick={() => setRejectTm(team)}>✕</Btn>
                    </>
                  )}
                  {user.role === "Admin" && <Btn size="sm" variant="danger" onClick={() => removeTeam(team._id)}>Remove</Btn>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Solo registrants list */}
      {solo.length > 0 && (
        <div style={{ marginTop: "1.25rem" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text1)", marginBottom: ".75rem" }}>Solo Registrants ({solo.length})</p>
          <div style={{ display: "grid", gap: 8, maxHeight: 260, overflowY: "auto" }}>
            {solo.map((reg) => (
              <div key={reg._id} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,.03)", borderRadius: 8, padding: "10px 12px" }}>
                <Avatar name={reg.name} size={30} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text1)" }}>{reg.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--text3)" }}>{reg.registerNo}{!reg.registerNo ? "⚠ missing register no." : ""}</p>
                </div>
                <Badge label={reg.approvalStatus} />
                {(user.role === "Organizer" || user.role === "Admin") && reg.approvalStatus === "Pending" && (
                  <>
                    <Btn size="sm" variant="success" disabled={!reg.registerNo} onClick={() => approveSolo(reg._id)}>✓</Btn>
                    <Btn size="sm" variant="danger"  onClick={() => setRejectSolo(reg)}>✕</Btn>
                  </>
                )}
                {user.role === "Admin" && <Btn size="sm" variant="danger" onClick={() => removeSolo(reg._id)}>Remove</Btn>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student register CTA */}
      {user.role === "Student" && ev.approvalStatus === "Approved" && ev.regStatus === "Open" && (
        <div style={{ display: "flex", gap: 10, marginTop: "1rem" }}>
          {canTeam && (
            <Btn variant="primary" onClick={() => { onRegister(ev); onClose(); }} full style={{ padding: "11px" }}>
              Register Your Team
            </Btn>
          )}
          {canSolo && (
            <Btn variant="primary" onClick={() => { onRegisterSolo(ev); onClose(); }} full style={{ padding: "11px" }}>
              Register Solo
            </Btn>
          )}
        </div>
      )}

      {/* Admin quick approve/reject */}
      {user.role === "Admin" && ev.approvalStatus === "Pending" && (
        <div style={{ display: "flex", gap: 10, marginTop: "1rem" }}>
          <Btn variant="success" onClick={() => { onApprove(ev._id); onClose(); }} full>✓ Approve Event</Btn>
          <Btn variant="danger"  onClick={() => { onReject(ev); onClose(); }} full>✕ Reject</Btn>
        </div>
      )}

      {rejectTm && (
        <RejectModal title={`Reject Team: ${rejectTm.name}`} onClose={() => setRejectTm(null)} onConfirm={async (reason) => {
          const { teamsAPI } = await import("../api");
          await teamsAPI.reject(rejectTm._id, reason);
          notify("Team rejected", "error");
          setRejectTm(null);
          setTeams((p) => p.map((t) => t._id === rejectTm._id ? { ...t, approvalStatus: "Rejected", rejectReason: reason } : t));
        }} />
      )}
      {rejectSolo && (
        <RejectModal title={`Reject: ${rejectSolo.name}`} onClose={() => setRejectSolo(null)} onConfirm={async (reason) => {
          const { soloAPI } = await import("../api");
          await soloAPI.reject(rejectSolo._id, reason);
          notify("Registration rejected", "error");
          setRejectSolo(null);
          setSolo((p) => p.map((s) => s._id === rejectSolo._id ? { ...s, approvalStatus: "Rejected", rejectReason: reason } : s));
        }} />
      )}
    </Modal>
  );
}

// ── EventsPage ────────────────────────────────────────────────────────────────
export function EventsPage({ refreshCounts }) {
  const { user }   = useAuth();
  const { notify } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [events,    setEvents]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [detailEv,  setDetailEv]  = useState(null);
  const [regEv,     setRegEv]     = useState(null);
  const [regSoloEv, setRegSoloEv] = useState(null);
  const [rejectEv,  setRejectEv]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await eventsAPI.getAll(); setEvents(r.data.data); }
    catch (e) { notify(e.response?.data?.error || e.message, "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Deep-link support: ?event=<id> (used by the OD API's eventUrl) auto-opens that event's detail modal
  useEffect(() => {
    const eventId = searchParams.get("event");
    if (!eventId) return;
    eventsAPI.getById(eventId)
      .then((r) => setDetailEv(r.data.data))
      .catch(() => notify("Could not load the linked event", "error"))
      .finally(() => { searchParams.delete("event"); setSearchParams(searchParams, { replace: true }); });
  }, [searchParams]);

  const filtered = events.filter((e) => {
    const mc = catFilter === "All" || e.category === catFilter;
    const ms = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.venue?.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  const approveEv  = async (id) => { await eventsAPI.approve(id); notify("Event approved!", "success"); load(); refreshCounts(); };
  const toggleReg  = async (id) => { await eventsAPI.toggleReg(id); notify("Registration status updated", "success"); load(); };
  const deleteEv   = async (id) => { if (!confirm("Delete this event?")) return; await eventsAPI.remove(id); notify("Event deleted", "error"); load(); refreshCounts(); };

  const CAT_FILTER_THEMES = {
    All:       { active: "linear-gradient(135deg,#9B2335,#7A1A28)",  border: "rgba(155,35,53,0.4)",  color: "#FFD0D8",  icon: "🌐" },
    Technical: { active: "linear-gradient(135deg,#9B2335,#7A1A28)",  border: "rgba(155,35,53,0.4)",  color: "#FFD0D8",  icon: "💻" },
    Cultural:  { active: "linear-gradient(135deg,#C4435A,#9B2335)",  border: "rgba(196,67,90,0.4)",  color: "#FFD8DC",  icon: "🎭" },
    Sports:    { active: "linear-gradient(135deg,#10b981,#06b6d4)",  border: "rgba(16,185,129,0.4)", color: "#dcfff5",  icon: "🏃" },
  };

  return (
    <div>
      <PageHeader
        title={user.role === "Admin" ? "All Events" : "Browse Events"}
        subtitle={`${filtered.length} event${filtered.length !== 1 ? "s" : ""}${user.role !== "Admin" ? " — approved & open for registration" : " across all statuses"}`}
        icon="🎪"
        action={
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search events…" style={{ width: 220 }} />
        }
      />

      {user.role === "Student" && (
        <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {["All", "Technical", "Cultural", "Sports"].map((c) => {
            const th = CAT_FILTER_THEMES[c];
            const active = catFilter === c;
            return (
              <button key={c} onClick={() => setCatFilter(c)} style={{
                padding: "7px 18px", borderRadius: "var(--rfull)", cursor: "pointer",
                border: `1px solid ${active ? th.border : "rgba(255,255,255,0.1)"}`,
                background: active ? th.active : "rgba(255,255,255,0.04)",
                color: active ? th.color : "var(--text3)",
                fontSize: 13, fontWeight: 600, transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 6,
                boxShadow: active ? "0 4px 20px rgba(99,102,241,0.3)" : "none",
              }}>
                {th.icon} {c}
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: "1rem" }}>
          {[0,1,2,3,4,5].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="◆" title="No events found" sub="Try adjusting your search or filter" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: "1rem" }}>
          {filtered.map((ev) => (
            <EventCard key={ev._id} ev={ev} role={user.role}
              onView={setDetailEv} onRegister={setRegEv} onRegisterSolo={setRegSoloEv}
              onApprove={approveEv} onReject={setRejectEv}
              onToggleReg={toggleReg} onDelete={deleteEv}
            />
          ))}
        </div>
      )}

      {detailEv && <EventDetailModal ev={detailEv} onClose={() => setDetailEv(null)} onRegister={setRegEv} onRegisterSolo={setRegSoloEv} onApprove={approveEv} onReject={setRejectEv} refresh={load} />}
      {regEv    && <RegisterTeamModal ev={regEv} onClose={() => setRegEv(null)} onSuccess={() => { setRegEv(null); notify("Registration submitted!", "success"); load(); }} />}
      {regSoloEv && <RegisterSoloModal ev={regSoloEv} onClose={() => setRegSoloEv(null)} onSuccess={() => { setRegSoloEv(null); notify("Registration submitted!", "success"); load(); }} />}
      {rejectEv && <RejectModal title={`Reject: ${rejectEv.name}`} onClose={() => setRejectEv(null)} onConfirm={async (r) => { await eventsAPI.reject(rejectEv._id, r); notify("Event rejected", "error"); setRejectEv(null); load(); refreshCounts(); }} />}
    </div>
  );
}

// ── CreateEventModal ──────────────────────────────────────────────────────────
function CreateEventModal({ onClose, onSuccess }) {
  const { notify } = useToast();
  const [form, setForm] = useState({
    name: "", category: "Technical", date: "", venue: "", maxTeams: "20", description: "", image: "⚡",
    registrationType: "TEAM", requiresApproval: true, registrationDeadline: "",
  });
  const [posterFile, setPosterFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name || !form.date || !form.venue) { setError("Name, date and venue are required"); return; }
    setLoading(true); setError("");
    try {
      const r = await eventsAPI.create({ ...form, maxTeams: parseInt(form.maxTeams) || 20 });
      const created = r.data.data;
      if (posterFile) {
        const fd = new FormData();
        fd.append("poster", posterFile);
        await eventsAPI.uploadPoster(created._id, fd);
      }
      onSuccess();
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="Submit New Event" subtitle="Will be reviewed by admin before going live." onClose={onClose}>
      <InfoBox color="var(--amber)" icon="⚠">Events require admin approval before students can register.</InfoBox>
      {error && <div style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 10, padding: "11px 14px", marginBottom: "1rem", fontSize: 13, color: "#fca5a5", display:"flex", gap:8 }}><span>⚠</span>{error}</div>}
      <Field label="Event Name" required><input value={form.name} onChange={set("name")} placeholder="e.g. HackVerse 2026" /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Category">
          <select value={form.category} onChange={set("category")}>
            <option>Technical</option><option>Cultural</option><option>Sports</option>
          </select>
        </Field>
        <Field label="Icon">
          <select value={form.image} onChange={set("image")}>
            {["⚡","🤖","💻","🎭","🎵","🏆","🏃","🎨","🔬","🎤"].map((ic) => <option key={ic} value={ic}>{ic}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Date" required><input type="date" value={form.date} onChange={set("date")} /></Field>
        <Field label="Max Teams"><input type="number" value={form.maxTeams} onChange={set("maxTeams")} min={1} /></Field>
      </div>
      <Field label="Venue" required><input value={form.venue} onChange={set("venue")} placeholder="e.g. Main Auditorium" /></Field>
      <Field label="Description"><textarea value={form.description} onChange={set("description")} placeholder="Brief event description…" /></Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Registration Type">
          <select value={form.registrationType} onChange={set("registrationType")}>
            <option value="TEAM">Team only</option>
            <option value="SOLO">Solo only</option>
            <option value="BOTH">Both</option>
          </select>
        </Field>
        <Field label="Registration Deadline"><input type="date" value={form.registrationDeadline} onChange={set("registrationDeadline")} /></Field>
      </div>

      <Field label="Poster Image (optional)"><input type="file" accept="image/*" onChange={(e) => setPosterFile(e.target.files[0] || null)} /></Field>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
        <input
          type="checkbox"
          id="requiresApproval"
          checked={form.requiresApproval}
          onChange={(e) => setForm((f) => ({ ...f, requiresApproval: e.target.checked }))}
          style={{ width: 18, height: 18, cursor: "pointer" }}
        />
        <label htmlFor="requiresApproval" style={{ fontSize: 13, color: "var(--text1)", fontWeight: 600, cursor: "pointer" }}>
          Require Organizer Approval
        </label>
      </div>
      <InfoBox color="var(--indigo)" icon="ℹ">
        {form.requiresApproval
          ? "Registrations will stay Pending until you approve them."
          : "Registrations are automatically approved as long as capacity allows."}
      </InfoBox>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: ".5rem" }}>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={submit} loading={loading}>Submit for Admin Approval</Btn>
      </div>
    </Modal>
  );
}

// ── MyEventsPage ──────────────────────────────────────────────────────────────
export function MyEventsPage({ refreshCounts }) {
  const { notify } = useToast();
  const [events,    setEvents]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await eventsAPI.getAll(); setEvents(r.data.data); }
    catch (e) { notify(e.response?.data?.error || e.message, "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleReg = async (id) => { await eventsAPI.toggleReg(id); notify("Status updated", "success"); load(); };
  const deleteEv  = async (id) => { if (!confirm("Delete?")) return; await eventsAPI.remove(id); notify("Event deleted", "error"); load(); refreshCounts(); };

  return (
    <div>
      <PageHeader title="My Events" subtitle="Events you've submitted. Admin must approve before going live." icon="📋" action={<Btn variant="primary" onClick={() => setShowCreate(true)}>✨ Submit Event</Btn>} />
      <InfoBox color="var(--indigo)" icon="ℹ">New events require admin approval. Once approved, students can see and register. Rejected events include admin feedback.</InfoBox>
      {loading ? [0,1,2].map((i) => <div key={i} style={{ height: 80, background: "var(--bg2)", borderRadius: "var(--r12)", marginBottom: 10 }} className="skeleton" />) :
       events.length === 0 ? <EmptyState icon="⊞" title="No events yet" sub="Submit your first event for admin review." action={<Btn variant="primary" onClick={() => setShowCreate(true)}>+ Submit Event</Btn>} /> : (
        <div style={{ display: "grid", gap: 10 }}>
          {events.map((ev) => {
            const pending  = ev.pendingCount || 0;
            const approved = ev.teamCount    || 0;
            return (
              <div key={ev._id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.25rem 1.5rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{ev.image}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, color: "var(--text1)", fontSize: 14 }}>{ev.name}</span>
                      <Badge label={`Admin: ${ev.approvalStatus}`} />
                      {ev.approvalStatus === "Approved" && <Badge label={`Reg: ${ev.regStatus}`} />}
                      {pending > 0 && <span style={{ fontSize: 11, background: "var(--amber-dim)", color: "var(--amber)", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{pending} team{pending > 1 ? "s" : ""} pending</span>}
                    </div>
                    <p style={{ margin: "0 0 4px", fontSize: 12, color: "var(--text3)" }}>{ev.date} · {ev.venue} · {approved}/{ev.maxTeams} teams approved</p>
                    {ev.approvalStatus === "Rejected" && ev.rejectReason && (
                      <div style={{ marginTop: 8, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderLeft: "3px solid var(--rose)", borderRadius: 10, padding: "9px 12px" }}>
                        <p style={{ margin: "0 0 3px", fontSize: 10, color: "var(--rose)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>Admin Feedback</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#fca5a5", lineHeight: 1.5 }}>{ev.rejectReason}</p>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
                    {ev.approvalStatus === "Approved" && (
                      <Btn size="sm" variant={ev.regStatus === "Open" ? "danger" : "success"} onClick={() => toggleReg(ev._id)}>
                        {ev.regStatus === "Open" ? "Close Reg" : "Open Reg"}
                      </Btn>
                    )}
                    <Btn size="sm" variant="danger" onClick={() => deleteEv(ev._id)}>Delete</Btn>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); notify("Event submitted for admin approval!", "success"); load(); refreshCounts(); }} />}
    </div>
  );
}

// ── EventApprovalsPage ────────────────────────────────────────────────────────
export function EventApprovalsPage({ refreshCounts }) {
  const { notify }  = useToast();
  const [events,    setEvents]   = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [rejectEv,  setRejectEv] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await eventsAPI.getAll(); setEvents(r.data.data); }
    catch (e) { notify(e.response?.data?.error || e.message, "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve  = async (id) => { await eventsAPI.approve(id); notify("Event approved and published!", "success"); load(); refreshCounts(); };
  const deleteEv = async (id) => { if (!confirm("Delete?")) return; await eventsAPI.remove(id); notify("Deleted", "error"); load(); refreshCounts(); };

  const grouped = { Pending: events.filter((e) => e.approvalStatus === "Pending"), Approved: events.filter((e) => e.approvalStatus === "Approved"), Rejected: events.filter((e) => e.approvalStatus === "Rejected") };
  const colors  = { Pending: "var(--amber)", Approved: "var(--green)", Rejected: "var(--red)" };
  const icons   = { Pending: "⏳", Approved: "✓", Rejected: "✕" };

  return (
    <div>
      <PageHeader title="Event Approvals" subtitle="Review and approve events submitted by organizers." icon="📋" />
      <InfoBox color="var(--indigo)" icon="ℹ">Approved events go live immediately. Rejected events return to the organizer with your feedback.</InfoBox>
      {loading ? [0,1,2].map((i) => <div key={i} style={{ height: 100, borderRadius: "var(--r14)", marginBottom: 10 }} className="skeleton" />) :
       events.length === 0 ? <EmptyState icon="🎪" title="No events submitted" sub="Organizers haven't submitted any events yet." /> :
       ["Pending","Approved","Rejected"].map((status) => grouped[status].length > 0 && (
        <div key={status} style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: colors[status], marginBottom: ".75rem" }}>{icons[status]} {status} ({grouped[status].length})</p>
          <div style={{ display: "grid", gap: 10 }}>
            {grouped[status].map((ev) => (
              <div key={ev._id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${status === "Pending" ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.08)"}`, borderRadius: 16, padding: "1.25rem 1.5rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{ev.image}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontWeight: 800, color: "var(--text1)", fontSize: 15, letterSpacing: "-0.02em" }}>{ev.name}</span>
                      <Badge label={ev.category} />
                    </div>
                    <p style={{ margin: "0 0 4px", fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{ev.description}</p>
                    <p style={{ margin: "0 0 3px", fontSize: 12, color: "var(--text3)" }}>📅 {ev.date} · 📍 {ev.venue} · 👥 Max {ev.maxTeams} teams</p>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--text3)" }}>Submitted by: <span style={{ color: "var(--indigo)", fontWeight: 600 }}>{ev.organizer?.name}</span></p>
                    {ev.rejectReason && <div style={{ marginTop: 8, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderLeft: "3px solid var(--rose)", borderRadius: 10, padding: "8px 12px" }}><p style={{ margin: 0, fontSize: 12, color: "#fca5a5", lineHeight: 1.5 }}>Your feedback: {ev.rejectReason}</p></div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, flexShrink: 0 }}>
                    {status === "Pending" && (
                      <><Btn size="sm" variant="success" onClick={() => approve(ev._id)}>✓ Approve</Btn>
                      <Btn size="sm" variant="danger" onClick={() => setRejectEv(ev)}>✕ Reject</Btn></>
                    )}
                    {status !== "Pending" && <Btn size="sm" variant="danger" onClick={() => deleteEv(ev._id)}>🗑 Delete</Btn>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {rejectEv && <RejectModal title={`Reject: ${rejectEv.name}`} onClose={() => setRejectEv(null)} onConfirm={async (r) => { await eventsAPI.reject(rejectEv._id, r); notify("Event rejected", "error"); setRejectEv(null); load(); refreshCounts(); }} />}
    </div>
  );
}
