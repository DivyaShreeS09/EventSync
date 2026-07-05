const express  = require("express");
const router   = express.Router();
const Event    = require("../models/Event");
const Team     = require("../models/Team");
const User     = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

// @route  GET /api/analytics
// @access Admin
router.get("/", protect, authorize("Admin"), async (req, res) => {
  try {
    const [
      totalEvents, approvedEvents, pendingEvents, rejectedEvents,
      totalTeams,  approvedTeams,  pendingTeams,  totalUsers,
    ] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ approvalStatus: "Approved" }),
      Event.countDocuments({ approvalStatus: "Pending"  }),
      Event.countDocuments({ approvalStatus: "Rejected" }),
      Team.countDocuments(),
      Team.countDocuments({ approvalStatus: "Approved" }),
      Team.countDocuments({ approvalStatus: "Pending"  }),
      User.countDocuments(),
    ]);

    // Category breakdown
    const catStats = await Team.aggregate([
      { $lookup: { from: "events", localField: "event", foreignField: "_id", as: "eventData" } },
      { $unwind: "$eventData" },
      { $group: { _id: "$eventData.category", teamCount: { $sum: 1 }, approvedCount: { $sum: { $cond: [{ $eq: ["$approvalStatus", "Approved"] }, 1, 0] } } } },
    ]);

    const catEventCounts = await Event.aggregate([
      { $group: { _id: "$category", eventCount: { $sum: 1 } } },
    ]);

    const catMap = {};
    catEventCounts.forEach((c) => { catMap[c._id] = { eventCount: c.eventCount, teamCount: 0 }; });
    catStats.forEach((c) => { if (catMap[c._id]) catMap[c._id].teamCount = c.teamCount; });
    const categoryStats = Object.entries(catMap).map(([category, v]) => ({ category, ...v }));

    // College participation
    const collegeStats = await Team.aggregate([
      { $group: { _id: "$college", teamCount: { $sum: 1 } } },
      { $sort: { teamCount: -1 } },
      { $limit: 8 },
      { $project: { college: "$_id", teamCount: 1, _id: 0 } },
    ]);

    // Event capacity
    const approvedEventsList = await Event.find({ approvalStatus: "Approved" }).select("name maxTeams");
    const capacityStats = await Promise.all(
      approvedEventsList.map(async (ev) => {
        const count = await Team.countDocuments({ event: ev._id, approvalStatus: "Approved" });
        return { id: ev._id, name: ev.name, maxTeams: ev.maxTeams, approvedCount: count };
      })
    );

    // Monthly registrations (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyTeams = await Team.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalEvents, approvedEvents, pendingEvents, rejectedEvents,
        totalTeams,  approvedTeams,  pendingTeams,  totalUsers,
        categoryStats, collegeStats, capacityStats, monthlyTeams,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
