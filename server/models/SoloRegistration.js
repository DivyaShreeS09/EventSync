const mongoose = require("mongoose");

const SoloRegistrationSchema = new mongoose.Schema(
  {
    registerNo:     { type: String, required: [true, "Register number is required"], trim: true, uppercase: true },
    name:           { type: String, required: [true, "Name is required"], trim: true },
    email:          { type: String, required: [true, "Email is required"], trim: true, lowercase: true },
    college:        { type: String, trim: true, default: "" },
    program:        { type: String, trim: true, default: "" },
    event:          { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    student:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approvalStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    rejectReason:   { type: String, default: "" },
    registeredOn:   { type: String, default: () => new Date().toISOString().split("T")[0] },
  },
  { timestamps: true }
);

// Prevent the same register number from registering twice for the same event
SoloRegistrationSchema.index({ event: 1, registerNo: 1 }, { unique: true });

module.exports = mongoose.model("SoloRegistration", SoloRegistrationSchema);
