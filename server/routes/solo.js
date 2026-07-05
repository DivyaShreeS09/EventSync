const express          = require("express");
const router           = express.Router();
const SoloRegistration = require("../models/SoloRegistration");
const Team             = require("../models/Team");
const Event            = require("../models/Event");
const Notification     = require("../models/Notification");
const { protect, authorize } = require("../middleware/auth");

// @route  GET /api/solo
// @desc   Get solo registrations (role-filtered)
router.get("/", protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "Student") filter = { student: req.user._id };
    if (req.user.role === "Organizer") {
      const events = await Event.find({ organizer: req.user._id }).select("_id");
      filter = { event: { $in: events.map((e) => e._id) } };
    }
    const regs = await SoloRegistration.find(filter)
      .populate("event", "name category image organizer")
      .populate("student", "name email college")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: regs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  GET /api/solo/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const reg = await SoloRegistration.findById(req.params.id)
      .populate("event", "name category image date venue organizer")
      .populate("student", "name email college");
    if (!reg) return res.status(404).json({ success: false, error: "Registration not found" });
    res.json({ success: true, data: reg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  POST /api/solo
// @access Student
router.post("/", protect, authorize("Student"), async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId)
      return res.status(400).json({ success: false, error: "eventId is required" });

    // Identity always comes from the authenticated account — never from the client body.
    // This prevents a student from registering under someone else's register number.
    if (!req.user.registerNo?.trim() || !req.user.college?.trim() || !req.user.program?.trim())
      return res.status(400).json({ success: false, error: "Please complete your profile before registering for events." });

    const event = await Event.findById(eventId).populate("organizer", "name _id");
    if (!event) return res.status(404).json({ success: false, error: "Event not found" });
    if (event.approvalStatus !== "Approved") return res.status(400).json({ success: false, error: "Event is not approved yet" });
    if (event.regStatus !== "Open")          return res.status(400).json({ success: false, error: "Registration is closed for this event" });
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline))
      return res.status(400).json({ success: false, error: "Registration deadline for this event has passed" });
    if (event.registrationType === "TEAM")   return res.status(400).json({ success: false, error: "This event only accepts team registrations" });

    const normalizedRegNo = req.user.registerNo.trim().toUpperCase();
    const already = await SoloRegistration.findOne({ event: eventId, registerNo: normalizedRegNo });
    if (already)
      return res.status(409).json({ success: false, error: "You have already registered for this event" });

    // Shared capacity pool with Team registrations
    const approvedTeamCount = await Team.countDocuments({ event: eventId, approvalStatus: "Approved" });
    const approvedSoloCount = await SoloRegistration.countDocuments({ event: eventId, approvalStatus: "Approved" });
    if (approvedTeamCount + approvedSoloCount >= event.maxTeams)
      return res.status(400).json({ success: false, error: "Event has reached maximum capacity" });

    const reg = await SoloRegistration.create({
      registerNo: normalizedRegNo,
      name:    req.user.name,
      email:   req.user.email,
      college: req.user.college || "",
      program: req.user.program || "",
      event:   eventId,
      student: req.user._id,
      approvalStatus: event.requiresApproval ? "Pending" : "Approved",
    });

    await Notification.create({
      user:    event.organizer._id,
      message: event.requiresApproval
        ? `${req.user.name} (${normalizedRegNo}) registered solo for "${event.name}" — awaiting your approval.`
        : `${req.user.name} (${normalizedRegNo}) auto-approved for "${event.name}" (registration doesn't require approval).`,
      type: event.requiresApproval ? "warning" : "info",
    });

    const populated = await SoloRegistration.findById(reg._id)
      .populate("event", "name category image")
      .populate("student", "name email college");

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ success: false, error: "You have already registered for this event with this register number" });
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  PATCH /api/solo/:id/approve
// @access Organizer | Admin
router.patch("/:id/approve", protect, authorize("Organizer", "Admin"), async (req, res) => {
  try {
    const reg = await SoloRegistration.findById(req.params.id)
      .populate("event", "name organizer maxTeams")
      .populate("student", "name _id");
    if (!reg) return res.status(404).json({ success: false, error: "Registration not found" });

    if (req.user.role === "Organizer" && reg.event.organizer.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, error: "Not your event" });

    if (!reg.registerNo || !reg.registerNo.trim())
      return res.status(400).json({ success: false, error: "Cannot approve: register number is missing" });

    if (reg.approvalStatus !== "Approved") {
      const approvedTeamCount = await Team.countDocuments({ event: reg.event._id, approvalStatus: "Approved" });
      const approvedSoloCount = await SoloRegistration.countDocuments({ event: reg.event._id, approvalStatus: "Approved" });
      if (approvedTeamCount + approvedSoloCount >= reg.event.maxTeams)
        return res.status(400).json({ success: false, error: "Cannot approve: event has reached maximum capacity" });
    }

    reg.approvalStatus = "Approved";
    reg.rejectReason   = "";
    await reg.save();

    await Notification.create({
      user:    reg.student._id,
      message: `Your solo registration for "${reg.event.name}" has been approved!`,
      type:    "success",
    });

    res.json({ success: true, message: "Registration approved", data: reg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  PATCH /api/solo/:id/reject
// @access Organizer | Admin
router.patch("/:id/reject", protect, authorize("Organizer", "Admin"), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim())
      return res.status(400).json({ success: false, error: "Rejection reason is required" });

    const reg = await SoloRegistration.findById(req.params.id)
      .populate("event", "name organizer")
      .populate("student", "name _id");
    if (!reg) return res.status(404).json({ success: false, error: "Registration not found" });

    if (req.user.role === "Organizer" && reg.event.organizer.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, error: "Not your event" });

    reg.approvalStatus = "Rejected";
    reg.rejectReason   = reason;
    await reg.save();

    await Notification.create({
      user:    reg.student._id,
      message: `Your solo registration for "${reg.event.name}" was rejected. Reason: ${reason}`,
      type:    "error",
    });

    res.json({ success: true, message: "Registration rejected", data: reg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  DELETE /api/solo/:id
// @access Organizer | Admin
router.delete("/:id", protect, authorize("Organizer", "Admin"), async (req, res) => {
  try {
    await SoloRegistration.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Registration removed" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
