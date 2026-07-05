// ── notifications.js ──────────────────────────────────────────────────────────
const express      = require("express");
const router       = express.Router();
const Notification = require("../models/Notification");
const { protect }  = require("../middleware/auth");

router.get("/", protect, async (req, res) => {
  try {
    const notifs = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: notifs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
