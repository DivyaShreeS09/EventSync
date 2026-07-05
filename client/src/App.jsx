import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider }         from "./context/ToastContext";
import Layout                    from "./components/Layout";
import LoginPage                 from "./pages/LoginPage";
import ForgotPasswordPage        from "./pages/ForgotPasswordPage";
import ResetPasswordPage         from "./pages/ResetPasswordPage";
import DashboardPage             from "./pages/DashboardPage";
import { EventsPage, MyEventsPage, EventApprovalsPage } from "./pages/EventPages";
import { MyTeamsPage, TeamApprovalsPage, AllTeamsPage } from "./pages/TeamPages";
import { AnalyticsPage, UsersPage }                     from "./pages/OtherPages";
import RegistrationDetailPage    from "./pages/RegistrationDetailPage";
import { eventsAPI, teamsAPI } from "./api";
import { Spinner } from "./components/UI";

// ── Protected Route ───────────────────────────────────────────────────────────
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location          = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg0)" }}>
        <Spinner size={36} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
}

// ── AppRoutes (inside Auth context) ──────────────────────────────────────────
function AppRoutes() {
  const { user } = useAuth();
  const [pendingCounts, setPendingCounts] = useState({ pendingEvents: 0, pendingTeams: 0 });

  const refreshCounts = useCallback(async () => {
    if (!user) return;
    try {
      if (user.role === "Admin") {
        const [evRes, teamRes] = await Promise.all([eventsAPI.getAll(), teamsAPI.getAll()]);
        setPendingCounts({
          pendingEvents: evRes.data.data.filter((e) => e.approvalStatus === "Pending").length,
          pendingTeams:  teamRes.data.data.filter((t) => t.approvalStatus === "Pending").length,
        });
      } else if (user.role === "Organizer") {
        const [evRes, teamRes] = await Promise.all([eventsAPI.getAll(), teamsAPI.getAll()]);
        setPendingCounts({
          pendingEvents: evRes.data.data.filter((e) => e.approvalStatus === "Pending").length,
          pendingTeams:  teamRes.data.data.filter((t) => t.approvalStatus === "Pending").length,
        });
      }
    } catch (_) {}
  }, [user]);

  useEffect(() => {
    refreshCounts();
    const iv = setInterval(refreshCounts, 20000);
    return () => clearInterval(iv);
  }, [refreshCounts]);

  // Wrap authenticated pages in Layout
  const withLayout = (Component, roles, props = {}) => (
    <ProtectedRoute roles={roles}>
      <Layout pendingCounts={pendingCounts}>
        <Component refreshCounts={refreshCounts} {...props} />
      </Layout>
    </ProtectedRoute>
  );

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Shared */}
      <Route path="/dashboard" element={withLayout(DashboardPage)} />
      <Route path="/events"    element={withLayout(EventsPage, undefined, { refreshCounts })} />
      <Route path="/registrations/:type/:id" element={withLayout(RegistrationDetailPage)} />

      {/* Student */}
      <Route path="/my-teams"        element={withLayout(MyTeamsPage,  ["Student"])} />

      {/* Organizer */}
      <Route path="/my-events"       element={withLayout(MyEventsPage,       ["Organizer"])} />
      <Route path="/team-approvals"  element={withLayout(TeamApprovalsPage,  ["Organizer"])} />

      {/* Admin */}
      <Route path="/event-approvals" element={withLayout(EventApprovalsPage, ["Admin"])} />
      <Route path="/all-teams"       element={withLayout(AllTeamsPage,       ["Admin"])} />
      <Route path="/users"           element={withLayout(UsersPage,          ["Admin"])} />
      <Route path="/analytics"       element={withLayout(AnalyticsPage,      ["Admin"])} />

      {/* Redirects */}
      <Route path="/"   element={<Navigate to="/dashboard" replace />} />
      <Route path="*"   element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}
