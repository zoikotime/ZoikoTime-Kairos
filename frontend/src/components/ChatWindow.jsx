import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScrollToBottom from "react-scroll-to-bottom";
import toast from "react-hot-toast";
import {
  FaArrowUp,
  FaBolt,
  FaClipboardList,
  FaMicrophoneLines,
  FaMoon,
  FaPencil,
  FaPlus,
  FaShieldHalved,
  FaSun,
  FaVolumeHigh,
  FaWandMagicSparkles,
} from "react-icons/fa6";
import MessageBubble from "./MessageBubble";
import Loader from "./Loader";
import HistoryDrawer from "./HistoryDrawer";
import {
  createChatSession,
  endChatSession,
  fetchChatContext,
  fetchUserSessions,
  sendMessage,
} from "../services/api";
import { useStore } from "../store/useStore";
import { languageOptions, uiText } from "../data/translations";

const quickTiles = [
  { label: "Attendance", prompt: "Clock-in and Clock-out help", icon: "⏱" },
  { label: "Screenshots", prompt: "Screenshots and privacy", icon: "📸" },
  { label: "Leave", prompt: "Leave and requests", icon: "🗓" },
  { label: "Payslips", prompt: "Payslips and earnings estimate", icon: "💳" },
  { label: "Privacy", prompt: "What does ZoikoTime record about me?", icon: "🔐" },
  { label: "Support", prompt: "Speak to a human agent", icon: "🎧" },
];

