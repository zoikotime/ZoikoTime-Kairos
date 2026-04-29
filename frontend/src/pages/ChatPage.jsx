import { useEffect, useRef, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useStore } from "../store/useStore";
import { fetchHistory, fetchUserSessions } from "../services/api";
import api from "../services/api";

// ─── Icons ────────────────────────────────────────────────────────────────────
import {
  HiOutlineClock,
  HiOutlineGlobeAlt,
  HiOutlineSwatch,
  HiOutlinePaperAirplane,
  HiOutlinePencilSquare,
  HiOutlineXMark,
  HiOutlineCheck,
  HiOutlineTrash,
} from "react-icons/hi2";

// ─── Send message via real backend ────────────────────────────────────────────
async function sendToChatbot({ message, sessionId, userState = "employee", surface = "app" }) {
  const { data } = await api.post("/chatbot", {
    message,
    sessionId,
    userState,
    surface,
    locale: "en",
  });
  return data; // { answer, quickReplies, nextAction, citations, intent, sessionId }
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{ animationDelay: `${i * 0.18}s` }}
          className="h-1.5 w-1.5 rounded-full bg-[#33e3cd] opacity-80 animate-bounce"
        />
      ))}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, onSuggestion }) {
  const isUser = msg.role === "user";

  return (
    <div
      className={`flex w-full gap-2.5 ${isUser ? "justify-end" : "justify-start"} mb-4`}
      style={{ animation: "msgIn 0.22s ease both" }}
    >
      {/* Bot avatar */}
      {!isUser && (
        <div className="flex-shrink-0 mt-0.5">
          <div className="orbit-avatar-shell h-8 w-8 rounded-[13px]">
            <div className="orbit-avatar h-7 w-7 rounded-[10px] flex items-center justify-center">
              <span className="orbit-avatar-z text-[0.72rem] font-black text-[#1d4e61]">K</span>
            </div>
          </div>
        </div>
      )}

      <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"} max-w-[78%]`}>
        {/* Bubble */}
        <div
          className={
            isUser
              ? "rounded-2xl rounded-tr-sm bg-gradient-to-br from-[#1ac7bf] to-[#57d995] px-4 py-2.5 text-[#042820] font-semibold text-sm shadow-lg"
              : "rounded-2xl rounded-tl-sm border border-[rgba(51,227,205,0.11)] bg-[rgba(7,26,38,0.85)] px-4 py-3 text-[#cde8f0] text-sm leading-relaxed shadow-md"
          }
        >
          {msg.typing ? <TypingDots /> : <span className="whitespace-pre-wrap">{msg.text}</span>}
        </div>

        {/* Citations */}
        {!isUser && !msg.typing && msg.citations?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {msg.citations.map((c, i) => (
              <span
                key={i}
                className="rounded-full border border-[rgba(51,227,205,0.13)] bg-[rgba(10,35,48,0.5)] px-2 py-0.5 text-[0.6rem] text-[#4a8a94] font-medium"
              >
                {c.title}
              </span>
            ))}
          </div>
        )}

        {/* Quick reply chips */}
        {!isUser && !msg.typing && msg.suggestions?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSuggestion(s)}
                className="rounded-full border border-[rgba(51,227,205,0.2)] bg-[rgba(10,35,48,0.65)] px-3 py-1 text-[0.71rem] text-[#6dddd0] font-medium transition-all hover:border-[#33e3cd] hover:bg-[rgba(18,52,62,0.9)] hover:text-[#33e3cd] active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 mt-0.5">
          <div className="h-8 w-8 rounded-[13px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.07)] flex items-center justify-center text-[0.68rem] font-bold text-[#8bc8d5]">
            U
          </div>
        </div>
      )}
    </div>
  );
}

// ─── History panel ────────────────────────────────────────────────────────────
function HistoryPanel({ sessions, onClose, onSelect }) {
  return (
    <div
      className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-[rgba(51,227,205,0.14)] bg-[rgba(4,16,24,0.98)] shadow-2xl overflow-hidden"
      style={{ animation: "panelIn 0.17s ease both" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.05)]">
        <span className="text-[0.65rem] font-black uppercase tracking-widest text-[#55d9c2]">
          Chat History
        </span>
        <button onClick={onClose} className="orbit-icon-button h-7 w-7 rounded-[10px]">
          <HiOutlineXMark className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="max-h-72 overflow-y-auto p-2">
        {sessions?.length > 0 ? (
          sessions.map((s, i) => (
            <button
              key={i}
              onClick={() => { onSelect?.(s); onClose(); }}
              className="w-full text-left rounded-xl px-3 py-2.5 text-sm text-[#a8cfd9] hover:bg-[rgba(51,227,205,0.06)] hover:text-[#cde8f0] transition-all mb-0.5"
            >
              <div className="font-semibold truncate">{s.title || `Session ${i + 1}`}</div>
              <div className="text-[0.68rem] text-[#3e6372] mt-0.5">{s.date || s.createdAt || "—"}</div>
            </button>
          ))
        ) : (
          <div className="py-10 text-center text-[#3e6372] text-xs">No history yet</div>
        )}
      </div>
    </div>
  );
}

