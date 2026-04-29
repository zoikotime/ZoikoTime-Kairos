import { useState } from "react";
import { useStore } from "../store/useStore";

export default function MailResponse() {
  const user = useStore((state) => state.user);
  const messages = useStore((state) => state.messages);

  // 👇 Get last 2 messages as fallback issue
  const fallbackIssue =
    messages
      .slice(-2)
      .map((m) => m.content)
      .join(" ") || "";

  const [subject, setSubject] = useState(fallbackIssue);
  const [body, setBody] = useState("");

  const handleSend = async () => {
    if (!user?.email) {
      alert("User session missing");
      return;
    }

    const res = await fetch("http://localhost:5000/api/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: user.email,
        to: "support@zoiko.com", // can change later
        subject,
        body,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Mail sent ✅");
    } else {
      alert("Failed ❌");
    }
  };

  return (
    <div className="flex w-full justify-start">
      <div className="max-w-[85%] rounded-2xl border p-4 bg-white shadow-sm space-y-3">
        <p className="text-sm font-semibold">📩 Send Support Mail</p>

        {/* NAME */}
        <input
          value={user?.name || ""}
          disabled
          className="w-full border rounded p-2 text-sm"
        />

        {/* EMAIL */}
        <input
          value={user?.email || ""}
          disabled
          className="w-full border rounded p-2 text-sm"
        />

        {/* SUBJECT (ISSUE) */}
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Issue"
          className="w-full border rounded p-2 text-sm"
        />

        {/* BODY */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Describe your issue..."
          className="w-full border rounded p-2 text-sm h-24"
        />

        <button
          onClick={handleSend}
          className="bg-green-500 text-white px-4 py-2 rounded text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}
