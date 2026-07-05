const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  registerNo: { type: String, trim: true, uppercase: true, default: "" },
  email:      { type: String, trim: true, lowercase: true, default: "" },
  college:    { type: String, trim: true, default: "" },
  program:    { type: String, trim: true, default: "" },
  isLeader:   { type: Boolean, default: false },
});

const TeamSchema = new mongoose.Schema(
  {
    name:           { type: String, required: [true, "Team name is required"], trim: true },
    college:        { type: String, required: [true, "College is required"], trim: true },
    leader:         { type: String, required: [true, "Leader name is required"] },
    members:        [MemberSchema],
    event:          { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    student:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approvalStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    rejectReason:   { type: String, default: "" },
    registeredOn:   { type: String, default: () => new Date().toISOString().split("T")[0] },
  },
  { timestamps: true }
);

// At most one non-rejected team per student per event — enforced at the DB level
// (not just app-level check-then-create) to close the race-condition window under
// concurrent requests. Re-registration after a Rejected team is still allowed.
TeamSchema.index(
  { event: 1, student: 1 },
  { unique: true, partialFilterExpression: { approvalStatus: { $ne: "Rejected" } } }
);

module.exports = mongoose.model("Team", TeamSchema);
