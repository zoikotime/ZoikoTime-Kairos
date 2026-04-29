import { useState } from "react";
import { useStore } from "../../store/useStore";
import toast from "react-hot-toast";

export default function MailResponse() {
  const user = useStore((state) => state.user);
  const messages = useStore((state) => state.messages);

  // ✅ Only user prompts for issue
  const fallbackIssue =
    messages
      .filter((m) => m.role === "user")
      .slice(-2)
      .map((m) => (typeof m.content === "string" ? m.content : ""))
      .join(" ") || "";

  const [subject, setSubject] = useState(fallbackIssue);
  const [body, setBody] = useState("");
  const [toEmail, setToEmail] = useState("support@zoiko.com"); // ✅ editable "to"

  const handleSend = async () => {
    if (!user?.email) {
      alert("User session missing");
      return;
    }

    // ✅ Build chat history (last 10 messages, clean format)
    const chatHistory = messages
      .slice(-10)
      .map((m) => {
        if (typeof m.content !== "string") return null;
        const role = m.role === "user" ? "User" : "Bot";
        return `${role}: ${m.content}`;
      })
      .filter(Boolean)
      .join("\n\n");

    // ✅ Final structured email body
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

    const res = await fetch("http://localhost:5000/api/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: user.email,
        to: toEmail,
        subject,
        body: finalBody, // ✅ sending structured content
      }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("Mail sent with chat history ✅");
    } else {
      toast.error("Failed  to send try again...");
    }
  };

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

      {/* To (editable now) */}
      <input
        value={toEmail}
        onChange={(e) => setToEmail(e.target.value)}
        className="w-full border p-2 rounded"
        placeholder="to"
        required
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

      {/* Send */}
      <button
        onClick={handleSend}
        className="bg-green-500 text-white px-3 py-1 rounded"
      >
        Send
      </button>
    </div>
  );
}
