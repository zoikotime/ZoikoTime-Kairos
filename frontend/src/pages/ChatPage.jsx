import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useStore } from "../store/useStore";
import {
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

  // 🔥 FIXED SEND MESSAGE
  const sendMessage = useCallback(
    async (overrideText) => {
      const text = (overrideText ?? input).trim();
      if (!text || isTyping) return;

      let currentSessionId = sessionId;

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
          sessionId: currentSessionId || null,
          message: text,
          user,
          language: lang,
        });

        // ✅ SET SESSION FROM BACKEND
        if (!currentSessionId && response.sessionId) {
          await setSessionId(response.sessionId);
          currentSessionId = response.sessionId;
        }

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
        toast.error("Couldn't reach Koiris. Check your connection.");

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
    [
      input,
      isTyping,
      lang,
      messages,
      replaceMessages,
      sessionId,
      user,
      setSessionId,
    ],
  );

  const refreshSessions = useCallback(async () => {
    if (!user?.email) return;
    const response = await fetchUserSessions(user.email);
    setSessions(response.sessions || []);
  }, [setSessions, user?.email]);

  const handleMailClick = useCallback(() => {
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
    if (sessionId) {
      await endChatSession(sessionId, user.email).catch(() => {});
    }

    await setSessionId(null);

    replaceMessages([
      createWelcomeMessage(
        "Starting a new conversation. What can I help you with?",
      ),
    ]);

    setInput("");
    setOpenPanel(null);
  }, [sessionId, user, replaceMessages, setSessionId]);

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
      {/* 🔥 YOUR ORIGINAL UI RESTORED */}
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl flex flex-col h-[90vh] border rounded-xl overflow-hidden">

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

          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                msg={message}
                onSuggestion={sendMessage}
                theme={theme}
              />
            ))}

            {isTyping && <TypingDots />}
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