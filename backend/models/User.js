const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    company: { type: String, required: true, trim: true },
    employeeId: { type: String, required: true, trim: true },
    sessionId: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
