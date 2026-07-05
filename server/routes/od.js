const express          = require("express");
const router           = express.Router();
const User             = require("../models/User");
const Team             = require("../models/Team");
const SoloRegistration = require("../models/SoloRegistration");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const eventPopulate = {
  path: "event",
  select: "name category date venue image poster organizer",
  populate: { path: "organizer", select: "name email" },
};

const absoluteUrl = (req, p) => (p ? `${req.protocol}://${req.get("host")}${p}` : "");

// @route  GET /api/od/registrations/:registerNo
// @desc   Return verified, approved solo + team event registrations for a student,
//         for OD verification by the external SIST Django OD system.
// @access Public
router.get("/registrations/:registerNo", async (req, res) => {
  try {
    const registerNo = req.params.registerNo.trim().toUpperCase();
    if (!registerNo)
      return res.status(400).json({ success: false, error: "Register number is required" });

    // Existing User account, if any — used to enrich the response, not required to exist
    // (a team member may be a real student without ever having created a platform account... actually
    // team members are now always real accounts, but solo/team records store their own snapshot regardless).
    const student = await User.findOne({ registerNo, role: "Student" });

    const soloRegs = await SoloRegistration.find({ registerNo, approvalStatus: "Approved" })
      .populate(eventPopulate)
      .sort({ createdAt: -1 });

    const teamRegs = await Team.find({ "members.registerNo": registerNo, approvalStatus: "Approved" })
      .populate(eventPopulate)
      .sort({ createdAt: -1 });

    if (!student && soloRegs.length === 0 && teamRegs.length === 0)
      return res.status(404).json({ success: false, error: "No records found for given register number" });

    const soloData = soloRegs
      .filter((r) => r.event)
      .map((r) => ({
        verified:              true,
        registrationType:      "SOLO",
        eventId:               r.event._id,
        eventName:             r.event.name,
        category:              r.event.category,
        date:                  r.event.date,
        venue:                 r.event.venue,
        organizer:             r.event.organizer?.name || "",
        posterUrl:             absoluteUrl(req, r.event.poster),
        eventUrl:              `${CLIENT_URL}/events?event=${r.event._id}`,
        registrationDetailUrl: `${CLIENT_URL}/registrations/solo/${r._id}`,
        registeredAt:          r.createdAt,
        approvalStatus:        r.approvalStatus,
        student: {
          registerNo: r.registerNo,
          name:       r.name,
          email:      r.email,
          program:    r.program || "",
          college:    r.college || "",
        },
      }));

    const teamData = teamRegs
      .filter((t) => t.event)
      .map((t) => {
        const member = t.members.find((m) => m.registerNo === registerNo);
        return {
          verified:              true,
          registrationType:      "TEAM",
          eventId:               t.event._id,
          eventName:             t.event.name,
          category:              t.event.category,
          date:                  t.event.date,
          venue:                 t.event.venue,
          organizer:             t.event.organizer?.name || "",
          posterUrl:             absoluteUrl(req, t.event.poster),
          eventUrl:              `${CLIENT_URL}/events?event=${t.event._id}`,
          registrationDetailUrl: `${CLIENT_URL}/registrations/team/${t._id}`,
          registeredAt:          t.createdAt,
          approvalStatus:        t.approvalStatus,
          teamName:              t.name,
          student: member ? {
            registerNo: member.registerNo,
            name:       member.name,
            email:      member.email,
            program:    member.program || "",
            college:    member.college || "",
          } : null,
          members: t.members.map((m) => ({
            registerNo: m.registerNo,
            name:       m.name,
            email:      m.email,
            program:    m.program || "",
            college:    m.college || "",
          })),
        };
      });

    const data = [...soloData, ...teamData];

    res.json({
      success:     true,
      registerNo,
      studentName: student?.name || data[0]?.student?.name || "",
      count:       data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
