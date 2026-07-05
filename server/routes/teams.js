const express          = require("express");
const router           = express.Router();
const Team             = require("../models/Team");
const Event            = require("../models/Event");
const Notification     = require("../models/Notification");
const SoloRegistration = require("../models/SoloRegistration");
const User             = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

// @route  GET /api/teams
// @desc   Get teams (role-filtered)
router.get("/", protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "Student")   filter = { student: req.user._id };
    if (req.user.role === "Organizer") {
      // Get organizer's events, return teams for those events
      const events = await Event.find({ organizer: req.user._id }).select("_id");
      filter = { event: { $in: events.map((e) => e._id) } };
    }
    // Admin sees all

    const teams = await Team.find(filter)
      .populate("event", "name category image organizer")
      .populate("student", "name email college")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: teams });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  GET /api/teams/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("event", "name category image date venue organizer")
      .populate("student", "name email college");
    if (!team) return res.status(404).json({ success: false, error: "Team not found" });
    res.json({ success: true, data: team });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  POST /api/teams
// @access Student
router.post("/", protect, authorize("Student"), async (req, res) => {
  try {
    const { name, college, members, eventId } = req.body;
    if (!name || !college || !eventId)
      return res.status(400).json({ success: false, error: "name, college and eventId are required" });

    // Leader identity always comes from the authenticated account — never from the client body.
    if (!req.user.registerNo?.trim() || !req.user.college?.trim() || !req.user.program?.trim())
      return res.status(400).json({ success: false, error: "Please complete your profile before registering for events." });

    const event = await Event.findById(eventId).populate("organizer", "name _id");
    if (!event)       return res.status(404).json({ success: false, error: "Event not found" });
    if (event.approvalStatus !== "Approved") return res.status(400).json({ success: false, error: "Event is not approved yet" });
    if (event.regStatus !== "Open")          return res.status(400).json({ success: false, error: "Registration is closed for this event" });
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline))
      return res.status(400).json({ success: false, error: "Registration deadline for this event has passed" });
    if (event.registrationType === "SOLO")   return res.status(400).json({ success: false, error: "This event only accepts solo registrations" });

    // A student may only register one (non-rejected) team per event
    const existing = await Team.findOne({ event: eventId, student: req.user._id, approvalStatus: { $ne: "Rejected" } });
    if (existing)
      return res.status(409).json({ success: false, error: "You have already registered a team for this event" });

    // Shared capacity pool with solo registrations
    const approvedTeamCount = await Team.countDocuments({ event: eventId, approvalStatus: "Approved" });
    const approvedSoloCount = await SoloRegistration.countDocuments({ event: eventId, approvalStatus: "Approved" });
    if (approvedTeamCount + approvedSoloCount >= event.maxTeams)
      return res.status(400).json({ success: false, error: "Event has reached maximum team capacity" });

    // Members are supplied as register numbers only — each must be a real existing student account.
    // Names/emails/college/program are never trusted from the client; they're fetched from the account.
    const leaderRegNo = req.user.registerNo.trim().toUpperCase();
    const memberRegNos = [...new Set((members || []).map((r) => (r || "").trim().toUpperCase()).filter(Boolean))]
      .filter((r) => r !== leaderRegNo);

    const memberUsers = await User.find({ registerNo: { $in: memberRegNos } });
    const foundMap = new Map(memberUsers.map((u) => [u.registerNo, u]));
    const missing = memberRegNos.filter((r) => !foundMap.has(r));
    if (missing.length)
      return res.status(400).json({ success: false, error: `No student account found for register number(s): ${missing.join(", ")}` });

    const membersList = [
      { name: req.user.name, registerNo: leaderRegNo, email: req.user.email, college: req.user.college || "", program: req.user.program || "", isLeader: true },
      ...memberRegNos.map((r) => {
        const u = foundMap.get(r);
        return { name: u.name, registerNo: u.registerNo, email: u.email, college: u.college || "", program: u.program || "", isLeader: false };
      }),
    ];

    const team = await Team.create({
      name,
      college,
      leader: req.user.name,
      members: membersList,
      event:   eventId,
      student: req.user._id,
      approvalStatus: event.requiresApproval ? "Pending" : "Approved",
    });

    // Notify organizer
    await Notification.create({
      user:    event.organizer._id,
      message: event.requiresApproval
        ? `Team "${name}" from ${college} registered for "${event.name}" — awaiting your approval.`
        : `Team "${name}" from ${college} auto-approved for "${event.name}" (registration doesn't require approval).`,
      type:    event.requiresApproval ? "warning" : "info",
    });

    const populated = await Team.findById(team._id)
      .populate("event", "name category image")
      .populate("student", "name email college");

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ success: false, error: "You have already registered a team for this event" });
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  PATCH /api/teams/:id/approve
// @access Organizer | Admin
router.patch("/:id/approve", protect, authorize("Organizer", "Admin"), async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("event", "name organizer maxTeams")
      .populate("student", "name _id");
    if (!team) return res.status(404).json({ success: false, error: "Team not found" });

    // Organizer can only approve teams for their own events
    if (req.user.role === "Organizer" && team.event.organizer.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, error: "Not your event" });

    const missingRegNo = (team.members || []).find((m) => !m.registerNo || !m.registerNo.trim());
    if (missingRegNo)
      return res.status(400).json({ success: false, error: `Cannot approve: member "${missingRegNo.name}" is missing a register number` });

    if (team.approvalStatus !== "Approved") {
      const approvedTeamCount = await Team.countDocuments({ event: team.event._id, approvalStatus: "Approved" });
      const approvedSoloCount = await SoloRegistration.countDocuments({ event: team.event._id, approvalStatus: "Approved" });
      if (approvedTeamCount + approvedSoloCount >= team.event.maxTeams)
        return res.status(400).json({ success: false, error: "Cannot approve: event has reached maximum capacity" });
    }

    team.approvalStatus = "Approved";
    team.rejectReason   = "";
    await team.save();

    await Notification.create({
      user:    team.student._id,
      message: `Your team "${team.name}" has been approved for "${team.event.name}"! You're officially registered.`,
      type:    "success",
    });

    res.json({ success: true, message: "Team approved", data: team });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  PATCH /api/teams/:id/reject
// @access Organizer | Admin
router.patch("/:id/reject", protect, authorize("Organizer", "Admin"), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim())
      return res.status(400).json({ success: false, error: "Rejection reason is required" });

    const team = await Team.findById(req.params.id)
      .populate("event", "name organizer")
      .populate("student", "name _id");
    if (!team) return res.status(404).json({ success: false, error: "Team not found" });

    if (req.user.role === "Organizer" && team.event.organizer.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, error: "Not your event" });

    team.approvalStatus = "Rejected";
    team.rejectReason   = reason;
    await team.save();

    await Notification.create({
      user:    team.student._id,
      message: `Your team "${team.name}" registration for "${team.event.name}" was rejected. Reason: ${reason}`,
      type:    "error",
    });

    res.json({ success: true, message: "Team rejected", data: team });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  DELETE /api/teams/:id
// @access Organizer | Admin
router.delete("/:id", protect, authorize("Organizer", "Admin"), async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Team removed" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
