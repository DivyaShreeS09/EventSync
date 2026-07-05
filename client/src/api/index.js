import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:       (data)   => api.post("/auth/login",    data),
  register:    (data)   => api.post("/auth/register", data),
  me:          ()       => api.get("/auth/me"),
  updateProfile:(data)  => api.put("/auth/profile",   data),
  forgotPassword:(email) => api.post("/auth/forgot-password", { email }),
  resetPassword:(token, password, confirmPassword) => api.post(`/auth/reset-password/${token}`, { password, confirmPassword }),
};

// ── Events ────────────────────────────────────────────────────────────────────
export const eventsAPI = {
  getAll:      ()       => api.get("/events"),
  getById:     (id)     => api.get(`/events/${id}`),
  create:      (data)   => api.post("/events",               data),
  update:      (id, d)  => api.put(`/events/${id}`,          d),
  remove:      (id)     => api.delete(`/events/${id}`),
  approve:     (id)     => api.patch(`/events/${id}/approve`),
  reject:      (id, r)  => api.patch(`/events/${id}/reject`,      { reason: r }),
  toggleReg:   (id)     => api.patch(`/events/${id}/toggle-reg`),
  getTeams:    (id)     => api.get(`/events/${id}/teams`),
  getSolo:     (id)     => api.get(`/events/${id}/solo`),
  uploadPoster:(id, formData) => api.post(`/events/${id}/poster`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
};

// ── Teams ─────────────────────────────────────────────────────────────────────
export const teamsAPI = {
  getAll:      ()       => api.get("/teams"),
  getById:     (id)     => api.get(`/teams/${id}`),
  create:      (data)   => api.post("/teams",               data),
  approve:     (id)     => api.patch(`/teams/${id}/approve`),
  reject:      (id, r)  => api.patch(`/teams/${id}/reject`, { reason: r }),
  remove:      (id)     => api.delete(`/teams/${id}`),
};

// ── Solo Registrations ────────────────────────────────────────────────────────
export const soloAPI = {
  getAll:      ()       => api.get("/solo"),
  getById:     (id)     => api.get(`/solo/${id}`),
  create:      (data)   => api.post("/solo",               data),
  approve:     (id)     => api.patch(`/solo/${id}/approve`),
  reject:      (id, r)  => api.patch(`/solo/${id}/reject`, { reason: r }),
  remove:      (id)     => api.delete(`/solo/${id}`),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notifAPI = {
  getAll:      ()       => api.get("/notifications"),
  readAll:     ()       => api.patch("/notifications/read-all"),
  remove:      (id)     => api.delete(`/notifications/${id}`),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  get:         ()       => api.get("/analytics"),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll:      ()       => api.get("/users"),
  remove:      (id)     => api.delete(`/users/${id}`),
};

export default api;
