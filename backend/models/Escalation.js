const mongoose = require("mongoose");

const escalationSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    employeeEmail: { type: String, required: true },
    managerEmail: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: "pending" },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Escalation || mongoose.model("Escalation", escalationSchema);
