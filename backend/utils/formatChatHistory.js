function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function extractDescription(raw = "") {
  const match = raw.match(/User Description:\s*(.*?)(?:\n|$)/i);
  return match ? match[1].trim() : raw;
}

function formatChatHistory(messages = [], user = {}, subject = "", description = "") {

  const cleanDesc = extractDescription(description);

  const formattedMessages = messages
    .map((msg) => {
      const isUser = msg.role === "user";

      return `
        <div style="
          display:flex;
          margin:4px 6px;
          ${isUser ? "justify-content:flex-end;" : "justify-content:flex-start;"}
        ">
          <div style="
            display:inline-block;
            max-width:62%;
            padding:8px 12px;
            border-radius:${isUser ? "14px 14px 3px 14px" : "14px 14px 14px 3px"};
            font-size:13px;
            line-height:1.5;
            word-break:break-word;
            background:${isUser ? "#d4f8c4" : "#ffffff"};
            border:1px solid ${isUser ? "#c3e6aa" : "#e0e0e0"};
          ">

            <div style="
              font-size:10.5px;
              font-weight:bold;
              margin-bottom:3px;
              color:${isUser ? "#075E54" : "#444"};
              text-align:${isUser ? "right" : "left"};
            ">
              ${isUser ? user.name || "User" : "Bot"}
            </div>

            <div style="white-space:pre-wrap; word-break:break-word;">
              ${msg.content || ""}
            </div>

            ${
              msg.timestamp
                ? `<div style="
                    text-align:right;
                    font-size:10px;
                    color:#aaa;
                    margin-top:4px;
                  ">
                    ${formatTime(msg.timestamp)}
                  </div>`
                : ""
            }

          </div>
        </div>
      `;
    })
    .join("");

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

        <p><b>Issue:</b></p>
        <p>${subject || "N/A"}</p>

        <p><b>Description:</b></p>
        <p>${cleanDesc || "N/A"}</p>

        <hr style="margin:12px 0;" />

        <p><b>Chat Conversation:</b></p>

        <!-- CHAT -->
        <div style="
          background:#e5ddd5;
          padding:10px 6px;
          border-radius:10px;
          margin-top:8px;
        ">
          ${formattedMessages || "<p style='padding:0 10px;color:#666;'>No messages</p>"}
        </div>

      </div>
    </div>

  </div>
  `;
}

module.exports = { formatChatHistory };