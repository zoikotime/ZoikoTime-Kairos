import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useStore } from "../store/useStore";
import {
  createChatSession,
  endChatSession,
  fetchHistory,
  fetchUserSessions,
  sendMessage as sendChatMessage,
} from "../services/api";

import ChatHeader from "../components/layout/ChatHeader";
import MessageBubble from "../components/chat/MessageBubble";
import TypingDots from "../components/chat/TypingDots";
import Composer from "../components/chat/Composer";
import MailResponse from "../components/chat/MailResponse";

const WELCOME_TEXT =
  "Hi there! I'm Kioris, your ZoikoTime assistant.\n\nI'm here to help with clock-in/out, activity, leave, pay, privacy, and anything else about ZoikoTime.\n\nWhat can I help you with today?";

function createWelcomeMessage(text = WELCOME_TEXT) {
  return {
    id: `welcome-${Date.now()}`,
    role: "assistant",
    content: text,
    suggestions: [],
    citations: [],
    timestamp: new Date().toISOString(),
  };
}

function normalizeMessage(message, index = 0) {
  return {
    id: message.id || message._id || `${message.role || "assistant"}-${index}`,
    role: message.role || "assistant",
    content: message.content ?? message.text ?? "",
    suggestions:
      message.suggestions ||
      message.quickReplies ||
      message.meta?.suggestions ||
      message.metadata?.suggestions ||
      [],
    citations: message.citations || [],
    timestamp: message.timestamp || new Date().toISOString(),
    nextAction: message.nextAction || null,
  };
}

