const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userEmail: { type: String, required: true, index: true },
    userName: { type: String, default: "" },
    company: { type: String, default: "" },
    employeeId: { type: String, default: "" },
    title: { type: String, default: "New conversation" },
    preview: { type: String, default: "" },
    messageCount: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "ended"], default: "active" },
    startedAt: { type: Date, default: Date.now },
    lastMessageAt: { type: Date, default: Date.now, index: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);
