import { useState, useEffect } from "react";
import { useStore } from "../../store/useStore";
import { sendMail } from "../../services/api";
import toast from "react-hot-toast";

export default function MailResponse({ theme, onClose }) {
  const isDark = theme === "dark";
  const user = useStore((state) => state.user);
  const messages = useStore((state) => state.messages);
  const mailSent = useStore((state) => state.mailSent);
  const setMailSent = useStore((state) => state.setMailSent);

  const [sending, setSending] = useState(false);

  // Pre-fill subject from the last user message
  const fallbackIssue =
    messages
      .filter((m) => m.role === "user")
      .slice(-1)
      .map((m) => (typeof m.content === "string" ? m.content : ""))
      .join(" ") || "";

  const [subject, setSubject] = useState(fallbackIssue);
  const [body, setBody] = useState("");

  // ─── Fire toast immediately when user opens mail after already sending ──────
  useEffect(() => {
    if (mailSent) {
      toast("Only 1 mail is allowed per conversation. To send another, please start a new conversation.", {
        icon: "📬",
        duration: 5000,
        style: { fontSize: "13px", maxWidth: "340px" },
      });
    }
  }, [mailSent]);

  // ─── Guard: mail already sent this conversation ───────────────────────────
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
        <p className={`text-xs ${isDark ? "text-[#789483]" : "text-[#64748b]"}`}>
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

  // ─── Send handler ─────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!user?.email) {
      toast.error("User session missing. Please restart the app.");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject before sending.");
      return;
    }

    setSending(true);

    try {
      const sessionId = useStore.getState().sessionId;

      // Backend builds the HTML from sessionId — we only send metadata + description
      await sendMail({
        sessionId,
        user: {
          name: user.name,
          email: user.email,
          company: user.company,
        },
        to: "support@zoikotime.com",
        subject,
        body,
      });

      // Lock this conversation — store survives remount
      setMailSent(true);
      toast.success("Mail sent! Our team will get back to you shortly.", {
        duration: 4000,
      });

    } catch (err) {
      // ─── Rate limit: 5 mails per 24hr per user email ──────────────────────
      // Backend 429: { success: false, message: "Daily email limit reached (5/day). Try again in X hour(s)." }
      if (err?.response?.status === 429) {
        const raw = err.response?.data?.message || "";
        // Extract hours from backend message e.g. "Try again in 3 hour(s)."
        const hoursMatch = raw.match(/(\d+)\s*hour/i);
        const hours = hoursMatch ? parseInt(hoursMatch[1]) : null;
        const resetMsg = hours
          ? `Your daily support mail limit of 5 has been reached. You can send another mail in ${hours} hour${hours > 1 ? "s" : ""}. Please try again later.`
          : "Your daily support mail limit of 5 has been reached. Please try again after 24 hours.";
        toast.error(resetMsg, {
          duration: 7000,
          icon: "🚫",
          style: { fontSize: "13px", maxWidth: "360px" },
        });
        return;
      }

      // ─── Any other server / network error ────────────────────────────────
      const fallbackMsg =
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(fallbackMsg);

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
            title="Close mail form"
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
      <input
        value={user?.name || ""}
        disabled
        className={disabledInputClass}
        placeholder="Name"
      />

      {/* From email (read-only) */}
      <input
        value={user?.email || ""}
        disabled
        className={disabledInputClass}
        placeholder="Your email"
      />

      {/* Subject */}
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Issue summary"
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