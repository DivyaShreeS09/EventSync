import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../api";
import { Field, Btn, Spinner } from "../components/UI";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [sent,    setSent]    = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address"); return; }
    setLoading(true); setError("");
    try {
      await authAPI.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      // Backend always returns a generic success response; this only fires on
      // genuine network/server failures, so it's safe to show directly.
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

        {sent ? (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text1)", marginBottom: 10 }}>Check your email 📬</h2>
            <p style={{ fontSize: 13.5, color: "var(--text3)", lineHeight: 1.7, marginBottom: "1.75rem" }}>
              If <strong style={{ color: "var(--text2)" }}>{email}</strong> is registered with EventSync, a password reset link has been sent.
              It will expire in 30 minutes. Check your spam folder if you don't see it soon.
            </p>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <Btn full>← Back to Sign In</Btn>
            </Link>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text1)", marginBottom: 6 }}>Forgot your password?</h2>
            <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: "1.5rem" }}>
              Enter your registered email and we'll send you a link to reset it.
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
              <Field label="Email" required>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" required autoFocus />
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
                {loading ? <Spinner size={16} color="#fff" /> : "Send Reset Link →"}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: 13, color: "var(--text3)" }}>
              Remembered your password? <Link to="/login" style={{ color: "var(--indigo)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
