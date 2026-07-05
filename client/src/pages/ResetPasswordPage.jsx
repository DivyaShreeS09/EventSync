import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { authAPI } from "../api";
import { useToast } from "../context/ToastContext";
import { Field, Btn, Spinner } from "../components/UI";

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const { notify } = useToast();

  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [done,    setDone]    = useState(false);

  const strengthOk = PASSWORD_RULE.test(password);

  const submit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) { setError("Please fill in both fields"); return; }
    if (password !== confirmPassword)  { setError("Passwords do not match"); return; }
    if (!strengthOk) { setError("Password must be at least 6 characters and include both letters and numbers"); return; }

    setLoading(true); setError("");
    try {
      await authAPI.resetPassword(token, password, confirmPassword);
      setDone(true);
      notify("Password reset successful — please sign in", "success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <div className="orb" style={{ width: 500, height: 500, top: "-15%", left: "-10%", background: "rgba(155,35,53,0.18)", animationDelay: "0s" }} />
      <div className="orb" style={{ width: 350, height: 350, bottom: "-10%", right: "-5%", background: "rgba(196,67,90,0.14)", animationDelay: "-5s" }} />

      <div className="fade-in" style={{
        width: "min(420px, 92vw)", position: "relative", zIndex: 2,
        background: "rgba(9,9,26,0.9)", backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 22,
        padding: "2.5rem 2.25rem", boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg,#9B2335,#7A1A28,#C4435A)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
          }}>⚡</div>
          <span className="grad-text" style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.03em" }}>CampusConnect</span>
        </div>

        {done ? (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text1)", marginBottom: 10 }}>Password reset ✅</h2>
            <p style={{ fontSize: 13.5, color: "var(--text3)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              Your password has been changed successfully. Redirecting you to sign in…
            </p>
            <Link to="/login" style={{ textDecoration: "none" }}><Btn full>Go to Sign In →</Btn></Link>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text1)", marginBottom: 6 }}>Set a new password</h2>
            <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: "1.5rem" }}>
              Choose a new password for your account. This link can only be used once.
            </p>

            {error && (
              <div style={{
                background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.3)",
                borderRadius: 10, padding: "11px 14px", marginBottom: "1.25rem",
                fontSize: 13, color: "#fca5a5", display: "flex", alignItems: "center", gap: 8,
              }}>
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={submit}>
              <Field label="New Password" required>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoFocus />
              </Field>
              <p style={{ margin: "-8px 0 12px", fontSize: 11, color: password && !strengthOk ? "var(--rose)" : "var(--text3)" }}>
                Must be 6+ characters with at least one letter and one number.
              </p>
              <Field label="Confirm Password" required>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
              </Field>

              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "13px", borderRadius: "var(--r12)",
                background: "linear-gradient(135deg, #9B2335, #7A1A28, #C4435A)",
                backgroundSize: "200% auto",
                color: "#fff", fontWeight: 700, fontSize: 15,
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 8px 32px rgba(155,35,53,0.45)",
                marginTop: 4,
              }}>
                {loading ? <Spinner size={16} color="#fff" /> : "Reset Password →"}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: 13, color: "var(--text3)" }}>
              <Link to="/forgot-password" style={{ color: "var(--indigo)", fontWeight: 600, textDecoration: "none" }}>Request a new link</Link>
              {" · "}
              <Link to="/login" style={{ color: "var(--indigo)", fontWeight: 600, textDecoration: "none" }}>Back to Sign In</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
