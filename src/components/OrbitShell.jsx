import { useEffect, useRef, useState } from "react";
import {
  HiArrowRight,
  HiArrowTrendingUp,
  HiBuildingOffice2,
  HiChartBarSquare,
  HiClipboardDocumentList,
  HiCog6Tooth,
  HiGlobeAlt,
  HiLanguage,
  HiLifebuoy,
  HiMicrophone,
  HiMoon,
  HiPaperAirplane,
  HiShieldCheck,
  HiSignal,
  HiSun,
  HiUsers,
  HiWrenchScrewdriver,
} from "react-icons/hi2";

import { useTheme } from "../context/ThemeContext";

const quickChips = [
  { label: "Pricing", icon: HiArrowTrendingUp },
  { label: "Reports", icon: HiChartBarSquare },
  { label: "Screenshots", icon: HiClipboardDocumentList },
  { label: "Employee View", icon: HiUsers },
  { label: "Admin Setup", icon: HiCog6Tooth },
  { label: "Policies", icon: HiShieldCheck },
  { label: "Support", icon: HiLifebuoy },
];

const menuCards = [
  {
    title: "Browse ZoikoTime plans",
    subtitle: "Pricing, subscriptions, and buying guidance",
    icon: HiGlobeAlt,
  },
  {
    title: "Check screenshot policy",
    subtitle: "Visibility, frequency, and workspace controls",
    icon: HiClipboardDocumentList,
  },
  {
    title: "Coverage check",
    subtitle: "Feature coverage across website and workspaces",
    icon: HiSignal,
  },
  {
    title: "Help with setup",
    subtitle: "Configuration, onboarding, and troubleshooting",
    icon: HiWrenchScrewdriver,
  },
  {
    title: "For teams and admins",
    subtitle: "Reports, accountability, and operational visibility",
    icon: HiBuildingOffice2,
  },
  {
    title: "Enterprise support",
    subtitle: "ZoikoTime help for larger organizations",
    icon: HiLifebuoy,
  },
];

const followUps = [
  "Show pricing options",
  "Explain screenshots",
  "Admin setup help",
];

function HeaderButton({ children, label, onClick, isDark }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1.5 rounded-[10px] border px-2.5 font-[Nunito] text-[10px] font-bold transition sm:h-8 sm:text-[11px] ${
        isDark
          ? "border-white/8 bg-white/[0.04] text-[#9bb8c8] hover:border-[#3b82f6]/40 hover:bg-[#3b82f6]/12 hover:text-[#dbeafe]"
          : "border-[#bfdbfe] bg-white text-[#1d4ed8] hover:border-[#60a5fa] hover:bg-[#eff6ff] hover:text-[#1e40af]"
      }`}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

function QuickChip({ label, icon: Icon, isDark }) {
  return (
    <button
      type="button"
      className={`whitespace-nowrap rounded-[20px] border px-3 py-1.5 font-[Nunito] text-[10px] font-bold transition hover:-translate-y-px sm:text-[11px] ${
        isDark
          ? "border-[#3b82f6]/20 bg-[#3b82f6]/10 text-[#93c5fd] hover:border-[#60a5fa]/40 hover:bg-[#3b82f6]/16"
          : "border-[#bfdbfe] bg-white text-[#2563eb] hover:border-[#60a5fa] hover:bg-[#eff6ff]"
      }`}
    >
      <span className="inline-flex items-center gap-1.5">
        <Icon className="text-[12px]" />
        {label}
      </span>
    </button>
  );
}

function MenuCard({ title, subtitle, icon: Icon, isDark }) {
  return (
    <button
      type="button"
      className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-[12px] border px-[13px] py-[11px] text-left transition hover:translate-x-[2px] ${
        isDark
          ? "border-white/8 bg-[#0c2336] hover:border-[#3b82f6]/40 hover:bg-[#102b43]"
          : "border-[#dbeafe] bg-white hover:border-[#60a5fa] hover:bg-[#f8fbff]"
      }`}
    >
      <span className="absolute inset-y-0 left-0 w-[3px] rounded-r-[3px] bg-[#2563eb] opacity-0 transition group-hover:opacity-100" />
      <div
        className={`w-[30px] shrink-0 text-center text-[20px] ${isDark ? "text-[#60a5fa]" : "text-[#2563eb]"}`}
      >
        <Icon className="mx-auto" />
      </div>
      <div className="flex-1">
        <div
          className={`font-[Nunito] text-[13px] font-semibold leading-[1.3] ${isDark ? "text-[#e8f4f1]" : "text-[#0f172a]"}`}
        >
          {title}
        </div>
        <div
          className={`mt-0.5 text-[10.5px] ${isDark ? "text-[#7a9bad]" : "text-[#64748b]"}`}
        >
          {subtitle}
        </div>
      </div>
      <HiArrowRight
        className={`shrink-0 text-[16px] ${isDark ? "text-[#60a5fa]/80" : "text-[#2563eb]/80"}`}
      />
    </button>
  );
}

