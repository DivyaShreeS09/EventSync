const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const crypto   = require("crypto");

const UserSchema = new mongoose.Schema(
  {
    name:    { type: String, required: [true, "Name is required"], trim: true },
    email:   { type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true },
    password:{ type: String, required: [true, "Password is required"], minlength: 6, select: false },
    role:    { type: String, enum: ["Student", "Organizer", "Admin"], default: "Student" },
    college: { type: String, trim: true, default: "" },
    program: { type: String, trim: true, default: "" },
    registerNo: { type: String, trim: true, uppercase: true, sparse: true, unique: true },
    resetPasswordToken:  { type: String, select: false },
    resetPasswordExpire: { type: Date,   select: false },
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Match password
UserSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

// Generate JWT
UserSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Generate a password-reset token. Returns the raw token (sent to the user via
// email); only its SHA-256 hash is persisted, so the DB never holds a usable secret.
UserSchema.methods.getResetPasswordToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken  = crypto.createHash("sha256").update(rawToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  return rawToken;
};

module.exports = mongoose.model("User", UserSchema);
