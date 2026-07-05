import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3800);
  }, []);

  const remove = useCallback((id) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const TOAST_CONF = {
    success: { gradient: "linear-gradient(135deg,#9B2335,#C4435A)",  icon: "🎉", glow: "rgba(155,35,53,0.2)"   },
    error:   { gradient: "linear-gradient(135deg,#f43f5e,#f97316)",  icon: "❌", glow: "rgba(244,63,94,0.2)"   },
    warning: { gradient: "linear-gradient(135deg,#f59e0b,#f97316)",  icon: "⚠️", glow: "rgba(245,158,11,0.2)"  },
    info:    { gradient: "linear-gradient(135deg,#C9A84C,#9B2335)",  icon: "💡", glow: "rgba(201,168,76,0.2)"  },
  };

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
        {toasts.map((t) => {
          const c = TOAST_CONF[t.type] || TOAST_CONF.info;
          return (
            <div key={t.id} className="slide-in" style={{
              background: "rgba(9,9,26,0.96)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 14,
              display: "flex",
              alignItems: "stretch",
              minWidth: 300, maxWidth: 420,
              boxShadow: `0 20px 56px rgba(0,0,0,0.65), 0 0 30px ${c.glow}`,
              pointerEvents: "all",
              overflow: "hidden",
            }}>
              {/* Gradient left bar */}
              <div style={{ width: 4, background: c.gradient, flexShrink: 0 }} />
              {/* Icon */}
              <div style={{ padding: "14px 12px 14px 14px", display: "flex", alignItems: "center", fontSize: 18 }}>{c.icon}</div>
              {/* Message */}
              <div style={{ flex: 1, padding: "14px 6px", display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: 13.5, color: "var(--text1)", lineHeight: 1.5, fontWeight: 500 }}>{t.message}</span>
              </div>
              {/* Close */}
              <button
                onClick={() => remove(t.id)}
                style={{ background: "none", border: "none", color: "var(--text3)", fontSize: 14, cursor: "pointer", padding: "0 14px", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--text1)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text3)"}
              >✕</button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
