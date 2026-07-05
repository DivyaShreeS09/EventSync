const express = require("express");
const router  = express.Router();
const User    = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

// @route  GET /api/users  — Admin only
router.get("/", protect, authorize("Admin"), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  DELETE /api/users/:id  — Admin only
router.delete("/:id", protect, authorize("Admin"), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, error: "Cannot delete yourself" });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
