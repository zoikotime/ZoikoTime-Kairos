function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function extractDescription(raw = "") {
  const match = raw.match(/User Description:\s*(.*?)(?:\n|$)/i);
  return match ? match[1].trim() : raw;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cleanTranscriptMessage(message = "", role = "assistant") {
  const text = String(message || "").replace(/\s+/g, " ").trim();
  if (role !== "assistant") return text;

  return text
    .replace(/•\s*\d+️⃣[\s\S]*$/u, "")
    .replace(/Just type a number or describe what you need!?[\s\S]*$/i, "")
    .trim();
}

function formatChatHistory(
  messages = [],
  user = {},
  subject = "",
  description = "",
  translation = {},
) {
  const cleanDesc = extractDescription(description);
  const translatedSubject = translation.translatedSubject || subject || "N/A";
  const translatedDescription =
    translation.translatedDescription || cleanDesc || "N/A";
  const originalLanguage = translation.originalLanguage || "Unknown";
  const wasTranslated = Boolean(translation.wasTranslated);

  const formattedMessages = messages
    .map((msg) => {
      const isUser = msg.role === "user";
      const senderName = isUser ? user.name || "User" : "Bot";
      const time = msg.timestamp ? formatTime(msg.timestamp) : "--:--";
      const messageText = escapeHtml(
        cleanTranscriptMessage(
          msg.translatedContent || msg.content || "",
          msg.role,
        ),
      );
      const color = isUser ? "#1d4ed8" : "#166534";
      return `<div style="color:${color};">${escapeHtml(time)} ${escapeHtml(senderName)}: ${messageText}</div>`;
    })
    .join("");

  return `
  <div style="font-family:Arial, sans-serif; padding:16px; color:#111;">
    <p><b>User:</b> ${escapeHtml(user.name || "N/A")}</p>
    <p><b>Email:</b> ${escapeHtml(user.email || "N/A")}</p>
    <p><b>Original Language:</b> ${escapeHtml(originalLanguage)}</p>
    <p><b>Translated To:</b> English</p>
    <p><b>Issue In English:</b> ${escapeHtml(translatedSubject)}</p>
    ${
      wasTranslated
        ? `<p><b>Original Issue:</b> ${escapeHtml(subject || "N/A")}</p>`
        : ""
    }
    <p><b>Description In English:</b> ${escapeHtml(translatedDescription)}</p>
    ${
      wasTranslated
        ? `<p><b>Original Description:</b> ${escapeHtml(cleanDesc || "N/A")}</p>`
        : ""
    }
    <p><b>Chat Conversation:</b></p>
    <div>
      ${formattedMessages || "<div>No messages</div>"}
    </div>
  </div>
  `;
}

module.exports = { formatChatHistory };
