const mongoose = require("mongoose");

const managerSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    employeeEmail: { type: String, required: true },
    managerEmail: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Manager || mongoose.model("Manager", managerSchema);