export default function ChatWindow() {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const sessionId = useStore((state) => state.sessionId);
  const messages = useStore((state) => state.messages);
  const appendMessage = useStore((state) => state.appendMessage);
  const replaceMessages = useStore((state) => state.replaceMessages);
  const loading = useStore((state) => state.loading);
  const setLoading = useStore((state) => state.setLoading);
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);
  const historyOpen = useStore((state) => state.historyOpen);
  const toggleHistory = useStore((state) => state.toggleHistory);
  const assistantContext = useStore((state) => state.assistantContext);
  const setAssistantContext = useStore((state) => state.setAssistantContext);
  const setSessions = useStore((state) => state.setSessions);
  const setSessionId = useStore((state) => state.setSessionId);
  const saveOnboardingDraft = useStore((state) => state.saveOnboardingDraft);
  const logout = useStore((state) => state.logout);
  const [input, setInput] = useState("");
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const copy = uiText[language] || uiText.en;

  useEffect(() => {
    async function loadContext() {
      try {
        const response = await fetchChatContext();
        if (response?.context) {
          setAssistantContext(response.context);
        }
      } catch (_error) {
        // Local fallback is enough.
      }
    }

    loadContext();
  }, [setAssistantContext]);

  const refreshSessions = async () => {
    if (!user?.email) return;
    try {
      const response = await fetchUserSessions(user.email);
      setSessions(response.sessions || []);
    } catch (_error) {
      // Non-blocking.
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    appendMessage(userMessage);
    setInput("");
    setLoading(true);

    try {
      const response = await sendMessage({
        message: trimmed,
        sessionId,
        user,
        language,
      });

      appendMessage({
        id: response.message.id,
        role: "assistant",
        content: response.message.answer,
        meta: {
          matchedQuestion: response.message.matchedQuestion,
          confidence: response.message.confidence,
          suggestions: response.message.suggestions,
        },
        timestamp: response.message.timestamp,
      });

      await refreshSessions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Message could not be sent");
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    if (!user) return;
    try {
      const response = await createChatSession(user);
      await setSessionId(response.session.sessionId, response.session.expiresAt);
      replaceMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            language === "hi"
              ? assistantContext.welcomeMessageHi || assistantContext.welcomeMessage
              : assistantContext.welcomeMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
      await refreshSessions();
      toast.success("New chat started");
    } catch (_error) {
      toast.error("Could not start a new chat");
    }
  };

  const handleEndChat = async () => {
    if (!sessionId) return;
    try {
      await endChatSession(sessionId, user?.email);
      await refreshSessions();
      toast.success("Chat saved for 24 hours");
    } catch (_error) {
      toast.error("Could not end this chat");
    }
  };

  const handleEditDetails = async () => {
    if (user) {
      saveOnboardingDraft(user);
    }
    await logout();
    navigate("/");
  };

  const leadAssistantMessage = messages.find((message) => message.role === "assistant");
  const conversationMessages = messages.filter((message) => message.id !== leadAssistantMessage?.id);
  const actionChips = useMemo(
    () =>
      assistantContext.quickActions?.length
        ? assistantContext.quickActions
        : quickTiles.map((tile) => ({
            id: tile.label,
            label: tile.label,
            message: tile.prompt,
          })),
    [assistantContext.quickActions],
  );

  return (
    <section
      className={`orbit-shell relative flex w-full max-w-[624px] flex-col overflow-hidden rounded-[30px] border text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)] ${
        theme === "orbit"
          ? "border-[#114753] bg-[#071722]"
          : "border-[#6d5340] bg-[#201814]"
      } h-[calc(100vh-1rem)] max-h-[842px] sm:h-[calc(100vh-2rem)]`}
    >
      <header className="relative overflow-hidden border-b border-[#15454c] bg-[linear-gradient(180deg,rgba(35,22,18,0.94)_0%,rgba(10,23,31,0.96)_62%,rgba(7,23,34,1)_100%)]">
        <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(29,222,188,0.15),transparent_60%)]" />

        <div className="relative flex items-start justify-between px-3 py-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="orbit-avatar-shell">
              <div className="orbit-avatar">
                <div className="orbit-avatar-badge">
                  <span className="orbit-avatar-z">K</span>
                  <span className="orbit-avatar-orbit" />
                </div>
                <span className="orbit-avatar-node" />
              </div>
            </div>

            <div className="min-w-0 pt-1">
              <div className="flex items-center gap-1.5">
                <h1 className="truncate font-['Trebuchet_MS','Avenir_Next',sans-serif] text-[1.88rem] font-semibold leading-none text-white">
                  {assistantContext.assistantName || "Koiris"}
                </h1>
                <span className="text-[1rem] text-white/90">✦</span>
              </div>

              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#175764] bg-[#0d2d34] px-3 py-[5px] text-[0.8rem] font-semibold uppercase tracking-[0.05em] text-[#16d6b8]">
                <FaBolt className="text-[0.72rem] text-[#f0a548]" />
                <span>{assistantContext.assistantBadge || copy.assistantBadge}</span>
              </div>

              <div className="mt-1.5 flex items-center gap-2 text-[0.95rem] font-semibold text-[#2ed37d]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2fd57d]" />
                <span>{assistantContext.statusText || copy.liveTools}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button className="orbit-icon-button" type="button" onClick={toggleHistory} aria-label={copy.history}>
              <FaClipboardList />
            </button>
            <button className="orbit-icon-button" type="button" onClick={toggleTheme} aria-label={copy.switchTheme}>
              {theme === "orbit" ? <FaSun /> : <FaMoon />}
            </button>
            <div className="relative">
              <button
                className="orbit-icon-button"
                type="button"
                onClick={() => setLanguageMenuOpen((current) => !current)}
                aria-label={copy.switchLanguage}
              >
                <FaPencil />
              </button>

              {languageMenuOpen ? (
                <div className="absolute right-0 top-14 z-30 min-w-[150px] rounded-2xl border border-[#19616b] bg-[#0b2634] p-2 shadow-2xl">
                  {languageOptions.map((option) => (
                    <button
                      key={option.code}
                      className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                        language === option.code
                          ? "bg-[#0e3a44] text-[#1fe1c0]"
                          : "text-slate-200 hover:bg-white/5"
                      }`}
                      type="button"
                      onClick={() => {
                        setLanguage(option.code);
                        setLanguageMenuOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-between gap-3 border-t border-[#15545f] px-3 py-3 text-[0.92rem] text-[#9cb1be]">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <span className="text-[#21d3b7]">•</span>
            <span className="inline-flex items-center gap-2">
              <FaWandMagicSparkles className="text-[#d7a65f]" />
              <span>Production AI</span>
            </span>
            <span className="text-[#1cd6bc]">{copy.toolsCount}</span>
            <span className="text-[#1cd6bc]">{copy.zeroHallucinations}</span>
            <span className="text-[#1cd6bc]">{copy.sessionLabel}</span>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#1d6e59] bg-[#10392d] px-3 py-1 text-[0.78rem] font-semibold uppercase tracking-[0.05em] text-[#72dd98]">
            <span>☑</span>
            <span>{copy.production}</span>
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-hidden border-t border-[#0c4f58]/80 px-4 pt-7">
        <div className="mb-5 text-center">
          <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-[2px] bg-[radial-gradient(circle_at_center,#ffffff_0%,#f4ffff_68%,#d7f6ef_100%)] shadow-[0_0_28px_rgba(52,227,199,0.18)]">
            <div className="flex h-[54px] w-[54px] items-center justify-center rounded-[2px] bg-[linear-gradient(140deg,#ffffff_0%,#e6faf4_100%)] text-[1.65rem] font-black text-[#3d6685]">
              K
            </div>
          </div>

          <p className="mt-4 text-[1.02rem] font-medium text-[#93a9b7]">{copy.orbitSubtitle}</p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {quickTiles.slice(0, 5).map((chip) => (
              <button
                key={chip.label}
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-[#1d4953] bg-[#0b2534] px-4 py-2 text-[0.98rem] font-semibold text-[#1ed3ba] transition hover:border-[#276371] hover:bg-[#0d2d3d]"
                onClick={() => setInput(chip.prompt)}
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-[#1d4953] bg-[#0b2534] px-4 py-2 text-[0.98rem] font-semibold text-[#1ed3ba] transition hover:border-[#276371] hover:bg-[#0d2d3d]"
              onClick={handleNewChat}
            >
              <FaPlus className="text-[0.82rem]" />
              <span>{copy.newChat}</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-[#1d4953] bg-[#0b2534] px-4 py-2 text-[0.98rem] font-semibold text-[#1ed3ba] transition hover:border-[#276371] hover:bg-[#0d2d3d]"
              onClick={handleEditDetails}
            >
              <FaPencil className="text-[0.82rem]" />
              <span>{copy.editDetails}</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-[#1d4953] bg-[#0b2534] px-4 py-2 text-[0.98rem] font-semibold text-[#1ed3ba] transition hover:border-[#276371] hover:bg-[#0d2d3d]"
              onClick={handleEndChat}
            >
              <FaVolumeHigh className="text-[0.82rem]" />
              <span>{copy.endChat}</span>
            </button>
          </div>
        </div>

        <ScrollToBottom className="h-[calc(100%-8rem)] !bg-transparent">
          <div className="space-y-4 pb-5">
            {leadAssistantMessage ? <MessageBubble message={leadAssistantMessage} compact={false} /> : null}

            <button
              type="button"
              className="flex w-full items-center justify-between rounded-[18px] border border-[#214a59] bg-[#10273a] px-5 py-4 text-left transition hover:border-[#2d6173] hover:bg-[#123044]"
              onClick={() => setInput(copy.browsePrimary)}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#173650] text-[#48dfc4]">
                  <FaShieldHalved className="text-[1rem]" />
                </div>
                <div>
                  <div className="text-[1.08rem] font-semibold text-[#dfe8ef]">{copy.browsePrimary}</div>
                  <div className="mt-0.5 text-[0.95rem] text-[#8ba3b4]">{copy.browsePrimaryMeta}</div>
                </div>
              </div>
              <span className="text-2xl text-[#1ed7bc]">›</span>
            </button>

            {actionChips.slice(0, 3).length ? (
              <div className="flex flex-wrap gap-2">
                {actionChips.slice(0, 3).map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    className="rounded-full border border-[#1d4953] bg-[#0b2534] px-3 py-1.5 text-sm font-semibold text-[#9ee8d7]"
                    onClick={() => setInput(chip.message || chip.prompt || chip.label)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            ) : null}

            {conversationMessages.map((message) => (
              <MessageBubble key={message.id} message={message} compact />
            ))}

            {loading ? <Loader /> : null}
          </div>
        </ScrollToBottom>
      </div>

      <div className="border-t border-[#123f49] bg-[#081b29] px-4 pb-4 pt-3">
        <form className="flex items-end gap-3" onSubmit={handleSubmit}>
          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-[#244658] bg-[#10263a] text-[#b4c0ca] transition hover:border-[#2f6473] hover:text-[#def4f2]"
            aria-label={copy.voiceInput}
          >
            <FaMicrophoneLines className="text-[0.95rem]" />
          </button>

          <div className="orbit-composer flex min-h-[50px] flex-1 items-center rounded-[18px] border border-[#214659] bg-[#0d2234] px-4">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSubmit(event);
                }
              }}
              placeholder={copy.placeholder}
              rows={1}
              className="h-10 max-h-28 w-full resize-none border-0 bg-transparent py-2.5 text-[1rem] text-[#c2d4df] outline-none placeholder:text-[#86a0b4]"
            />
          </div>

          <button
            className="orbit-send-button flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[16px] text-[#073443] transition hover:brightness-110"
            type="submit"
            disabled={loading}
          >
            <FaArrowUp className="translate-x-[1px] text-[1rem]" />
          </button>
        </form>

        <div className="mt-2 text-center text-xs text-[#6f8798]">
          <span className="rounded-md border border-white/10 px-1.5 py-0.5">Enter</span> {copy.messageComposerHint}
          <span className="mx-2">·</span>
          <span className="rounded-md border border-white/10 px-1.5 py-0.5">Shift+Enter</span> {copy.messageComposerHintAlt}
        </div>
      </div>

      {historyOpen ? <HistoryDrawer /> : null}
    </section>
  );
}
