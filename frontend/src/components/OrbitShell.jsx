import { useEffect, useMemo, useRef, useState } from "react";
import {
  HiArrowPath,
  HiChatBubbleLeftRight,
  HiClipboardDocumentList,
  HiMoon,
  HiPaperAirplane,
  HiShieldCheck,
  HiSun,
  HiTicket,
  HiUserGroup,
  HiUsers,
} from "react-icons/hi2";

import { useTheme } from "../context/ThemeContext";
import {
  createSupportTicket,
  fetchAdminOverview,
  fetchBootstrap,
  fetchChatHistory,
  fetchEmployeeSummary,
  fetchWorkspaceConfig,
  sendChatMessage,
} from "../services/chatService";

function fallbackSurfaceMeta(surface) {
  if (surface === "admin") {
    return {
      title: "Admin workspace guidance",
      subtitle: "Policy setup, reports, implementation, and support routing",
      icon: HiShieldCheck,
    };
  }

  if (surface === "employee") {
    return {
      title: "Employee transparency guidance",
      subtitle: "Own-data visibility, screenshots, idle time, and corrections",
      icon: HiUsers,
    };
  }

  if (surface === "connect") {
    return {
      title: "Zoiko Connect assistance",
      subtitle: "Permission-scoped support and governed collaboration help",
      icon: HiUserGroup,
    };
  }

  return {
    title: "Public website guidance",
    subtitle: "Product, pricing, trust, and demo routing",
    icon: HiChatBubbleLeftRight,
  };
}

function ButtonChrome({ isDark, active = false }) {
  return active
    ? isDark
      ? "border-[#3b82f6]/40 bg-[#3b82f6]/16 text-[#dbeafe]"
      : "border-[#60a5fa] bg-[#eff6ff] text-[#1e40af]"
    : isDark
      ? "border-white/8 bg-white/[0.04] text-[#9bb8c8] hover:border-[#3b82f6]/40 hover:bg-[#3b82f6]/12 hover:text-[#dbeafe]"
      : "border-[#bfdbfe] bg-white text-[#1d4ed8] hover:border-[#60a5fa] hover:bg-[#eff6ff] hover:text-[#1e40af]";
}

function HeaderButton({ icon: Icon, label, onClick, isDark, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1.5 rounded-[10px] border px-2.5 font-[Nunito] text-[11px] font-bold transition ${ButtonChrome({ isDark, active })}`}
    >
      <Icon className="text-[15px]" />
      <span>{label}</span>
    </button>
  );
}

function SurfaceChip({ label, active, onClick, isDark }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[20px] border px-3 py-1.5 font-[Nunito] text-[10px] font-bold transition sm:text-[11px] ${ButtonChrome({ isDark, active })}`}
    >
      {label}
    </button>
  );
}

function CitationChip({ citation, isDark }) {
  return (
    <a
      href={citation.url}
      target="_blank"
      rel="noreferrer"
      className={`rounded-[10px] border px-2.5 py-1 text-[10px] font-semibold transition ${isDark ? "border-[#3b82f6]/20 bg-[#3b82f6]/10 text-[#93c5fd] hover:border-[#60a5fa]/40" : "border-[#bfdbfe] bg-white text-[#2563eb] hover:border-[#60a5fa]"}`}
      aria-label={`Open citation ${citation.title}`}
    >
      {citation.title}
    </a>
  );
}

