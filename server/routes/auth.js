const express   = require("express");
const router    = express.Router();
const crypto    = require("crypto");
const rateLimit = require("express-rate-limit");
const User      = require("../models/User");
const { protect } = require("../middleware/auth");
const sendEmail  = require("../utils/sendEmail");
const { resetPasswordTemplate } = require("../utils/emailTemplates");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// Throttle forgot-password requests to blunt email/account enumeration and abuse
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many password reset requests. Please try again later." },
});

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

// Helper: send token response
const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id:     user._id,
      name:    user.name,
      email:   user.email,
      role:    user.role,
      college: user.college,
      program: user.program,
      registerNo: user.registerNo,
    },
  });
};

// @route  POST /api/auth/register
// @access Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, college, program, registerNo } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, error: "Name, email and password are required" });

    // Prevent self-registration as Admin
    const safeRole = role === "Admin" ? "Student" : role || "Student";

    // Students must provide registerNo, college and program — required for OD verification
    if (safeRole === "Student" && (!registerNo?.trim() || !college?.trim() || !program?.trim()))
      return res.status(400).json({ success: false, error: "Register number, college and program are required for student accounts" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ success: false, error: "Email already registered" });

    if (safeRole === "Student") {
      const regNoTaken = await User.findOne({ registerNo: registerNo.trim().toUpperCase() });
      if (regNoTaken)
        return res.status(409).json({ success: false, error: "An account with this register number already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: safeRole,
      college,
      program: program || "",
      registerNo: registerNo || undefined,
    });
    sendToken(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  POST /api/auth/login
// @access Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: "Email and password required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(401).json({ success: false, error: "Invalid credentials" });

    const match = await user.matchPassword(password);
    if (!match)
      return res.status(401).json({ success: false, error: "Invalid credentials" });

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  GET /api/auth/me
// @access Private
router.get("/me", protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

// @route  PUT /api/auth/profile
// @access Private
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, email, college, program } = req.body;
    if (!name?.trim() || !email?.trim())
      return res.status(400).json({ success: false, error: "Name and email are required" });

    if (email.trim().toLowerCase() !== req.user.email) {
      const taken = await User.findOne({ email: email.trim().toLowerCase() });
      if (taken)
        return res.status(409).json({ success: false, error: "Email already in use by another account" });
    }

    // Only name/email/college/program are editable here — role, password, registerNo,
    // approvalStatus and registrations are intentionally never touched by this route.
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, college, program },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route  POST /api/auth/forgot-password
// @access Public
router.post("/forgot-password", forgotPasswordLimiter, async (req, res) => {
  // Always return the same generic response — never reveal whether the email exists.
  const genericResponse = { success: true, message: "If that email is registered, a password reset link has been sent." };
  try {
    const { email } = req.body;
    if (!email?.trim()) return res.json(genericResponse);

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.json(genericResponse);

    const rawToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${CLIENT_URL}/reset-password/${rawToken}`;
    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your EventSync password",
        html: resetPasswordTemplate({ name: user.name, resetUrl }),
      });
    } catch (emailErr) {
      // Roll back the token so a failed send doesn't leave a live, un-deliverable token
      user.resetPasswordToken  = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      console.error("Failed to send password reset email:", emailErr.message);
    }

    return res.json(genericResponse);
  } catch (err) {
    console.error("forgot-password error:", err.message);
    return res.json(genericResponse);
  }
});

// @route  POST /api/auth/reset-password/:token
// @access Public
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    if (!password || !confirmPassword)
      return res.status(400).json({ success: false, error: "Password and confirmation are required" });
    if (password !== confirmPassword)
      return res.status(400).json({ success: false, error: "Passwords do not match" });
    if (!PASSWORD_RULE.test(password))
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters and include both letters and numbers" });

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpire");

    if (!user)
      return res.status(400).json({ success: false, error: "Invalid or expired reset link. Please request a new one." });

    user.password = password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful. You can now sign in with your new password." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
