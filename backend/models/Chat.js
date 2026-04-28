const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    metadata: { type: Object, default: {} },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