function MessageBubble({ message, isDark, onPrompt, onSupport }) {
  const isUser = message.role === "user";
  const bubbleTone = isUser
    ? "bg-[linear-gradient(135deg,#1d4ed8,#38bdf8)] text-white shadow-[0_4px_14px_rgba(37,99,235,0.3)]"
    : isDark
      ? "border-white/8 bg-[#0c2336] text-[#e8f4f1]"
      : "border-[#dbeafe] bg-white text-[#0f172a]";

  return (
    <div className={`flex max-w-[94%] gap-2 ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"} animate-[zoiko-up_0.28s_cubic-bezier(0.22,1,0.36,1)]`}>
      <div
        className={`mt-1 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[9px] ${isUser ? "bg-[linear-gradient(135deg,#1e3a8a,#38bdf8)] text-white" : "bg-white shadow-[0_0_0_2px_rgba(37,99,235,0.12)]"}`}
      >
        {isUser ? "U" : "K"}
      </div>
      <div className="max-w-full">
        <div
          className={`rounded-[16px] border px-[13px] py-[10px] text-[13px] leading-[1.62] ${isUser ? "rounded-br-[4px] border-transparent" : "rounded-bl-[4px]"} ${bubbleTone}`}
        >
          <p>{message.text}</p>
          {message.context ? (
            <p className={`mt-3 text-[12px] ${isUser ? "text-white/90" : isDark ? "text-[#b9d3df]" : "text-[#475569]"}`}>
              {message.context}
            </p>
          ) : null}
        </div>

        {message.citations?.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.citations.map((citation) => (
              <CitationChip key={citation.sourceId} citation={citation} isDark={isDark} />
            ))}
          </div>
        ) : null}

        {message.nextAction ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (message.nextAction.type === "prompt") onPrompt(message.nextAction.value);
                else onSupport(message.nextAction.label);
              }}
              className={`rounded-[12px] border px-[11px] py-[5px] font-[Nunito] text-[11px] font-semibold transition ${isDark ? "border-[#3b82f6]/20 bg-[#3b82f6]/8 text-[#93c5fd] hover:border-[#60a5fa]/40 hover:bg-[#3b82f6]/14" : "border-[#bfdbfe] bg-white text-[#2563eb] hover:border-[#60a5fa] hover:bg-[#eff6ff]"}`}
            >
              {message.nextAction.label}
            </button>
          </div>
        ) : null}

        {message.toolsUsed?.length ? (
          <div className={`mt-2 text-[10px] ${isDark ? "text-[#7a9bad]" : "text-[#64748b]"}`}>
            Tools used: {message.toolsUsed.map((tool) => `${tool.name} (${tool.id})`).join(", ")}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function HistoryModal({ open, items, isDark, onClose, onReuse }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-5" onClick={onClose}>
      <div
        className={`max-h-[70vh] w-full max-w-[460px] overflow-hidden rounded-[20px] border ${isDark ? "border-white/8 bg-[#07111b]" : "border-[#dbeafe] bg-[#f8fbff]"}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`flex items-center justify-between border-b px-4 py-3 ${isDark ? "border-white/8" : "border-[#dbeafe]"}`}>
          <div className={`font-[Nunito] text-[15px] font-extrabold ${isDark ? "text-[#e8f4f1]" : "text-[#0f172a]"}`}>
            Chat History
          </div>
          <button
            type="button"
            className={`rounded-[10px] border px-2 py-1 text-sm ${ButtonChrome({ isDark })}`}
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="zoiko-scrollbar max-h-[60vh] overflow-y-auto px-3 py-3">
          {items.length ? (
            <div className="space-y-2">
              {items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onReuse(item.message)}
                  className={`w-full rounded-[12px] border px-3 py-3 text-left transition ${isDark ? "border-white/8 bg-[#0c2336] text-[#e8f4f1] hover:border-[#3b82f6]/30" : "border-[#dbeafe] bg-white text-[#0f172a] hover:border-[#60a5fa]"}`}
                >
                  <div className="text-[11px] font-semibold opacity-70">{item.timestamp}</div>
                  <div className="mt-1 text-[13px] font-semibold">{item.message}</div>
                  <div className={`mt-1 text-[12px] ${isDark ? "text-[#b9d3df]" : "text-[#475569]"}`}>
                    {item.reply?.answer}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className={`rounded-[12px] border px-4 py-5 text-center text-[13px] ${isDark ? "border-white/8 bg-[#0c2336] text-[#b9d3df]" : "border-[#dbeafe] bg-white text-[#475569]"}`}>
              No chat history yet for this session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminOverviewCard({ data, isDark }) {
  if (!data) return null;

  const metrics = Object.entries(data.metrics ?? {});

  return (
    <div className={`mt-3 rounded-[16px] border px-3 py-3 ${isDark ? "border-white/8 bg-[#0c2336]" : "border-[#dbeafe] bg-white"}`}>
      <div className={`font-[Nunito] text-[13px] font-extrabold ${isDark ? "text-[#e8f4f1]" : "text-[#0f172a]"}`}>
        Admin overview
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {metrics.map(([key, value]) => (
          <div
            key={key}
            className={`rounded-[12px] border px-3 py-2 ${isDark ? "border-white/8 bg-[#07111b]" : "border-[#dbeafe] bg-[#f8fbff]"}`}
          >
            <div className={`text-[10px] uppercase tracking-[0.06em] ${isDark ? "text-[#7a9bad]" : "text-[#64748b]"}`}>
              {key}
            </div>
            <div className={`mt-1 font-[Nunito] text-[18px] font-black ${isDark ? "text-[#93c5fd]" : "text-[#1d4ed8]"}`}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrbitShell() {
  const { isDark, toggleTheme } = useTheme();
  const [bootstrap, setBootstrap] = useState(null);
  const [surface, setSurface] = useState("website");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "I'm Kairos, ZoikoTime's assistant. I can help you understand the platform, compare plans, explain transparency, guide setup, and route support or demo requests.",
      context:
        "Responses stay grounded in approved ZoikoTime sources, respect the active role boundary, and always keep a human route available.",
      citations: [],
      nextAction: {
        type: "prompt",
        label: "Show pricing options",
        value: "Show pricing options",
      },
    },
  ]);
  const [sessionId] = useState(() => `session_${Math.random().toString(36).slice(2, 10)}`);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [pending, setPending] = useState(false);
  const [adminOverview, setAdminOverview] = useState(null);
  const [infoCard, setInfoCard] = useState(null);
  const [statusNote, setStatusNote] = useState("Grounded answers - Human route always available");
  const textareaRef = useRef(null);
  const liveRegionRef = useRef(null);

  const surfaceOptions = bootstrap?.surfaceOptions ?? [
    { value: "website", label: "Website", userState: "public" },
    { value: "admin", label: "Admin", userState: "admin" },
    { value: "employee", label: "Employee", userState: "employee" },
    { value: "connect", label: "Connect", userState: "authenticated" },
  ];

  const starterPrompts = bootstrap?.starterPrompts ?? {
    website: ["What is ZoikoTime?", "Show pricing options", "How do screenshots work?", "I want a demo"],
    admin: [
      "Explain the current workspace configuration",
      "How do reports work?",
      "Show screenshot policy guidance",
      "I need implementation help",
    ],
    employee: [
      "What can my manager see?",
      "How do correction requests work?",
      "Explain idle time",
      "Show my data summary",
    ],
    connect: [
      "How can Kairos help inside Zoiko Connect?",
      "Escalate this to a human",
      "Summarize support options",
      "What permissions apply here?",
    ],
  };

  const activeContext = useMemo(
    () =>
      surfaceOptions.find((item) => item.value === surface) ??
      surfaceOptions[0] ?? { value: "website", label: "Website", userState: "public" },
    [surface, surfaceOptions],
  );

  const fallbackMeta = fallbackSurfaceMeta(surface);
  const headerMeta = {
    title: bootstrap?.surfaceMeta?.[surface]?.title ?? fallbackMeta.title,
    subtitle: bootstrap?.surfaceMeta?.[surface]?.subtitle ?? fallbackMeta.subtitle,
    icon: fallbackMeta.icon,
  };
  const HeaderIcon = headerMeta.icon;

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 90)}px`;
  }, [messageInput]);

  useEffect(() => {
    async function loadBootstrapData() {
      try {
        const data = await fetchBootstrap();
        setBootstrap(data);
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            text: data.welcomeMessage,
            context: data.welcomeContext,
            citations: [],
            nextAction: {
              type: "prompt",
              label: "Show pricing options",
              value: "Show pricing options",
            },
          },
        ]);
      } catch (_error) {
        // fallback defaults stay visible
      }
    }

    loadBootstrapData();
  }, []);

  useEffect(() => {
    if (!liveRegionRef.current) return;
    const latest = messages[messages.length - 1];
    if (latest?.role === "assistant") liveRegionRef.current.textContent = latest.text;
  }, [messages]);

  useEffect(() => {
    setInfoCard(null);
    setAdminOverview(null);

    async function loadContext() {
      try {
        if (activeContext.userState === "admin") {
          const [configResponse, overviewResponse] = await Promise.all([
            fetchWorkspaceConfig("admin"),
            fetchAdminOverview(),
          ]);
          setInfoCard({
            title: "Workspace configuration",
            rows: Object.entries(configResponse.config ?? {}),
          });
          setAdminOverview(overviewResponse);
          setStatusNote(bootstrap?.statusNotes?.admin ?? "Admin surface - Policy-aware guidance - Audit-friendly");
          return;
        }

        if (activeContext.userState === "employee") {
          const employeeResponse = await fetchEmployeeSummary("employee", "employee_001");
          setInfoCard({
            title: "My transparency summary",
            rows: Object.entries(employeeResponse.summary ?? {}),
          });
          setStatusNote(bootstrap?.statusNotes?.employee ?? "Employee surface - Own-data only - Correction route available");
          return;
        }

        if (surface === "connect") {
          setStatusNote(bootstrap?.statusNotes?.connect ?? "Connect surface - Permission-scoped help - No cross-channel leakage");
          return;
        }

        setStatusNote(bootstrap?.statusNotes?.website ?? "Website surface - Product, pricing, trust, and demo guidance");
      } catch (error) {
        setStatusNote(error.message);
      }
    }

    loadContext();
  }, [activeContext.userState, bootstrap, surface]);

  async function refreshHistory() {
    const data = await fetchChatHistory(sessionId);
    setHistoryItems(data.items ?? []);
  }

  async function handleSend(value) {
    const text = value.trim();
    if (!text || pending) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      text,
    };

    setMessages((current) => [...current, userMessage]);
    setMessageInput("");
    setPending(true);

    try {
      const data = await sendChatMessage({
        message: text,
        sessionId,
        surface,
        userState: activeContext.userState,
      });

      setMessages((current) => [
        ...current,
        {
          id: data.conversationId,
          role: "assistant",
          text: data.answer,
          context: data.context,
          citations: data.citations,
          nextAction: data.nextAction,
          toolsUsed: data.toolsUsed,
        },
      ]);
      await refreshHistory();
    } catch (_error) {
      setMessages((current) => [
        ...current,
        {
          id: `error_${Date.now()}`,
          role: "assistant",
          text: "Please try again.",
          context: "",
          citations: [],
          nextAction: {
            type: "tool",
            label: "Escalate to a human",
            value: "escalate_to_human",
          },
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  async function handleSupport(issue) {
    try {
      const response = await createSupportTicket({
        issue,
        contact: activeContext.userState,
        surface,
        priority: "normal",
      });
      setMessages((current) => [
        ...current,
        {
          id: response.ticket.id,
          role: "assistant",
          text: "Support request submitted.",
          context: `Ticket ${response.ticket.id} is open with ${response.ticket.priority} priority.`,
          citations: [],
        },
      ]);
    } catch (_error) {
      setMessages((current) => [
        ...current,
        {
          id: `support_error_${Date.now()}`,
          role: "assistant",
          text: "Please try again.",
          context: "",
          citations: [],
        },
      ]);
    }
  }

  return (
    <main className={`relative flex min-h-screen items-center justify-center overflow-hidden ${isDark ? "bg-[#02060d]" : "bg-[#eff6ff]"}`}>
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute inset-0 ${isDark ? "bg-[radial-gradient(ellipse_70%_50%_at_20%_10%,rgba(59,130,246,0.18)_0%,transparent_60%),radial-gradient(ellipse_50%_50%_at_80%_80%,rgba(14,165,233,0.08)_0%,transparent_60%)]" : "bg-[radial-gradient(ellipse_70%_50%_at_20%_10%,rgba(59,130,246,0.14)_0%,transparent_60%),radial-gradient(ellipse_50%_50%_at_80%_80%,rgba(96,165,250,0.12)_0%,transparent_60%)]"}`}
        />
        <div className="zoiko-dots absolute inset-0" />
      </div>

      <div ref={liveRegionRef} className="sr-only" aria-live="polite" />

      <section
        className={`zoiko-widget relative z-10 flex flex-col overflow-hidden border shadow-[0_0_0_1px_rgba(59,130,246,0.06),0_32px_80px_rgba(0,0,0,0.35),0_0_60px_rgba(37,99,235,0.06)] ${isDark ? "border-white/8 bg-[#07111b] text-[#e8f4f1]" : "border-[#dbeafe] bg-[#f8fbff] text-[#0f172a]"}`}
      >
        <header className={`relative overflow-hidden border-b px-3.5 py-3 ${isDark ? "border-[#3b82f6]/25 bg-[linear-gradient(180deg,#08111d_0%,#07111b_100%)]" : "border-[#bfdbfe] bg-[linear-gradient(180deg,#dbeafe_0%,#f8fbff_100%)]"}`}>
          <div className={`absolute inset-0 ${isDark ? "bg-[linear-gradient(90deg,rgba(59,130,246,0.10)_0%,transparent_60%)]" : "bg-[linear-gradient(90deg,rgba(59,130,246,0.08)_0%,transparent_60%)]"}`} />
          <div className="relative flex items-start gap-2.5">
            <div className={`relative flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] p-[3px] shadow-[0_0_0_2px_#2563eb,0_4px_16px_rgba(37,99,235,0.25)] ${isDark ? "bg-white" : "bg-[#dbeafe]"}`}>
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[linear-gradient(135deg,#1d4ed8,#38bdf8)] font-[Nunito] text-sm font-black text-white">
                K
              </div>
              <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 bg-[#48bb78] shadow-[0_0_6px_rgba(72,187,120,0.6)] ${isDark ? "border-[#07111b]" : "border-[#f8fbff]"}`} />
            </div>

            <div className="min-w-0 flex-1">
              <div className={`font-[Nunito] text-[15px] font-extrabold tracking-[-0.01em] ${isDark ? "text-[#e8f4f1]" : "text-[#0f172a]"}`}>
                {bootstrap?.assistantName ?? "Kairos"}
              </div>
              <div className={`mt-0.5 inline-flex items-center gap-1 rounded-[20px] border px-2 py-0.5 font-[Nunito] text-[10px] font-bold tracking-[0.04em] ${isDark ? "border-[#3b82f6]/25 bg-[#3b82f6]/10 text-[#93c5fd]" : "border-[#93c5fd] bg-white text-[#2563eb]"}`}>
                <span>{bootstrap?.assistantBadge ?? "ZoikoTime conversational intelligence"}</span>
              </div>
              <div className={`mt-1 flex items-center gap-1 text-[10px] font-semibold ${isDark ? "text-[#93c5fd]" : "text-[#2563eb]"}`}>
                <span className="h-[5px] w-[5px] rounded-full bg-[#48bb78]" />
                <span>{statusNote}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <HeaderButton
                icon={HiClipboardDocumentList}
                label="History"
                onClick={async () => {
                  await refreshHistory();
                  setHistoryOpen(true);
                }}
                isDark={isDark}
              />
              <HeaderButton
                icon={isDark ? HiSun : HiMoon}
                label="Theme"
                onClick={toggleTheme}
                isDark={isDark}
              />
              <HeaderButton
                icon={HiArrowPath}
                label={activeContext.label}
                onClick={() => {
                  const currentIndex = surfaceOptions.findIndex((item) => item.value === surface);
                  const next = surfaceOptions[(currentIndex + 1) % surfaceOptions.length];
                  if (next) setSurface(next.value);
                }}
                isDark={isDark}
              />
            </div>
          </div>
        </header>

        <div className={`flex flex-wrap items-center gap-2 border-b px-3.5 py-1.5 text-[11px] ${isDark ? "border-[#3b82f6]/25 bg-[#3b82f6]/[0.06] text-[#9bb8c8]" : "border-[#bfdbfe] bg-[#dbeafe]/50 text-[#475569]"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${isDark ? "bg-[#60a5fa]/70" : "bg-[#2563eb]/70"}`} />
          <span>{activeContext.label}</span>
          <span>•</span>
          <span className={`font-bold ${isDark ? "text-[#93c5fd]" : "text-[#2563eb]"}`}>
            {activeContext.userState}
          </span>
          <span>•</span>
          <span className={`font-bold ${isDark ? "text-[#93c5fd]" : "text-[#2563eb]"}`}>
            Human route enabled
          </span>
          <span className={`ml-auto rounded-[20px] border px-2 py-0.5 text-[9.5px] font-extrabold tracking-[0.04em] ${isDark ? "border-[#3b82f6]/25 bg-[#3b82f6]/10 text-[#93c5fd]" : "border-[#93c5fd] bg-white text-[#2563eb]"}`}>
            V1
          </span>
        </div>

        <div className={`border-b px-3.5 py-2 ${isDark ? "border-[#3b82f6]/25 bg-[#07111b]" : "border-[#dbeafe] bg-[#f8fbff]"}`}>
          <div className="flex flex-wrap gap-1.5">
            {surfaceOptions.map((option) => (
              <SurfaceChip
                key={option.value}
                label={option.label}
                active={surface === option.value}
                onClick={() => setSurface(option.value)}
                isDark={isDark}
              />
            ))}
          </div>
        </div>

        <div className="zoiko-scrollbar flex-1 overflow-y-auto px-3 py-3 sm:px-3.5 sm:py-3.5">
          <div className="pb-2 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[14px] bg-white shadow-[0_0_12px_rgba(37,99,235,0.25)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[linear-gradient(135deg,#1d4ed8,#38bdf8)] font-[Nunito] text-sm font-black text-white">
                K
              </div>
            </div>
            <div className={`mt-1.5 text-[11.5px] font-medium ${isDark ? "text-[#7a9bad]" : "text-[#64748b]"}`}>
              {headerMeta.title}
            </div>
            <div className={`mt-1 text-[11px] ${isDark ? "text-[#9bb8c8]" : "text-[#475569]"}`}>
              {headerMeta.subtitle}
            </div>
          </div>

          <div className="mb-3 flex flex-wrap justify-center gap-1.5">
            {(starterPrompts[surface] ?? []).map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSend(prompt)}
                className={`rounded-[20px] border px-3 py-1.5 font-[Nunito] text-[11px] font-bold transition hover:-translate-y-px ${isDark ? "border-[#3b82f6]/20 bg-[#3b82f6]/10 text-[#93c5fd] hover:border-[#60a5fa]/40 hover:bg-[#3b82f6]/16" : "border-[#bfdbfe] bg-white text-[#2563eb] hover:border-[#60a5fa] hover:bg-[#eff6ff]"}`}
              >
                {prompt}
              </button>
            ))}
          </div>

          {infoCard ? (
            <div className={`mb-3 rounded-[16px] border px-3 py-3 ${isDark ? "border-white/8 bg-[#0c2336]" : "border-[#dbeafe] bg-white"}`}>
              <div className="flex items-center gap-2">
                <HeaderIcon className={`text-[18px] ${isDark ? "text-[#93c5fd]" : "text-[#2563eb]"}`} />
                <div className={`font-[Nunito] text-[13px] font-extrabold ${isDark ? "text-[#e8f4f1]" : "text-[#0f172a]"}`}>
                  {infoCard.title}
                </div>
              </div>
              <div className="mt-2 space-y-2">
                {infoCard.rows.map(([key, value]) => (
                  <div
                    key={key}
                    className={`grid grid-cols-[38%_62%] gap-2 border-b px-0 py-1.5 text-[11.5px] last:border-b-0 ${isDark ? "border-white/5" : "border-slate-100"}`}
                  >
                    <div className={isDark ? "text-[#7a9bad]" : "text-[#64748b]"}>
                      {key}
                    </div>
                    <div className={`text-right font-semibold ${isDark ? "text-[#e8f4f1]" : "text-[#0f172a]"}`}>
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {adminOverview ? <AdminOverviewCard data={adminOverview} isDark={isDark} /> : null}

          <div className="space-y-3">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isDark={isDark}
                onPrompt={handleSend}
                onSupport={handleSupport}
              />
            ))}

            {pending ? (
              <div className="flex max-w-[94%] gap-2">
                <div className="mt-1 flex h-[26px] w-[26px] items-center justify-center rounded-[9px] bg-white shadow-[0_0_0_2px_rgba(37,99,235,0.12)]">
                  K
                </div>
                <div className={`rounded-[16px] rounded-bl-[4px] border px-[13px] py-[10px] text-[13px] ${isDark ? "border-white/8 bg-[#0c2336] text-[#e8f4f1]" : "border-[#dbeafe] bg-white text-[#0f172a]"}`}>
                  Kairos is grounding this answer against the approved sources...
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <footer className={`shrink-0 border-t px-2.5 pb-3.5 pt-2.5 ${isDark ? "border-white/8 bg-[#07111b]" : "border-[#dbeafe] bg-[#f8fbff]"}`}>
          <div className="flex items-end gap-[7px]">
            <button
              type="button"
              onClick={() => handleSupport("User requested human support from the composer.")}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] border text-base transition ${isDark ? "border-white/8 bg-[#0c2336] text-[#7a9bad] hover:border-[#3b82f6]/25 hover:bg-[#3b82f6]/10 hover:text-[#93c5fd]" : "border-[#dbeafe] bg-white text-[#2563eb] hover:border-[#60a5fa] hover:bg-[#eff6ff]"}`}
              aria-label="Create support ticket"
            >
              <HiTicket />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={messageInput}
              onChange={(event) => setMessageInput(event.target.value.slice(0, 500))}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend(messageInput);
                }
              }}
              placeholder="Ask Kairos about ZoikoTime pricing, setup, transparency, reports, or support..."
              className={`max-h-[90px] min-h-10 flex-1 resize-none rounded-[12px] border px-[13px] py-[10px] text-[13px] leading-[1.5] outline-none transition ${isDark ? "border-white/8 bg-[#0c2336] text-[#e8f4f1] placeholder:text-[#7a9bad] focus:border-[#3b82f6]/25 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)]" : "border-[#dbeafe] bg-white text-[#0f172a] placeholder:text-[#64748b] focus:border-[#60a5fa] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)]"}`}
            />

            <button
              type="button"
              onClick={() => handleSend(messageInput)}
              disabled={pending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[linear-gradient(135deg,#1d4ed8,#38bdf8)] text-base text-white shadow-[0_4px_12px_rgba(37,99,235,0.35)] transition hover:scale-[1.06] hover:shadow-[0_6px_18px_rgba(37,99,235,0.45)] disabled:cursor-default disabled:opacity-45 disabled:hover:scale-100"
              aria-label="Send message"
            >
              <HiPaperAirplane className="rotate-45" />
            </button>
          </div>

          <div className={`mt-1 text-right text-[10px] ${isDark ? "text-[#7a9bad]" : "text-[#64748b]"}`}>
            {messageInput.length > 0 ? `${messageInput.length} / 500` : ""}
          </div>
          <div className={`mt-[5px] text-center text-[10px] max-sm:hidden ${isDark ? "text-[#7a9bad]" : "text-[#64748b]"}`}>
            <span className={`rounded-[4px] border px-[5px] py-px font-mono text-[9px] ${isDark ? "border-white/8 bg-white/[0.05]" : "border-[#dbeafe] bg-white"}`}>
              Enter
            </span>
            <span className="mx-2">send</span>
            <span>•</span>
            <span className={`mx-2 rounded-[4px] border px-[5px] py-px font-mono text-[9px] ${isDark ? "border-white/8 bg-white/[0.05]" : "border-[#dbeafe] bg-white"}`}>
              Shift+Enter
            </span>
            <span>new line</span>
          </div>
        </footer>
      </section>

      <HistoryModal
        open={historyOpen}
        items={historyItems}
        isDark={isDark}
        onClose={() => setHistoryOpen(false)}
        onReuse={(message) => {
          setHistoryOpen(false);
          setMessageInput(message);
          textareaRef.current?.focus();
        }}
      />
    </main>
  );
}
