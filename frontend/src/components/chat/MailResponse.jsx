import { useState } from "react";
import { useStore } from "../../store/useStore";
import toast from "react-hot-toast";

// ✅ FIXED: accepts onClose prop to allow dismissing the mail form
export default function MailResponse({ theme, onClose }) {
  const isDark = theme === "dark";
  const user = useStore((state) => state.user);
  const messages = useStore((state) => state.messages);
  const appendMessage = useStore((state) => state.appendMessage);

  const [emailSent, setEmailSent] = useState(false);
  const [sending, setSending] = useState(false); // ✅ NEW

  const fallbackIssue =
    messages
      .filter((m) => m.role === "user")
      .slice(-1) // ✅ only last 1 user message
      .map((m) => (typeof m.content === "string" ? m.content : ""))
      .join(" ") || "";

  const [subject, setSubject] = useState(fallbackIssue);
  const [body, setBody] = useState("");
  const [toEmail, setToEmail] = useState("support@zoikotime.com");

  const handleSend = async () => {
    if (!user?.email) {
      alert("User session missing");
      return;
    }

    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }

    setSending(true);

    // 🔥 TEXT VERSION (unchanged fallback)
    const chatHistoryText = messages
      .slice(-10)
      .map((m) => {
        if (typeof m.content !== "string") return null;
        const role = m.role === "user" ? "User" : "Bot";
        return `${role}: ${m.content}`;
      })
      .filter(Boolean)
      .join("\n\n");

    const finalBody = `
User Name: ${user?.name}
User Email: ${user?.email}

----------------------

Issue:
${subject}

----------------------

User Description:
${body}

----------------------

Chat History:
${chatHistoryText}
`;

    // 🔥 PREMIUM HTML FORMAT (NEW)
    const chatHistoryHtml = messages
      .slice(-10)
      .map((m) => {
        if (typeof m.content !== "string") return "";

        const isUser = m.role === "user";

        return `
        <div style="
          display:flex;
          justify-content:${isUser ? "flex-end" : "flex-start"};
          margin:6px 0;
        ">
          <div style="
            max-width:70%;
            padding:10px 14px;
            border-radius:16px;
            font-size:13px;
            line-height:1.4;
            background:${isUser ? "#DCF8C6" : "#F1F0F0"};
            color:#000;
          ">
            ${m.content}
          </div>
        </div>
      `;
      })
      .join("");

    const htmlTemplate = `
  <div style="font-family: Arial; background:#f5f5f5; padding:20px;">
    
    <div style="
      max-width:600px;
      margin:auto;
      background:#ffffff;
      border-radius:10px;
      overflow:hidden;
      box-shadow:0 4px 12px rgba(0,0,0,0.1);
    ">

      <div style="background:#16a34a; color:#fff; padding:14px; font-weight:bold;">
        ZoikoTime Support Request
      </div>

      <div style="padding:15px;">
        <p><b>User:</b> ${user?.name}</p>
        <p><b>Email:</b> ${user?.email}</p>

        <hr/>

        <p><b>Issue:</b></p>
        <p>${subject}</p>

        <p><b>Description:</b></p>
        <p>${body || "N/A"}</p>

        <hr/>

        <p><b>Chat Conversation:</b></p>

        <div style="
          background:#e5ddd5;
          padding:12px;
          border-radius:10px;
        ">
          ${chatHistoryHtml}
        </div>

      </div>
    </div>
  </div>
  `;

    try {
      const res = await fetch("http://localhost:5000/api/mail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: useStore.getState().sessionId, // ✅ add this (safe access)

          user: {
            name: user?.name,
            email: user?.email,
            company: user?.company,
          },

          from: user.email,
          to: toEmail,
          subject,

          body: finalBody, // existing fallback text
          html: htmlTemplate, // existing HTML template
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Mail sent with chat history ✅");
        setEmailSent(true);
      } else {
        toast.error(data.message || "Failed to send");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong, try again...");
    } finally {
      setSending(false);
    }
  };

  if (emailSent) {
    return (
      <div
        className={`space-y-2 text-sm text-center p-4 rounded-xl border ${
          isDark
            ? "border-[rgba(80,214,123,0.2)] bg-[rgba(10,30,15,0.6)]"
            : "border-[rgba(34,197,94,0.3)] bg-[rgba(240,253,244,0.8)]"
        }`}
      >
        <div className="text-2xl">✅</div>
        <div
          className={`font-semibold ${
            isDark ? "text-[#4ade80]" : "text-[#16a34a]"
          }`}
        >
          Mail Sent Successfully!
        </div>
        <p
          className={`text-xs ${isDark ? "text-[#4ade80]" : "text-[#16a34a]"}`}
        >
          Our team will get back to you shortly.
        </p>
        <p
          className={`text-xs ${isDark ? "text-[#789483]" : "text-[#64748b]"}`}
        >
          Have more questions? Feel free to ask below!
        </p>
        <button
          onClick={() => setEmailSent(false)}
          className={`mt-2 text-xs underline transition-colors ${
            isDark
              ? "text-[#38bdf8] hover:text-[#7dd3fc]"
              : "text-[#2563eb] hover:text-[#1d4ed8]"
          }`}
        >
          Send another mail
        </button>
        {/* ✅ Close button on success screen too */}
        {onClose && (
          <button
            onClick={onClose}
            className={`mt-1 text-xs underline transition-colors ${
              isDark
                ? "text-[#789483] hover:text-[#a0b8a8]"
                : "text-[#64748b] hover:text-[#334155]"
            }`}
          >
            Back to chat
          </button>
        )}
      </div>
    );
  }

  const inputClass = `w-full border rounded p-2 text-sm outline-none transition-all ${
    isDark
      ? "border-[rgba(80,214,123,0.18)] bg-[rgba(7,20,10,0.7)] text-[#cde8d4] placeholder-[#4a6b52] focus:border-[rgba(80,214,123,0.45)]"
      : "border-[rgba(31,154,70,0.25)] bg-white text-[#0f3d20] placeholder-[#94a3b8] focus:border-[rgba(31,154,70,0.5)]"
  }`;

  const disabledInputClass = `w-full border rounded p-2 text-sm cursor-not-allowed ${
    isDark
      ? "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[#4a6b52]"
      : "border-[rgba(31,154,70,0.15)] bg-[rgba(31,154,70,0.04)] text-[#6b8f74]"
  }`;

  return (
    <div className="space-y-2 text-sm">

      {/* ✅ Header row with title and close button */}
      <div className="flex items-center justify-between">
        <div
          className={`font-semibold ${
            isDark ? "text-[#d4f0dc]" : "text-[#0f3d20]"
          }`}
        >
          📩 Send Support Mail
        </div>

        {/* ✅ Close / cancel button — dismisses mail form and returns to chat */}
        {onClose && (
          <button
            onClick={onClose}
            title="Close mail"
            className={`text-xs px-2 py-0.5 rounded transition-colors ${
              isDark
                ? "text-[#789483] hover:text-[#cde8d4] hover:bg-[rgba(255,255,255,0.05)]"
                : "text-[#64748b] hover:text-[#0f3d20] hover:bg-[rgba(31,154,70,0.08)]"
            }`}
          >
            ✕ Cancel
          </button>
        )}
      </div>

      {/* Name */}
      <input value={user?.name || ""} disabled className={disabledInputClass} />

      {/* From */}
      <input
        value={user?.email || ""}
        disabled
        className={disabledInputClass}
        placeholder="from"
      />

      {/* To */}
      <input
        value={toEmail}
        className={disabledInputClass}
        placeholder="to"
        disabled
        hidden
      />

      {/* Subject */}
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Issue"
        className={inputClass}
        required
      />

      {/* Body */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Describe issue..."
        className={`${inputClass} h-20 resize-none`}
      />

      {/* ✅ Send Button with Loader */}
      <button
        onClick={handleSend}
        disabled={sending}
        className={`flex items-center gap-2 px-3 py-1.5 rounded text-white text-sm font-medium transition-all ${
          sending
            ? "bg-[#4ade80] cursor-not-allowed"
            : isDark
              ? "bg-[#16a34a] hover:bg-[#15803d]"
              : "bg-[#22c55e] hover:bg-[#16a34a]"
        }`}
      >
        {sending ? (
          <>
            {/* ✅ Spinner */}
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Sending...
          </>
        ) : (
          "Send"
        )}
      </button>
    </div>
  );
}