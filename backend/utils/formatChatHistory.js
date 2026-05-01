function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatChatHistory(messages, user, subject, description) { // 👈 added subject & description

  const formattedMessages = messages
    .map((msg) => {
      const isUser = msg.role === "user";
      return `
        <div style="display:flex; margin:10px 0; ${isUser ? "justify-content:flex-end;" : "justify-content:flex-start;"}">
          <div style="
            max-width:75%;
            padding:10px 14px;
            border-radius:14px;
            font-size:14px;
            line-height:1.5;
            background:${isUser ? "#DCF8C6" : "#FFFFFF"};
            border:1px solid ${isUser ? "#cdebb0" : "#e5e5e5"};
            box-shadow:0 1px 2px rgba(0,0,0,0.05);
          ">
            <div style="font-size:12px; font-weight:bold; margin-bottom:4px; color:${isUser ? "#075E54" : "#333"};">
              ${isUser ? user.name || "User" : "Koiris (Bot)"}
            </div>
            <div style="white-space:pre-wrap;">${msg.content}</div>
            <div style="text-align:right; font-size:10px; color:#888; margin-top:6px;">
              ${formatTime(msg.timestamp)}
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div style="font-family:Arial, sans-serif; background:#f4f6f8; padding:20px;">

      <!-- USER + ISSUE INFO -->
      <div style="background:white; border-radius:12px; padding:16px; margin-bottom:16px; border:1px solid #e5e5e5;">
        <h2 style="margin:0 0 10px; font-size:16px;">📩 Support Request</h2>

        <p style="margin:4px 0;"><b>Name:</b> ${user.name}</p>
        <p style="margin:4px 0;"><b>Email:</b> ${user.email}</p>
        <p style="margin:4px 0;"><b>Company:</b> ${user.company || "N/A"}</p>

        <hr style="margin:12px 0; border:none; border-top:1px solid #e5e5e5;"/>

        <!-- ✅ ISSUE & DESCRIPTION NOW VISIBLE -->
        <p style="margin:4px 0;"><b>🔴 Issue:</b> ${subject || "N/A"}</p>
        <p style="margin:4px 0;"><b>📝 Description:</b> ${description || "N/A"}</p>
      </div>

      <!-- CHAT HISTORY -->
      <div style="background:#e5ddd5; padding:12px; border-radius:12px;">
        ${formattedMessages}
      </div>

      <p style="text-align:center; margin-top:16px; font-size:11px; color:#888;">
        This is an automated message from ZoikoTime Chatbot
      </p>
    </div>
  `;
}

module.exports = { formatChatHistory };