export default function ChatPage() {
  const user = useStore((state) => state.user);
  const sessionId = useStore((state) => state.sessionId);
  const setSessionId = useStore((state) => state.setSessionId);
  const messages = useStore((state) => state.messages);
  const replaceMessages = useStore((state) => state.replaceMessages);
  const sessions = useStore((state) => state.sessions);
  const setSessions = useStore((state) => state.setSessions);
  const lang = useStore((state) => state.language);
  const setLang = useStore((state) => state.setLanguage);
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [openPanel, setOpenPanel] = useState(null);

  const bottomRef = useRef(null);
  const isDark = theme === "dark";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!sessionId) return;

    fetchHistory(sessionId)
      .then((response) => {
        const historyMessages = (response.messages || []).map(normalizeMessage);
        replaceMessages(
          historyMessages.length ? historyMessages : [createWelcomeMessage()],
        );
      })
      .catch(() => {});
  }, [replaceMessages, sessionId]);

  useEffect(() => {
    if (!user?.email) return;

    fetchUserSessions(user.email)
      .then((response) => setSessions(response.sessions || []))
      .catch(() => {});
  }, [setSessions, user?.email, sessionId]);

  const sendMessage = useCallback(
    async (overrideText) => {
      const text = (overrideText ?? input).trim();
      if (!text || isTyping || !sessionId) return;

      const nextMessages = [
        ...messages,
        normalizeMessage({
          id: `${Date.now()}-user`,
          role: "user",
          content: text,
        }),
      ];

      replaceMessages(nextMessages);
      setInput("");
      setIsTyping(true);

      try {
        const response = await sendChatMessage({
          sessionId,
          message: text,
          user,
          language: lang,
        });

        replaceMessages([
          ...nextMessages,
          normalizeMessage({
            id: `${Date.now()}-assistant`,
            role: "assistant",
            content:
              response.message?.answer ||
              "I'm here to help. Could you clarify what you need?",
            suggestions: response.message?.suggestions || [],
            nextAction: response.message?.nextAction || null,
          }),
        ]);
      } catch {
        toast.error("Couldn't reach Kioris. Check your connection.");
        replaceMessages([
          ...nextMessages,
          normalizeMessage({
            id: `${Date.now()}-error`,
            role: "assistant",
            content:
              "I couldn't connect to the server right now.\n\nPlease try again, or contact support:\nEmail: sales@zoikotime.com\nPhone: 1-800-484-5574",
            suggestions: ["Try again", "Speak to a human agent"],
          }),
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [input, isTyping, lang, messages, replaceMessages, sessionId, user],
  );

  const refreshSessions = useCallback(async () => {
    if (!user?.email) return;
    const response = await fetchUserSessions(user.email);
    setSessions(response.sessions || []);
  }, [setSessions, user?.email]);

  const handleMailClick = useCallback(() => {
    console.log("MAIL CLICKED");
    replaceMessages([
      ...messages,
      {
        id: `mail-${Date.now()}`,
        role: "assistant",
        content: <MailResponse />,
      },
    ]);
  }, [messages, replaceMessages]);

  const handleNewChat = useCallback(async () => {
    if (!user?.email) return;

    try {
      if (sessionId) {
        await endChatSession(sessionId, user.email).catch(() => {});
      }

      const response = await createChatSession(user);
      const nextSessionId = response.session?.sessionId;
      if (!nextSessionId) {
        throw new Error("Missing session");
      }

      await setSessionId(nextSessionId, response.session.expiresAt || null);
      replaceMessages([
        createWelcomeMessage(
          "Starting a new conversation. What can I help you with?",
        ),
      ]);
      setInput("");
      setOpenPanel(null);
      await refreshSessions();
    } catch {
      toast.error("Couldn't start a new conversation right now.");
    }
  }, [refreshSessions, replaceMessages, sessionId, setSessionId, user]);

  const handleSelectSession = useCallback(
    async (session) => {
      if (!session?.sessionId) return;

      try {
        const response = await fetchHistory(session.sessionId);
        const historyMessages = (response.messages || []).map(normalizeMessage);
        await setSessionId(session.sessionId, session.expiresAt || null);
        replaceMessages(
          historyMessages.length ? historyMessages : [createWelcomeMessage()],
        );
        setInput("");
        setOpenPanel(null);
      } catch {
        toast.error("Couldn't load that session.");
      }
    },
    [replaceMessages, setSessionId],
  );

  const clearChat = useCallback(() => {
    replaceMessages([
      createWelcomeMessage("Chat cleared. What can I help you with?"),
    ]);
  }, [replaceMessages]);

  return (
    <>
      <style>{`
        @keyframes msgIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes panelIn { from { opacity: 0; transform: translateY(-8px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes livePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(87, 210, 117, 0.55); }
          50% { box-shadow: 0 0 0 5px rgba(87, 210, 117, 0); }
        }
        .live-dot { animation: livePulse 2.2s ease infinite; }
      `}</style>

      <div
        className={`min-h-screen flex items-center justify-center p-3 sm:p-5 transition-colors duration-300 ${
          isDark ? "" : "bg-[#f3fff5]"
        }`}
        style={
          isDark
            ? {
                background:
                  "radial-gradient(circle at top, rgba(76,214,120,0.18), transparent 28%), linear-gradient(180deg, #010403 0%, #07100a 46%, #0b1710 100%)",
              }
            : {
                background:
                  "radial-gradient(circle at top, rgba(76,214,120,0.16), transparent 35%), linear-gradient(180deg, #f4fff7 0%, #ffffff 50%, #eefcf0 100%)",
              }
        }
      >
        <div
          className={`relative flex w-full max-w-2xl flex-col overflow-hidden rounded-[26px] border shadow-2xl transition-colors duration-300 ${
            isDark
              ? "border-[rgba(76,214,120,0.2)] bg-[rgba(2,7,4,0.96)] shadow-[0_48px_120px_rgba(0,0,0,0.62)]"
              : "border-[rgba(76,214,120,0.24)] bg-white shadow-[0_32px_80px_rgba(76,214,120,0.12)]"
          }`}
          style={{ minHeight: "min(88vh,780px)", maxHeight: "min(92vh,820px)" }}
        >
          <ChatHeader
            theme={theme}
            onToggleTheme={toggleTheme}
            lang={lang}
            onLangChange={setLang}
            openPanel={openPanel}
            
            onTogglePanel={(panel) =>
              setOpenPanel((prev) => (prev === panel ? null : panel))
            }
            onClosePanel={() => setOpenPanel(null)}
            sessions={sessions}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            onMailClick={handleMailClick}
          />

          <div
            className="flex-1 overflow-y-auto px-4 py-5 sm:px-5"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(80,214,123,0.13) transparent",
            }}
          >
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                msg={message}
                onSuggestion={sendMessage}
                theme={theme}
              />
            ))}

            {isTyping ? (
              <div
                className="mb-4 flex items-start gap-2.5"
                style={{ animation: "msgIn 0.2s ease both" }}
              >
                <div className="orbit-avatar-shell mt-0.5 h-8 w-8 rounded-[13px]">
                  <div className="orbit-avatar flex h-7 w-7 items-center justify-center rounded-[10px]">
                    <span className="orbit-avatar-z text-[0.72rem] font-black text-[#1d4e61]">
                      K
                    </span>
                  </div>
                </div>
                <div
                  className={`rounded-2xl rounded-tl-sm border px-4 py-3 ${
                    isDark
                      ? "border-[rgba(80,214,123,0.12)] bg-[rgba(8,26,12,0.9)]"
                      : "border-[rgba(80,214,123,0.2)] bg-white shadow-sm"
                  }`}
                >
                  <TypingDots />
                </div>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>

          <Composer
            input={input}
            setInput={setInput}
            isTyping={isTyping}
            onSend={sendMessage}
            onClear={clearChat}
            theme={theme}
          />
        </div>
      </div>
    </>
  );
}