// ─── Theme picker ─────────────────────────────────────────────────────────────
const THEMES = [
  { id: "ocean",    label: "Deep Ocean",   dot: "#19c7be" },
  { id: "midnight", label: "Midnight",     dot: "#7c6ef7" },
  { id: "forest",   label: "Forest Noir",  dot: "#57d995" },
];

function ThemePanel({ current, onChange, onClose }) {
  return (
    <div
      className="absolute right-0 top-12 z-50 w-60 rounded-2xl border border-[rgba(51,227,205,0.14)] bg-[rgba(4,16,24,0.98)] shadow-2xl overflow-hidden"
      style={{ animation: "panelIn 0.17s ease both" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.05)]">
        <span className="text-[0.65rem] font-black uppercase tracking-widest text-[#55d9c2]">Theme</span>
        <button onClick={onClose} className="orbit-icon-button h-7 w-7 rounded-[10px]">
          <HiOutlineXMark className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="p-2">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => { onChange(t.id); onClose(); }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-[rgba(51,227,205,0.06)]"
          >
            <span
              className="h-4 w-4 rounded-full flex-shrink-0"
              style={{ background: t.dot, boxShadow: `0 0 8px ${t.dot}55` }}
            />
            <span className="text-sm text-[#a8cfd9]">{t.label}</span>
            {current === t.id && <HiOutlineCheck className="ml-auto h-3.5 w-3.5 text-[#33e3cd]" />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Language picker ──────────────────────────────────────────────────────────
const LANGS = [
  { code: "en", label: "English",  flag: "🇺🇸" },
  { code: "es", label: "Español",  flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch",  flag: "🇩🇪" },
  { code: "hi", label: "हिन्दी",    flag: "🇮🇳" },
];

function LangPanel({ current, onChange, onClose }) {
  return (
    <div
      className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-[rgba(51,227,205,0.14)] bg-[rgba(4,16,24,0.98)] shadow-2xl overflow-hidden"
      style={{ animation: "panelIn 0.17s ease both" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.05)]">
        <span className="text-[0.65rem] font-black uppercase tracking-widest text-[#55d9c2]">Language</span>
        <button onClick={onClose} className="orbit-icon-button h-7 w-7 rounded-[10px]">
          <HiOutlineXMark className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="p-2">
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => { onChange(l.code); onClose(); }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#a8cfd9] transition-all hover:bg-[rgba(51,227,205,0.06)] hover:text-[#cde8f0]"
          >
            <span className="text-base leading-none">{l.flag}</span>
            <span>{l.label}</span>
            {current === l.code && <HiOutlineCheck className="ml-auto h-3.5 w-3.5 text-[#33e3cd]" />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Edit modal ───────────────────────────────────────────────────────────────
function EditModal({ lastUserMsg, onSubmit, onClose }) {
  const [val, setVal] = useState(lastUserMsg || "");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(2,7,12,0.78)] backdrop-blur-sm"
      style={{ animation: "fadeIn 0.14s ease both" }}
    >
      <div
        className="w-full max-w-md mx-4 rounded-2xl border border-[rgba(51,227,205,0.16)] bg-[rgba(4,16,24,0.99)] p-5 shadow-2xl"
        style={{ animation: "scaleIn 0.17s ease both" }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-[0.65rem] font-black uppercase tracking-widest text-[#55d9c2]">
            Edit Message
          </span>
          <button onClick={onClose} className="orbit-icon-button h-8 w-8 rounded-[11px]">
            <HiOutlineXMark className="h-4 w-4" />
          </button>
        </div>
        <textarea
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Edit your message…"
          rows={4}
          className="w-full rounded-xl border border-[rgba(35,86,97,0.85)] bg-[rgba(8,26,38,0.9)] px-4 py-3 text-sm text-[#d8eef5] placeholder-[#3e6372] outline-none resize-none focus:border-[rgba(51,227,205,0.4)] transition-colors"
        />
        <div className="flex gap-2 mt-3 justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-[rgba(255,255,255,0.08)] px-4 py-2 text-xs text-[#567a85] hover:text-[#8ab2bc] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => { if (val.trim()) { onSubmit(val.trim()); onClose(); } }}
            className="rounded-xl bg-gradient-to-r from-[#19c7be] to-[#57d995] px-5 py-2 text-xs font-black text-[#042820] transition-all hover:opacity-90 active:scale-95"
          >
            Resend
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Welcome quick-start card ─────────────────────────────────────────────────
function WelcomeCard({ onSuggestion }) {
  const chips = [
    "Clock-in / Clock-out help",
    "What gets recorded about me?",
    "Leave & Time Off",
    "Payslips & Earnings",
    "Speak to a human agent",
  ];
  return (
    <div
      className="mx-auto mb-5 w-full max-w-sm rounded-2xl border border-[rgba(51,227,205,0.1)] bg-[rgba(7,24,35,0.7)] p-4"
      style={{ animation: "msgIn 0.3s ease both" }}
    >
      <p className="text-[0.62rem] font-black uppercase tracking-widest text-[#33e3cd] mb-3">
        Quick Start
      </p>
      <div className="flex flex-col gap-1.5">
        {chips.map((c, i) => (
          <button
            key={i}
            onClick={() => onSuggestion(c)}
            className="w-full text-left rounded-xl border border-[rgba(51,227,205,0.11)] bg-[rgba(10,35,48,0.5)] px-3 py-2 text-xs text-[#6ec8d5] hover:border-[rgba(51,227,205,0.28)] hover:bg-[rgba(16,48,60,0.8)] hover:text-[#33e3cd] transition-all"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main ChatPage ─────────────────────────────────────────────────────────────
export default function ChatPage() {
  const user        = useStore((s) => s.user);
  const sessionId   = useStore((s) => s.sessionId);
  const storeReplac = useStore((s) => s.replaceMessages);
  const setSessions = useStore((s) => s.setSessions);
  const sessions    = useStore((s) => s.sessions);

  const userState = user?.role || "employee";

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi there! 👋 I'm Kioris, your ZoikoTime assistant.\n\nI'm here to help you with clock-in/out, activity, leave, pay, privacy and anything else about ZoikoTime.\n\nWhat can I help you with today?",
      suggestions: [
        "1️⃣ Clock-in / Clock-out help",
        "2️⃣ Activity, Screenshots & Reports",
        "3️⃣ Leave & Time Off",
        "4️⃣ Pay, Payslips & Earnings",
        "5️⃣ Privacy & What's Recorded",
        "6️⃣ Zoiko Connect (Messaging)",
        "7️⃣ Settings & Account",
        "8️⃣ App not working",
        "9️⃣ Speak to a human agent",
      ],
      citations: [],
    },
  ]);

  const [input,     setInput]     = useState("");
  const [isTyping,  setIsTyping]  = useState(false);
  const [openPanel, setOpenPanel] = useState(null); // 'history'|'theme'|'lang'|null
  const [theme,     setTheme]     = useState("ocean");
  const [lang,      setLang]      = useState("en");
  const [showEdit,  setShowEdit]  = useState(false);

  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);
  const panelRef    = useRef(null);

  // ── Scroll to bottom ───────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Close panel on outside click ───────────────────────────────────────────
  useEffect(() => {
    if (!openPanel) return;
    function handler(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpenPanel(null);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openPanel]);

  // ── Load session history from backend ─────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return;
    fetchHistory(sessionId)
      .then((r) => { if (r.messages?.length) storeReplac(r.messages); })
      .catch(() => {});
  }, [storeReplac, sessionId]);

  useEffect(() => {
    if (!user?.email) return;
    fetchUserSessions(user.email)
      .then((r) => setSessions(r.sessions || []))
      .catch(() => {});
  }, [setSessions, user?.email, sessionId]);

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (overrideText) => {
      const text = (overrideText ?? input).trim();
      if (!text || isTyping) return;

      // Add user bubble immediately
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "user", text, suggestions: [], citations: [] },
      ]);
      setInput("");
      setIsTyping(true);
      if (textareaRef.current) textareaRef.current.style.height = "auto";

      try {
        const reply = await sendToChatbot({ message: text, sessionId, userState, surface: "app" });

        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "_r",
            role: "assistant",
            text: reply.answer || "I'm here to help — could you clarify what you need?",
            suggestions: reply.quickReplies || [],
            citations: reply.citations || [],
            nextAction: reply.nextAction || null,
          },
        ]);
      } catch {
        setIsTyping(false);
        toast.error("Couldn't reach Kioris — check your connection.");
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "_err",
            role: "assistant",
            text: "I couldn't connect to the server right now.\n\nPlease try again, or contact support:\n📧 sales@zoikotime.com\n📞 1-800-484-5574",
            suggestions: ["Try again", "Speak to a human agent"],
            citations: [],
          },
        ]);
      }
    },
    [input, isTyping, sessionId, userState],
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const togglePanel = (name) => setOpenPanel((p) => (p === name ? null : name));

  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.text || "";

  const clearChat = () => {
    setMessages([{
      id: "welcome-" + Date.now(),
      role: "assistant",
      text: "Hi there! 👋 Chat cleared. What can I help you with?",
      suggestions: [
        "Clock-in / Clock-out help",
        "Leave & Time Off",
        "Privacy & What's Recorded",
        "Speak to a human agent",
      ],
      citations: [],
    }]);
  };

  const showWelcomeCard = messages.length === 1 && messages[0].id.startsWith("welcome");

  return (
    <>
      {/* ── Keyframes ──────────────────────────────────────────────────── */}
      <style>{`
        @keyframes msgIn {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes panelIn {
          from { opacity:0; transform:translateY(-8px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes fadeIn  { from{opacity:0}  to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
        @keyframes livePulse {
          0%,100% { box-shadow:0 0 0 0 rgba(87,210,117,0.55); }
          50%     { box-shadow:0 0 0 5px rgba(87,210,117,0); }
        }
        .live-dot { animation: livePulse 2.2s ease infinite; }
      `}</style>

      {/* ── Page background ─────────────────────────────────────────────── */}
      <div
        className="min-h-screen flex items-center justify-center p-3 sm:p-5"
        style={{
          background:
            "radial-gradient(circle at top, rgba(17,85,91,0.26), transparent 28%), linear-gradient(180deg,#04111a 0%,#051722 46%,#071b28 100%)",
        }}
      >
        {/* ── Chat card ─────────────────────────────────────────────────── */}
        <div
          className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-[26px] border border-[rgba(22,82,95,0.5)] bg-[rgba(4,13,21,0.94)] shadow-[0_48px_120px_rgba(0,0,0,0.62)]"
          style={{ minHeight: "min(88vh,780px)", maxHeight: "min(92vh,820px)" }}
        >

          {/* ── Header ────────────────────────────────────────────────── */}
          <header className="relative flex flex-shrink-0 items-center gap-3 border-b border-[rgba(255,255,255,0.05)] px-5 py-3.5 bg-[rgba(4,13,21,0.7)]">

            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="orbit-avatar-shell h-9 w-9 rounded-[14px]">
                <div className="orbit-avatar h-8 w-8 rounded-[11px] flex items-center justify-center">
                  <span className="orbit-avatar-z text-[0.74rem] font-black text-[#1d4e61]">K</span>
                  <span className="orbit-avatar-node" />
                </div>
              </div>
            </div>

            {/* Brand */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-[0.96rem] text-[#c8e6ee] tracking-tight">Kioris</span>
                <span className="rounded-full border border-[rgba(51,227,205,0.2)] bg-[rgba(51,227,205,0.07)] px-2 py-0.5 text-[0.56rem] font-black uppercase tracking-widest text-[#33e3cd]">
                  AI
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-[#57d275] flex-shrink-0" />
                <span className="text-[0.63rem] text-[#38606e]">ZoikoTime Assistant · Online</span>
              </div>
            </div>

            {/* Header buttons + dropdown panels */}
            <div className="relative flex items-center gap-1.5" ref={panelRef}>

              <button
                onClick={() => togglePanel("history")}
                title="Chat History"
                className={`orbit-icon-button h-9 w-9 rounded-[12px] transition-all ${
                  openPanel === "history" ? "border-[rgba(51,227,205,0.4)] bg-[rgba(16,48,60,0.95)] text-[#33e3cd]" : ""
                }`}
              >
                <HiOutlineClock className="h-[17px] w-[17px]" />
              </button>

              <button
                onClick={() => togglePanel("theme")}
                title="Change Theme"
                className={`orbit-icon-button h-9 w-9 rounded-[12px] transition-all ${
                  openPanel === "theme" ? "border-[rgba(51,227,205,0.4)] bg-[rgba(16,48,60,0.95)] text-[#33e3cd]" : ""
                }`}
              >
                <HiOutlineSwatch className="h-[17px] w-[17px]" />
              </button>

              <button
                onClick={() => togglePanel("lang")}
                title="Change Language"
                className={`orbit-icon-button h-9 w-9 rounded-[12px] transition-all ${
                  openPanel === "lang" ? "border-[rgba(51,227,205,0.4)] bg-[rgba(16,48,60,0.95)] text-[#33e3cd]" : ""
                }`}
              >
                <HiOutlineGlobeAlt className="h-[17px] w-[17px]" />
              </button>

              {openPanel === "history" && (
                <HistoryPanel sessions={sessions} onClose={() => setOpenPanel(null)} onSelect={() => {}} />
              )}
              {openPanel === "theme" && (
                <ThemePanel current={theme} onChange={setTheme} onClose={() => setOpenPanel(null)} />
              )}
              {openPanel === "lang" && (
                <LangPanel current={lang} onChange={setLang} onClose={() => setOpenPanel(null)} />
              )}
            </div>
          </header>

          {/* ── Messages ──────────────────────────────────────────────── */}
          <div
            className="flex-1 overflow-y-auto px-4 py-5 sm:px-5"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(51,227,205,0.13) transparent" }}
          >
            {showWelcomeCard && <WelcomeCard onSuggestion={sendMessage} />}

            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} onSuggestion={sendMessage} />
            ))}

            {isTyping && (
              <div className="flex items-start gap-2.5 mb-4" style={{ animation: "msgIn 0.2s ease both" }}>
                <div className="flex-shrink-0 orbit-avatar-shell h-8 w-8 rounded-[13px] mt-0.5">
                  <div className="orbit-avatar h-7 w-7 rounded-[10px] flex items-center justify-center">
                    <span className="orbit-avatar-z text-[0.72rem] font-black text-[#1d4e61]">K</span>
                  </div>
                </div>
                <div className="rounded-2xl rounded-tl-sm border border-[rgba(51,227,205,0.11)] bg-[rgba(7,26,38,0.85)] px-4 py-3">
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Composer ──────────────────────────────────────────────── */}
          <div className="flex-shrink-0 border-t border-[rgba(255,255,255,0.05)] px-4 py-3.5 sm:px-5 sm:py-4">
            <div className="orbit-composer flex items-end gap-2.5 rounded-[18px] border border-[rgba(28,76,90,0.8)] bg-[rgba(5,20,30,0.92)] px-4 py-3 focus-within:border-[rgba(51,227,205,0.3)] transition-colors duration-200">

              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 130) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask Kioris anything about ZoikoTime…"
                rows={1}
                disabled={isTyping}
                className="flex-1 resize-none bg-transparent text-sm text-[#cde8f0] placeholder-[#2e5464] outline-none leading-relaxed disabled:opacity-50"
                style={{ maxHeight: "130px", minHeight: "22px" }}
              />

              {/* Edit */}
              <button
                onClick={() => setShowEdit(true)}
                title="Edit last message"
                disabled={!lastUserMsg}
                className="orbit-icon-button h-8 w-8 flex-shrink-0 rounded-[11px] mb-0.5 disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <HiOutlinePencilSquare className="h-4 w-4" />
              </button>

              {/* Clear */}
              <button
                onClick={clearChat}
                title="Clear chat"
                className="orbit-icon-button h-8 w-8 flex-shrink-0 rounded-[11px] mb-0.5"
              >
                <HiOutlineTrash className="h-4 w-4" />
              </button>

              {/* Send */}
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                title="Send"
                className="orbit-send-button flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[11px] mb-0.5 transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <HiOutlinePaperAirplane className="h-4 w-4 text-[#042820]" />
              </button>
            </div>

            <p className="mt-2 text-center text-[0.58rem] text-[#1e3e4c] select-none tracking-wide">
              Kioris · ZoikoTime AI · Source-grounded · Governed responses
            </p>
          </div>
        </div>
      </div>

      {/* ── Edit modal ─────────────────────────────────────────────────── */}
      {showEdit && (
        <EditModal
          lastUserMsg={lastUserMsg}
          onSubmit={(edited) => sendMessage(edited)}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}