export default function OrbitShell() {
  const { isDark, toggleTheme } = useTheme();
  const [messageInput, setMessageInput] = useState("");
  const [language, setLanguage] = useState("EN");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 90)}px`;
  }, [messageInput]);

  return (
    <main
      className={`relative flex min-h-screen items-center justify-center overflow-hidden ${isDark ? "bg-[#02060d]" : "bg-[#eff6ff]"}`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[radial-gradient(ellipse_70%_50%_at_20%_10%,rgba(37,99,235,0.18)_0%,transparent_60%),radial-gradient(ellipse_50%_50%_at_80%_80%,rgba(14,165,233,0.08)_0%,transparent_60%)]"
              : "bg-[radial-gradient(ellipse_70%_50%_at_20%_10%,rgba(59,130,246,0.14)_0%,transparent_60%),radial-gradient(ellipse_50%_50%_at_80%_80%,rgba(96,165,250,0.12)_0%,transparent_60%)]"
          }`}
        />
        <div className="zoiko-dots absolute inset-0" />
      </div>

      <section
        className={`zoiko-widget relative z-10 flex flex-col overflow-hidden border shadow-[0_0_0_1px_rgba(59,130,246,0.06),0_32px_80px_rgba(0,0,0,0.35),0_0_60px_rgba(37,99,235,0.06)] ${
          isDark
            ? "border-white/8 bg-[#07111b] text-[#e8f4f1]"
            : "border-[#dbeafe] bg-[#f8fbff] text-[#0f172a]"
        }`}
      >
        <header
          className={`relative overflow-hidden border-b px-3.5 py-3 ${
            isDark
              ? "border-[#3b82f6]/25 bg-[linear-gradient(180deg,#08111d_0%,#07111b_100%)]"
              : "border-[#bfdbfe] bg-[linear-gradient(180deg,#dbeafe_0%,#f8fbff_100%)]"
          }`}
        >
          <div
            className={`absolute inset-0 ${
              isDark
                ? "bg-[linear-gradient(90deg,rgba(59,130,246,0.10)_0%,transparent_60%)]"
                : "bg-[linear-gradient(90deg,rgba(59,130,246,0.08)_0%,transparent_60%)]"
            }`}
          />
          <div className="relative flex items-start gap-2.5">
            <div
              className={`relative h-[42px] w-[42px] shrink-0 rounded-[14px] p-[3px] shadow-[0_0_0_2px_#2563eb,0_4px_16px_rgba(37,99,235,0.25)] ${isDark ? "bg-white" : "bg-[#dbeafe]"}`}
            >
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[linear-gradient(135deg,#1d4ed8,#38bdf8)] font-[Nunito] text-sm font-black text-white">
                K
              </div>
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 bg-[#48bb78] shadow-[0_0_6px_rgba(72,187,120,0.6)] ${isDark ? "border-[#07111b]" : "border-[#f8fbff]"}`}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div
                className={`font-[Nunito] text-[14px] font-extrabold tracking-[-0.01em] sm:text-[15.5px] ${isDark ? "text-[#e8f4f1]" : "text-[#0f172a]"}`}
              >
                Kairos
              </div>
              <div
                className={`mt-0.5 inline-flex items-center gap-1 rounded-[20px] border px-2 py-0.5 font-[Nunito] text-[9px] font-bold tracking-[0.04em] sm:text-[10px] ${
                  isDark
                    ? "border-[#3b82f6]/25 bg-[#3b82f6]/10 text-[#93c5fd]"
                    : "border-[#93c5fd] bg-white text-[#2563eb]"
                }`}
              >
                <span>⚡</span>
                <span>AI ASSISTANT</span>
              </div>
              <div
                className={`mt-0.5 flex items-center gap-1 text-[9px] font-semibold sm:text-[10.5px] ${isDark ? "text-[#93c5fd]" : "text-[#2563eb]"}`}
              >
                <span className="h-[5px] w-[5px] rounded-full bg-[#48bb78]" />
                <span>Live • ZoikoTime support active</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <HeaderButton label="" title="Chat history" isDark={isDark}>
                <HiClipboardDocumentList className="text-[15px]" />
              </HeaderButton>
              <HeaderButton
                label=""
                title="Theme change"
                onClick={toggleTheme}
                isDark={isDark}
              >
                {isDark ? (
                  <HiSun className="text-[15px]" />
                ) : (
                  <HiMoon className="text-[15px]" />
                )}
              </HeaderButton>
              <HeaderButton
                label={`Language ${language}`}
                title="Language change"
                onClick={() =>
                  setLanguage((current) => (current === "EN" ? "FR" : "EN"))
                }
                isDark={isDark}
              >
                <HiLanguage className="text-[15px]" />
              </HeaderButton>
            </div>
          </div>
        </header>

        <div
          className={`flex flex-wrap items-center gap-2 border-b px-3.5 py-1.5 text-[11px] ${isDark ? "border-[#3b82f6]/25 bg-[#3b82f6]/[0.06] text-[#9bb8c8]" : "border-[#bfdbfe] bg-[#dbeafe]/50 text-[#475569]"}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${isDark ? "bg-[#60a5fa]/70" : "bg-[#2563eb]/70"}`}
          />
          <span>Production AI</span>
          <span>•</span>
          <span
            className={`font-bold ${isDark ? "text-[#93c5fd]" : "text-[#2563eb]"}`}
          >
            ZoikoTime • Guided UI • Static Demo
          </span>
          <span>•</span>
          <span
            className={`font-bold ${isDark ? "text-[#93c5fd]" : "text-[#2563eb]"}`}
          >
            Session: 0m
          </span>
          <span
            className={`ml-auto rounded-[20px] border px-2 py-0.5 text-[9.5px] font-extrabold tracking-[0.04em] ${isDark ? "border-[#3b82f6]/25 bg-[#3b82f6]/10 text-[#93c5fd]" : "border-[#93c5fd] bg-white text-[#2563eb]"}`}
          >
            PRODUCTION
          </span>
        </div>

        <div className="zoiko-scrollbar flex-1 overflow-y-auto px-3 py-3 sm:px-3.5 sm:py-3.5">
          <div className="pb-2 text-center">
            <div
              className={`mx-auto flex h-11 w-11 items-center justify-center rounded-[14px] shadow-[0_0_12px_rgba(37,99,235,0.25)] ${isDark ? "bg-white" : "bg-white"}`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[linear-gradient(135deg,#1d4ed8,#38bdf8)] font-[Nunito] text-sm font-black text-white">
                K
              </div>
            </div>
            <div
              className={`mt-1.5 text-[11.5px] font-medium ${isDark ? "text-[#7a9bad]" : "text-[#64748b]"}`}
            >
              Kairos - Your ZoikoTime assistant
            </div>
          </div>

          <div className="mb-2 flex flex-wrap justify-center gap-1.5">
            {quickChips.map((chip) => (
              <QuickChip key={chip.label} {...chip} isDark={isDark} />
            ))}
          </div>

          <div className="mb-2 flex max-w-[92%] items-end gap-2 self-start">
            <div
              className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[9px] p-0.5 shadow-[0_0_0_2px_rgba(37,99,235,0.12)] ${isDark ? "bg-white" : "bg-white"}`}
            >
              <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[linear-gradient(135deg,#1d4ed8,#38bdf8)] font-[Nunito] text-[10px] font-black text-white">
                K
              </div>
            </div>
            <div className="max-w-full">
              <div
                className={`rounded-bl-[4px] rounded-br-[16px] rounded-t-[16px] border px-[13px] py-[10px] text-[13px] leading-[1.62] ${isDark ? "border-white/8 bg-[#0c2336] text-[#e8f4f1]" : "border-[#dbeafe] bg-white text-[#0f172a]"}`}
              >
                <p>
                  Hey there! Welcome to <strong>ZoikoTime</strong>! I&apos;m{" "}
                  <strong>Kairos</strong> - your ZoikoTime assistant. I can help
                  you understand pricing, reports, screenshot visibility, admin
                  setup, employee transparency, and support routes.
                </p>
                <p className="mt-3 font-semibold">
                  What can I help you with today?
                </p>
              </div>

              <div className="mt-2 flex flex-col gap-1.5">
                {menuCards.map((card) => (
                  <MenuCard key={card.title} {...card} isDark={isDark} />
                ))}
              </div>

              <div
                className={`mt-3 flex flex-wrap items-center gap-1.5 text-[11px] ${isDark ? "text-[#7a9bad]" : "text-[#64748b]"}`}
              >
                <button
                  type="button"
                  className={`rounded-[8px] px-[7px] py-[3px] transition ${isDark ? "hover:border hover:border-[#3b82f6]/25 hover:bg-[#3b82f6]/8 hover:text-[#93c5fd]" : "hover:border hover:border-[#60a5fa] hover:bg-[#eff6ff] hover:text-[#2563eb]"}`}
                >
                  Listen
                </button>
                <button
                  type="button"
                  className={`rounded-[8px] px-[7px] py-[3px] transition ${isDark ? "hover:border hover:border-[#3b82f6]/25 hover:bg-[#3b82f6]/8 hover:text-[#93c5fd]" : "hover:border hover:border-[#60a5fa] hover:bg-[#eff6ff] hover:text-[#2563eb]"}`}
                >
                  Copy
                </button>
                <button
                  type="button"
                  className={`rounded-[8px] px-[7px] py-[3px] transition ${isDark ? "hover:border hover:border-[#3b82f6]/25 hover:bg-[#3b82f6]/8 hover:text-[#93c5fd]" : "hover:border hover:border-[#60a5fa] hover:bg-[#eff6ff] hover:text-[#2563eb]"}`}
                >
                  Helpful
                </button>
                <button
                  type="button"
                  className={`rounded-[8px] px-[7px] py-[3px] transition ${isDark ? "hover:border hover:border-[#3b82f6]/25 hover:bg-[#3b82f6]/8 hover:text-[#93c5fd]" : "hover:border hover:border-[#60a5fa] hover:bg-[#eff6ff] hover:text-[#2563eb]"}`}
                >
                  Escalate
                </button>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {followUps.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`rounded-[12px] border px-[11px] py-[5px] font-[Nunito] text-[11px] font-semibold transition ${
                      isDark
                        ? "border-[#3b82f6]/20 bg-[#3b82f6]/8 text-[#93c5fd] hover:border-[#60a5fa]/40 hover:bg-[#3b82f6]/14"
                        : "border-[#bfdbfe] bg-white text-[#2563eb] hover:border-[#60a5fa] hover:bg-[#eff6ff]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer
          className={`shrink-0 border-t px-2.5 pb-3.5 pt-2.5 ${isDark ? "border-white/8 bg-[#07111b]" : "border-[#dbeafe] bg-[#f8fbff]"}`}
        >
          <div className="flex items-end gap-[7px]">
            <button
              type="button"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] border text-base transition ${
                isDark
                  ? "border-white/8 bg-[#0c2336] text-[#7a9bad] hover:border-[#3b82f6]/25 hover:bg-[#3b82f6]/10 hover:text-[#93c5fd]"
                  : "border-[#dbeafe] bg-white text-[#2563eb] hover:border-[#60a5fa] hover:bg-[#eff6ff]"
              }`}
            >
              <HiMicrophone />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={messageInput}
              onChange={(event) =>
                setMessageInput(event.target.value.slice(0, 500))
              }
              placeholder="Ask me about ZoikoTime pricing, reports, screenshots, or admin setup..."
              className={`max-h-[90px] min-h-10 flex-1 resize-none rounded-[12px] border px-[13px] py-[10px] text-[13px] leading-[1.5] outline-none transition ${
                isDark
                  ? "border-white/8 bg-[#0c2336] text-[#e8f4f1] placeholder:text-[#7a9bad] focus:border-[#3b82f6]/25 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)]"
                  : "border-[#dbeafe] bg-white text-[#0f172a] placeholder:text-[#64748b] focus:border-[#60a5fa] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)]"
              }`}
            />

            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[linear-gradient(135deg,#1d4ed8,#38bdf8)] text-base text-white shadow-[0_4px_12px_rgba(37,99,235,0.35)] transition hover:scale-[1.06] hover:shadow-[0_6px_18px_rgba(37,99,235,0.45)]"
            >
              <HiPaperAirplane className="rotate-45" />
            </button>
          </div>

          <div
            className={`mt-1 text-right text-[10px] ${isDark ? "text-[#7a9bad]" : "text-[#64748b]"}`}
          >
            {messageInput.length > 0 ? `${messageInput.length} / 500` : ""}
          </div>
          <div
            className={`mt-[5px] text-center text-[10px] max-sm:hidden ${isDark ? "text-[#7a9bad]" : "text-[#64748b]"}`}
          >
            <span
              className={`rounded-[4px] border px-[5px] py-px font-mono text-[9px] ${isDark ? "border-white/8 bg-white/[0.05]" : "border-[#dbeafe] bg-white"}`}
            >
              Enter
            </span>
            <span className="mx-2">send</span>
            <span>•</span>
            <span
              className={`mx-2 rounded-[4px] border px-[5px] py-px font-mono text-[9px] ${isDark ? "border-white/8 bg-white/[0.05]" : "border-[#dbeafe] bg-white"}`}
            >
              Shift+Enter
            </span>
            <span>new line</span>
          </div>
        </footer>
      </section>
    </main>
  );
}
