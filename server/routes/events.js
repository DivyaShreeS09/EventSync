const express      = require("express");
const router       = express.Router();
const multer       = require("multer");
const path         = require("path");
const fs           = require("fs");
const Event            = require("../models/Event");
const Team             = require("../models/Team");
const Notification     = require("../models/Notification");
const User             = require("../models/User");
const SoloRegistration = require("../models/SoloRegistration");
const { protect, authorize } = require("../middleware/auth");

// ── Poster upload (multer) ──────────────────────────────────────────────────────
const postersDir = path.join(__dirname, "..", "uploads", "posters");
fs.mkdirSync(postersDir, { recursive: true });

const posterStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, postersDir),
  filename: (req, file, cb) => cb(null, `${req.params.id}-${Date.now()}${path.extname(file.originalname)}`),
});
const uploadPoster = multer({
  storage: posterStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files (jpeg, png, webp, gif) are allowed"));
  },
});

// Helper: populate event with organizer + virtual counts
const populateEvent = (query) =>
  query
    .populate("organizer", "name email college")
    .populate("teamCount")
    .populate("pendingCount");

// @route  GET /api/events
// @desc   Get events (role-filtered)
// @access Private
router.get("/", protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "Student")   filter = { approvalStatus: "Approved" };
    if (req.user.role === "Organizer") filter = { organizer: req.user._id };
    // Admin sees all

    const events = await populateEvent(
      Event.find(filter).sort({ createdAt: -1 })
    );
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  GET /api/events/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const event = await populateEvent(Event.findById(req.params.id));
    if (!event) return res.status(404).json({ success: false, error: "Event not found" });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  POST /api/events
// @access Organizer
router.post("/", protect, authorize("Organizer"), async (req, res) => {
  try {
    const {
      name, category, date, venue, maxTeams, description, image,
      registrationType, requiresApproval, registrationDeadline, visibility,
    } = req.body;
    if (!name || !category || !date || !venue)
      return res.status(400).json({ success: false, error: "name, category, date and venue are required" });

    const event = await Event.create({
      name, category, date, venue,
      maxTeams: maxTeams || 20,
      description: description || "",
      image: image || "⚡",
      organizer: req.user._id,
      approvalStatus: "Pending",
      registrationType: registrationType || "TEAM",
      requiresApproval: requiresApproval !== undefined ? requiresApproval : true,
      registrationDeadline: registrationDeadline || null,
      visibility: visibility || "PUBLIC",
    });

    // Notify all admins
    const admins = await User.find({ role: "Admin" });
    await Notification.insertMany(
      admins.map((a) => ({
        user:    a._id,
        message: `New event "${name}" submitted by ${req.user.name} — awaiting your approval.`,
        type:    "warning",
      }))
    );

    const populated = await populateEvent(Event.findById(event._id));
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  PUT /api/events/:id
// @access Organizer (own) | Admin
router.put("/:id", protect, authorize("Organizer", "Admin"), async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, error: "Event not found" });

    if (req.user.role === "Organizer" && event.organizer.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, error: "Not your event" });

    const {
      name, category, date, venue, maxTeams, description, image,
      registrationType, requiresApproval, registrationDeadline, visibility,
    } = req.body;
    event = await Event.findByIdAndUpdate(
      req.params.id,
      { name, category, date, venue, maxTeams, description, image, registrationType, requiresApproval, registrationDeadline, visibility },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  POST /api/events/:id/poster
// @access Organizer (own) | Admin
router.post("/:id/poster", protect, authorize("Organizer", "Admin"), uploadPoster.single("poster"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, error: "Event not found" });

    if (req.user.role === "Organizer" && event.organizer.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, error: "Not your event" });

    if (!req.file) return res.status(400).json({ success: false, error: "Poster file is required" });

    event.poster = `/uploads/posters/${req.file.filename}`;
    await event.save();

    const populated = await populateEvent(Event.findById(event._id));
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  PATCH /api/events/:id/approve
// @access Admin
router.patch("/:id/approve", protect, authorize("Admin"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("organizer", "name");
    if (!event) return res.status(404).json({ success: false, error: "Event not found" });

    event.approvalStatus = "Approved";
    event.rejectReason   = "";
    await event.save();

    // Notify organizer
    await Notification.create({
      user:    event.organizer._id,
      message: `Your event "${event.name}" has been approved and is now live for student registration!`,
      type:    "success",
    });

    res.json({ success: true, message: "Event approved", data: event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  PATCH /api/events/:id/reject
// @access Admin
router.patch("/:id/reject", protect, authorize("Admin"), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim())
      return res.status(400).json({ success: false, error: "Rejection reason is required" });

    const event = await Event.findById(req.params.id).populate("organizer", "name");
    if (!event) return res.status(404).json({ success: false, error: "Event not found" });

    event.approvalStatus = "Rejected";
    event.rejectReason   = reason;
    await event.save();

    // Notify organizer
    await Notification.create({
      user:    event.organizer._id,
      message: `Your event "${event.name}" was rejected. Admin feedback: ${reason}`,
      type:    "error",
    });

    res.json({ success: true, message: "Event rejected", data: event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  PATCH /api/events/:id/toggle-reg
// @access Organizer (own) | Admin
router.patch("/:id/toggle-reg", protect, authorize("Organizer", "Admin"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, error: "Event not found" });

    if (req.user.role === "Organizer" && event.organizer.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, error: "Not your event" });

    event.regStatus = event.regStatus === "Open" ? "Closed" : "Open";
    await event.save();
    res.json({ success: true, data: { regStatus: event.regStatus } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  DELETE /api/events/:id
// @access Organizer (own) | Admin
router.delete("/:id", protect, authorize("Organizer", "Admin"), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, error: "Event not found" });

    if (req.user.role === "Organizer" && event.organizer.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, error: "Not your event" });

    await Team.deleteMany({ event: req.params.id });
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  GET /api/events/:id/teams
router.get("/:id/teams", protect, async (req, res) => {
  try {
    const teams = await Team.find({ event: req.params.id })
      .populate("student", "name email college")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: teams });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  GET /api/events/:id/solo
router.get("/:id/solo", protect, async (req, res) => {
  try {
    const regs = await SoloRegistration.find({ event: req.params.id })
      .populate("student", "name email college")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: regs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
