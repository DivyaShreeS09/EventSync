const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    name:           { type: String, required: [true, "Event name is required"], trim: true },
    category:       { type: String, enum: ["Technical", "Cultural", "Sports"], required: true },
    date:           { type: String, required: [true, "Date is required"] },
    venue:          { type: String, required: [true, "Venue is required"], trim: true },
    maxTeams:       { type: Number, default: 20 },
    description:    { type: String, default: "", trim: true },
    image:          { type: String, default: "⚡" },
    regStatus:      { type: String, enum: ["Open", "Closed"], default: "Open" },
    approvalStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    rejectReason:   { type: String, default: "" },
    organizer:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    poster:               { type: String, default: "" },
    registrationType:     { type: String, enum: ["SOLO", "TEAM", "BOTH"], default: "TEAM" },
    requiresApproval:     { type: Boolean, default: true },
    registrationDeadline: { type: Date, default: null },
    visibility:           { type: String, enum: ["PUBLIC", "DEPARTMENT", "YEAR", "PRIVATE"], default: "PUBLIC" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: approved team count
EventSchema.virtual("teamCount", {
  ref:         "Team",
  localField:  "_id",
  foreignField:"event",
  count:       true,
  match:       { approvalStatus: "Approved" },
});

// Virtual: pending team count
EventSchema.virtual("pendingCount", {
  ref:         "Team",
  localField:  "_id",
  foreignField:"event",
  count:       true,
  match:       { approvalStatus: "Pending" },
});

module.exports = mongoose.model("Event", EventSchema);
