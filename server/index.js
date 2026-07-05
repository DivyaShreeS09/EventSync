const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// Trust the first hop reverse proxy/load balancer so req.protocol reflects the
// real (https) scheme in production — used to build correct absolute URLs (OD API).
app.set("trust proxy", 1);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",         require("./routes/auth"));
app.use("/api/events",       require("./routes/events"));
app.use("/api/teams",        require("./routes/teams"));
app.use("/api/notifications",require("./routes/notifications"));
app.use("/api/analytics",    require("./routes/analytics"));
app.use("/api/users",        require("./routes/users"));
app.use("/api/od",           require("./routes/od"));
app.use("/api/solo",         require("./routes/solo"));

// ── Serve React frontend in production ─────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "../client/dist/index.html"))
  );
}

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Server Error",
  });
});

// ── Connect DB & Start ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await seedDatabase();
    app.listen(PORT, () =>
      console.log(`🚀 EventSync server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// ── Seed Demo Data ────────────────────────────────────────────────────────────
async function seedDatabase() {
  const User  = require("./models/User");
  const Event = require("./models/Event");
  const Team  = require("./models/Team");

  const count = await User.countDocuments();
  if (count > 0) return;

  console.log("🌱 Seeding demo data...");

  const bcrypt = require("bcryptjs");

  // Users
  const users = await User.insertMany([
    { name: "Admin User",      email: "admin@eventsync.com",   password: await bcrypt.hash("admin123",   10), role: "Admin",     college: "CampusConnect HQ" },
    { name: "Dr. Meena K",     email: "meena@eventsync.com",   password: await bcrypt.hash("org123",     10), role: "Organizer", college: "SRM University" },
    { name: "Prof. Ramesh I",  email: "ramesh@eventsync.com",  password: await bcrypt.hash("org123",     10), role: "Organizer", college: "VIT Chennai" },
    { name: "Arjun Krishnan",  email: "arjun@eventsync.com",   password: await bcrypt.hash("student123", 10), role: "Student",   college: "Anna University" },
    { name: "Priya Sharma",    email: "priya@eventsync.com",   password: await bcrypt.hash("student123", 10), role: "Student",   college: "Loyola College" },
    { name: "Karan Mehta",     email: "karan@eventsync.com",   password: await bcrypt.hash("student123", 10), role: "Student",   college: "CEG Chennai" },
  ]);

  const [admin, org1, org2, stu1] = users;

  // Events
  const events = await Event.insertMany([
    { name: "HackVerse 2026",       category: "Technical", date: "2026-04-10", venue: "CS Block A",       maxTeams: 20, description: "24-hour hackathon open to all engineering students. Build innovative solutions.", image: "⚡", regStatus: "Open",   approvalStatus: "Approved", organizer: org1._id },
    { name: "Culturanza Fest",      category: "Cultural",  date: "2026-04-15", venue: "Main Auditorium",  maxTeams: 30, description: "Annual inter-college cultural extravaganza featuring dance, drama and music.",   image: "🎭", regStatus: "Open",   approvalStatus: "Approved", organizer: org2._id },
    { name: "Robowar Championship", category: "Technical", date: "2026-04-18", venue: "Workshop Hall",    maxTeams: 16, description: "Combat robotics competition. Build a bot, fight to win.",                         image: "🤖", regStatus: "Open",   approvalStatus: "Pending",  organizer: org1._id },
    { name: "Athletics Grand Prix", category: "Sports",    date: "2026-04-22", venue: "Stadium",          maxTeams: 50, description: "Track and field events for all colleges across the region.",                     image: "🏃", regStatus: "Closed", approvalStatus: "Approved", organizer: org2._id },
    { name: "CodeQuest 2026",       category: "Technical", date: "2026-05-02", venue: "Lab Complex",      maxTeams: 25, description: "Competitive programming contest across multiple rounds.",                        image: "💻", regStatus: "Open",   approvalStatus: "Rejected", organizer: org1._id, rejectReason: "Date clashes with another event. Please reschedule to early May." },
    { name: "Crescendo Music Fest", category: "Cultural",  date: "2026-05-10", venue: "Open Air Theatre", maxTeams: 20, description: "Showcase your musical talent — solo, band, or fusion.",                         image: "🎵", regStatus: "Open",   approvalStatus: "Approved", organizer: org2._id },
  ]);

  const [ev1, ev2, ev3, ev4] = events;

  // Teams
  await Team.insertMany([
    { name: "CodeCrafters", college: "SRM University",        leader: "Arjun Krishnan", members: [{ name: "Arjun Krishnan", isLeader: true }, { name: "Priya Sharma" }, { name: "Karan Mehta" }],             event: ev1._id, student: stu1._id, approvalStatus: "Approved" },
    { name: "BitBusters",   college: "VIT Chennai",           leader: "Sneha Rajan",   members: [{ name: "Sneha Rajan",   isLeader: true }, { name: "Dev Patel" },   { name: "Amith S" }],                   event: ev1._id, student: stu1._id, approvalStatus: "Approved" },
    { name: "NullPointers", college: "Anna University",       leader: "Rahul Verma",   members: [{ name: "Rahul Verma",   isLeader: true }, { name: "Nidhi K" }],                                            event: ev1._id, student: stu1._id, approvalStatus: "Pending"  },
    { name: "Rhythm Crew",  college: "Loyola College",        leader: "Nisha Thomas",  members: [{ name: "Nisha Thomas",  isLeader: true }, { name: "Ravi Anand" },  { name: "Pooja Lal" }, { name: "Sam D" }], event: ev2._id, student: stu1._id, approvalStatus: "Approved" },
    { name: "StarStruck",   college: "Madras Christian",      leader: "Priya Menon",   members: [{ name: "Priya Menon",   isLeader: true }, { name: "Arun L" }],                                             event: ev2._id, student: stu1._id, approvalStatus: "Pending"  },
    { name: "IronFist",     college: "CEG Chennai",           leader: "Mani Selvan",   members: [{ name: "Mani Selvan",   isLeader: true }, { name: "Rohit M" }],                                            event: ev4._id, student: stu1._id, approvalStatus: "Approved" },
  ]);

  console.log("✅ Seed complete — 6 users, 6 events, 6 teams");
}
