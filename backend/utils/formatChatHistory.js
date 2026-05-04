function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function extractDescription(raw = "") {
  const match = raw.match(/User Description:\s*(.*?)(?:\n|$)/i);
  return match ? match[1].trim() : raw;
}

function formatChatHistory(
  messages = [],
  user = {},
  subject = "",
  description = "",
) {
  const cleanDesc = extractDescription(description);

  // ─── Plain text conversation like Stripe chat transcript ───────────────────
  const formattedMessages = messages
    .map((msg) => {
      const isUser = msg.role === "user";
      const senderName = isUser ? user.name || "User" : "Bot";
      const time = msg.timestamp ? `(${formatTime(msg.timestamp)}) ` : "";
      return `${time}<b>${senderName}</b>: ${msg.content || ""}`;
    })
    .join("<br/>");

  return `
  <div style="font-family:Arial, sans-serif; background:#f2f2f2; padding:30px;">
    <div style="max-width:620px; margin:0 auto;">

      <!-- HEADER -->
      <div style="
        background:#1fa855;
        color:white;
        padding:14px 16px;
        border-radius:8px 8px 0 0;
        font-size:16px;
        font-weight:bold;
      ">
        ZoikoTime Support Request
      </div>

      <!-- BODY -->
      <div style="
        background:white;
        padding:18px;
        border:1px solid #ddd;
        border-top:none;
        border-radius:0 0 8px 8px;
      ">

        <p><b>User:</b> ${user.name || "N/A"}</p>
        <p><b>Email:</b> ${user.email || "N/A"}</p>

        <hr style="margin:12px 0;" />

        <p>🔴<b>Issue:</b></p>
        <p>${subject || "N/A"}</p>

        <p><b>Description:</b></p>
        <p>${cleanDesc || "N/A"}</p>

        <hr style="margin:12px 0;" />

        <p><b>Chat Conversation:</b></p>

        <!-- PLAIN TEXT CHAT TRANSCRIPT -->
        <div style="
          background:#f9f9f9;
          padding:12px 16px;
          border:1px solid #e0e0e0;
          border-radius:6px;
          margin-top:8px;
          font-size:13px;
          line-height:2;
          color:#333;
        ">
          ${formattedMessages || "<span style='color:#666;'>No messages</span>"}
        </div>

      </div>
    </div>
  </div>
  `;
}

module.exports = { formatChatHistory };
