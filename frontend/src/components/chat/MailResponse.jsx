import { useState } from "react";
import { useStore } from "../../store/useStore";
import toast from "react-hot-toast";

// One mail per conversation — emailSent is read from the Zustand store
// so it survives component unmount/remount within the same session.
// Call useStore.getState().setMailSent(true) after a successful send.
// Add to your store:
//   mailSent: false,
//   setMailSent: (v) => set({ mailSent: v }),

export default function MailResponse({ theme, onClose }) {
  const isDark = theme === "dark";
  const user = useStore((state) => state.user);
  const messages = useStore((state) => state.messages);
  const mailSent = useStore((state) => state.mailSent);         // ← from store
  const setMailSent = useStore((state) => state.setMailSent);   // ← from store

  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false); // only shown after guard passes

  const fallbackIssue =
    messages
      .filter((m) => m.role === "user")
      .slice(-1)
      .map((m) => (typeof m.content === "string" ? m.content : ""))
      .join(" ") || "";

  const [subject, setSubject] = useState(fallbackIssue);
  const [body, setBody] = useState("");
  const toEmail = "support@zoikotime.com";

  // ─── Guard: if mail already sent this conversation ────────────────────────
  // This is called by whatever parent triggers the mail panel.
  // But we also handle it here if the component is mounted directly.
  if (mailSent) {
    return (
      <div
        className={`space-y-2 text-sm text-center p-4 rounded-xl border ${
          isDark
            ? "border-[rgba(80,214,123,0.2)] bg-[rgba(10,30,15,0.6)]"
            : "border-[rgba(34,197,94,0.3)] bg-[rgba(240,253,244,0.8)]"
        }`}
      >
        <div className="text-2xl">📬</div>
        <div
          className={`font-semibold ${
            isDark ? "text-[#4ade80]" : "text-[#16a34a]"
          }`}
        >
          Mail Already Sent
        </div>
        <p
          className={`text-xs ${
            isDark ? "text-[#789483]" : "text-[#64748b]"
          }`}
        >
          Only one support mail is allowed per conversation. Start a new
          conversation if you need further assistance.
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className={`mt-2 text-xs underline transition-colors ${
              isDark
                ? "text-[#38bdf8] hover:text-[#7dd3fc]"
                : "text-[#2563eb] hover:text-[#1d4ed8]"
            }`}
          >
            Back to chat
          </button>
        )}
      </div>
    );
  }

  // ─── Success screen (shown right after sending) ───────────────────────────
  // mailSent is now true in store, so re-opening this component shows the
  // guard above instead — preventing a 2nd send entirely.
  if (mailSent === false && showForm === false && !sending) {
    // first mount — show the form (fall through)
  }

  const handleSend = async () => {
    if (!user?.email) {
      toast.error("User session missing");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject before sending.");
      return;
    }

    setSending(true);

    // ─── Plain text body ────────────────────────────────────────────────────
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

    // ─── HTML email body ────────────────────────────────────────────────────
    const chatHistoryHtml = messages
      .slice(-10)
      .map((m) => {
        if (typeof m.content !== "string") return "";
        const isUser = m.role === "user";
        return `
          <div style="display:flex;justify-content:${isUser ? "flex-end" : "flex-start"};margin:6px 0;">
            <div style="max-width:70%;padding:10px 14px;border-radius:16px;font-size:13px;line-height:1.4;background:${isUser ? "#DCF8C6" : "#F1F0F0"};color:#000;">
              ${m.content}
            </div>
          </div>`;
      })
      .join("");

    const htmlTemplate = `
<div style="font-family:Arial;background:#f5f5f5;padding:20px;">
  <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
    <div style="background:#16a34a;color:#fff;padding:14px;font-weight:bold;">
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
      <div style="background:#e5ddd5;padding:12px;border-radius:10px;">
        ${chatHistoryHtml}
      </div>
    </div>
  </div>
</div>`;

    try {
      const res = await fetch("http://localhost:5000/api/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: useStore.getState().sessionId,
          user: {
            name: user?.name,
            email: user?.email,
            company: user?.company,
          },
          from: user.email,
          to: toEmail,
          subject,
          body: finalBody,
          html: htmlTemplate,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMailSent(true); // ← lock in store — survives remount
        toast.success("Mail sent! Our team will get back to you shortly.");
      } else {
        toast.error(data.message || "Failed to send. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // ─── Styles ───────────────────────────────────────────────────────────────
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

  // ─── Success screen (immediately after this session's send) ───────────────
  // Note: on next open, the store guard above handles it instead.
  if (mailSent) return null; // already handled above, but safety guard

  // ─── Mail form ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-2 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div
          className={`font-semibold ${
            isDark ? "text-[#d4f0dc]" : "text-[#0f3d20]"
          }`}
        >
          📩 Send Support Mail
        </div>
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

      {/* Name (read-only) */}
      <input value={user?.name || ""} disabled className={disabledInputClass} />

      {/* From email (read-only) */}
      <input
        value={user?.email || ""}
        disabled
        className={disabledInputClass}
        placeholder="from"
      />

      {/* Subject */}
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Issue"
        className={inputClass}
        required
      />

      {/* Description */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Describe your issue..."
        className={`${inputClass} h-20 resize-none`}
      />

      {/* Send button */}
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