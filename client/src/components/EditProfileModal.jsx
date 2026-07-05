import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authAPI } from "../api";
import { Modal, Field, Btn, InfoBox } from "./UI";

export default function EditProfileModal({ onClose }) {
  const { user, updateUser } = useAuth();
  const { notify } = useToast();
  const [form, setForm] = useState({
    name: user.name || "", email: user.email || "",
    college: user.college || "", program: user.program || "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const profileIncomplete = user.role === "Student" && (!user.registerNo || !user.college || !user.program);

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required"); return; }
    setLoading(true); setError("");
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      notify("Profile updated", "success");
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally { setLoading(false); }
  };

  return (
    <Modal title="Edit Profile" subtitle="Update your account details" onClose={onClose}>
      {profileIncomplete && (
        <div style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10, padding: "11px 14px", marginBottom: "1rem", fontSize: 13, color: "var(--amber)", display:"flex", gap:8, alignItems:"center" }}>
          <span>⚠</span> Please complete your profile before registering for events.
        </div>
      )}
      {error && <div style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 10, padding: "11px 14px", marginBottom: "1rem", fontSize: 13, color: "#fca5a5", display:"flex", gap:8, alignItems:"center" }}><span>⚠</span>{error}</div>}

      {user.role === "Student" && (
        <Field label="Register Number">
          <input value={user.registerNo || "—"} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
        </Field>
      )}

      <Field label="Full Name" required><input value={form.name} onChange={set("name")} placeholder="Your full name" /></Field>
      <Field label="Email" required><input type="email" value={form.email} onChange={set("email")} placeholder="you@college.edu" /></Field>
      <Field label="College"><input value={form.college} onChange={set("college")} placeholder="Your college" /></Field>
      <Field label="Program"><input value={form.program} onChange={set("program")} placeholder="e.g. B.E. CSE AIML" /></Field>

      <InfoBox color="var(--indigo)" icon="ℹ">
        Role, password, and register number cannot be changed here. Changes apply to any registrations you submit after saving.
      </InfoBox>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: ".5rem" }}>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={submit} loading={loading}>Save Changes</Btn>
      </div>
    </Modal>
  );
}
