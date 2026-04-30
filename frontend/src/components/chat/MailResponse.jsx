import { useState } from "react";
import { useStore } from "../../store/useStore";
import toast from "react-hot-toast";

export default function MailResponse() {
  const user = useStore((state) => state.user);
  const messages = useStore((state) => state.messages);
  const appendMessage = useStore((state) => state.appendMessage);

  const [emailSent, setEmailSent] = useState(false);
  const [sending, setSending] = useState(false); // ✅ NEW

  const fallbackIssue =
    messages
      .filter((m) => m.role === "user")
      .slice(-2)
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

    setSending(true); // ✅ start loader

    const chatHistory = messages
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
${chatHistory}
`;

    try {
      const res = await fetch("http://localhost:5000/api/mail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: user.email,
          to: toEmail,
          subject,
          body: finalBody,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Mail sent with chat history ✅");
        setEmailSent(true);
      } else {
        toast.error("Failed to send, try again...");
      }
    } catch (err) {
      toast.error("Something went wrong, try again...");
    } finally {
      setSending(false); // ✅ stop loader always
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-2 text-sm text-center p-4 rounded-xl border border-green-300">
        <div className="text-2xl">✅</div>
        <div className="font-semibold text-green-600">
          Mail Sent Successfully!
        </div>
        <p className="text-green-600 text-xs">
          Our team will get back to you shortly.
        </p>
        <p className="text-gray-500 text-xs">
          Have more questions? Feel free to ask below!
        </p>
        <button
          onClick={() => setEmailSent(false)}
          className="mt-2 text-xs text-blue-500 underline"
        >
          Send another mail
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-sm">
      <div className="font-semibold">📩 Send Support Mail</div>

      {/* Name */}
      <input
        value={user?.name || ""}
        disabled
        className="w-full border p-2 rounded"
      />

      {/* From */}
      <input
        value={user?.email || ""}
        disabled
        className="w-full border p-2 rounded"
        placeholder="from"
      />

      {/* To */}
      <input
        value={toEmail}
        className="w-full border p-2 rounded"
        placeholder="to"
        disabled
        hidden
      />

      {/* Subject */}
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Issue"
        className="w-full border p-2 rounded"
        required
      />

      {/* Body */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Describe issue..."
        className="w-full border p-2 rounded h-20"
      />

      {/* ✅ Send Button with Loader */}
      <button
        onClick={handleSend}
        disabled={sending}
        className={`flex items-center gap-2 px-3 py-1 rounded text-white text-sm font-medium transition-all ${
          sending
            ? "bg-green-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
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
