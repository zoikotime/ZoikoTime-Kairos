import { useEffect, useState } from "react";
import { useStore } from "../../store/useStore";
import toast from "react-hot-toast";
import { fetchMailStatus, sendMail } from "../../services/api";

function formatWaitTime(ms) {
  const totalMinutes = Math.ceil(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

export default function MailResponse({ theme, onClose }) {
  const isDark = theme === "dark";
  const user = useStore((state) => state.user);
  const messages = useStore((state) => state.messages);
  const sessionId = useStore((state) => state.sessionId);

  // ─── Per-session mail tracking ────────────────────────────────────────────
  const storageKey = `mailSent_${sessionId}`;
  const [mailSent, setMailSentState] = useState(() =>
    sessionId ? localStorage.getItem(storageKey) === "true" : false,
  );
  const setMailSent = (value) => {
    if (sessionId) localStorage.setItem(storageKey, value ? "true" : "false");
    setMailSentState(value);
  };

  const [sending, setSending] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);
  const [limitState, setLimitState] = useState({
    blocked: false,
    remaining: null,
    waitText: "",
  });

  const fallbackIssue =
    messages
      .filter((m) => m.role === "user")
      .slice(-1)
      .map((m) => (typeof m.content === "string" ? m.content : ""))
      .join(" ") || "";

  const [subject, setSubject] = useState(fallbackIssue);
  const [body, setBody] = useState("");
  const toEmail = "support@zoikotime.com";

  useEffect(() => {
    let active = true;

    async function checkMailStatus() {
      if (!user?.email) {
        if (active) setStatusChecked(true);
        return;
      }

      try {
        const data = await fetchMailStatus(user.email);
        if (!active) return;

        const waitText = data?.msBeforeNextReset
          ? formatWaitTime(data.msBeforeNextReset)
          : "";

        setLimitState({
          blocked: data?.allowed === false,
          remaining: data?.remaining ?? null,
          waitText,
        });
      } catch (_err) {
        if (!active) return;
        setLimitState({
          blocked: false,
          remaining: null,
          waitText: "",
        });
      } finally {
        if (active) setStatusChecked(true);
      }
    }

    checkMailStatus();

    return () => {
      active = false;
    };
  }, [user?.email]);

  // ─── Guard: one mail per conversation ─────────────────────────────────────
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
          className={`font-semibold ${isDark ? "text-[#4ade80]" : "text-[#16a34a]"}`}
        >
          Mail Already Sent
        </div>
        <p
          className={`text-xs ${isDark ? "text-[#789483]" : "text-[#64748b]"}`}
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

  if (statusChecked && limitState.blocked) {
    return (
      <div
        className={`space-y-2 text-sm text-center p-4 rounded-xl border ${
          isDark
            ? "border-[rgba(80,214,123,0.2)] bg-[rgba(10,30,15,0.6)]"
            : "border-[rgba(34,197,94,0.3)] bg-[rgba(240,253,244,0.8)]"
        }`}
      >
        <div className="text-2xl">📭</div>
        <div
          className={`font-semibold ${isDark ? "text-[#fbbf24]" : "text-[#b45309]"}`}
        >
          Daily Mail Limit Reached
        </div>
        <p
          className={`text-xs ${isDark ? "text-[#789483]" : "text-[#64748b]"}`}
        >
          You have already used the daily support mail limit.
          {limitState.waitText ? ` Try again in ${limitState.waitText}.` : ""}
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

  // ─── Send handler ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!user?.email) {
      toast.error("User session missing. Please log in again.");
      return;
    }
    if (!sessionId) {
      toast.error(
        "Start the chat first, then send at least one message before mailing support.",
      );
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject before sending.");
      return;
    }
    if (limitState.blocked) {
      return;
    }

    setSending(true);

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
      const data = await sendMail({
        sessionId,
        user: {
          name: user?.name,
          email: user?.email,
          company: user?.company,
        },
        to: toEmail,
        subject,
        body: finalBody,
        html: htmlTemplate,
      });

      if (data?.code === "EMAIL_LIMIT_REACHED") {
        const waitTime = formatWaitTime(data.msBeforeNextReset || 86400 * 1000);
        toast.error(`Daily mail limit reached. Try again in ${waitTime}.`, {
          duration: 6000,
        });
        if (onClose) onClose();
        return;
      }

      if (data?.success) {
        setMailSent(true);
        toast.success("Mail sent! Our team will get back to you shortly.", {
          duration: 4000,
        });
        if (onClose) onClose();
      } else {
        toast.error(data?.message || "Failed to send. Please try again.");
      }
    } catch (err) {
      console.error("[MailResponse] Send error:", err);

      const waitTime = err?.response?.data?.msBeforeNextReset;
      if (err?.response?.status === 429) {
        setLimitState({
          blocked: true,
          remaining: 0,
          waitText: formatWaitTime(waitTime || 86400 * 1000),
        });
        return;
      }

      toast.error(
        err?.response?.data?.message ||
          "Something went wrong. Please check your connection and try again.",
      );
    } finally {
      setSending(false);
    }
  };

  // ─── Styles ────────────────────────────────────────────────────────────────
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

  // ─── Mail form ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <div
          className={`font-semibold ${isDark ? "text-[#d4f0dc]" : "text-[#0f3d20]"}`}
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

      <input value={user?.name || ""} disabled className={disabledInputClass} />

      <input
        value={user?.email || ""}
        disabled
        className={disabledInputClass}
        placeholder="from"
      />

      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Issue"
        className={inputClass}
        required
      />

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Describe your issue..."
        className={`${inputClass} h-20 resize-none`}
      />

      <button
        onClick={handleSend}
        disabled={sending || !statusChecked}
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
