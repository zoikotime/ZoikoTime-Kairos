import { HiArrowUpRight, HiShieldCheck } from "react-icons/hi2";

import { footerChips, messages, starterPrompts, workspaceChips } from "../data/kairosContent";
import { useTheme } from "../context/ThemeContext";

export default function ChatWorkspace() {
  const { isDark } = useTheme();

  return (
    <section className={`flex min-h-[76dvh] min-w-0 flex-col overflow-hidden rounded-[32px] border shadow-[0_24px_80px_rgba(15,23,42,0.10)] transition-colors xl:min-h-0 ${isDark ? "border-slate-700 bg-slate-900" : "border-sky-200/70 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]"}`}>
      <header className={`border-b px-4 py-4 sm:px-5 ${isDark ? "border-slate-700" : "border-sky-100"}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${isDark ? "text-cyan-400" : "text-sky-700"}`}>Live assistant panel</p>
            <h2 className={`mt-2 text-xl font-bold sm:text-2xl ${isDark ? "text-white" : "text-slate-950"}`}>ZoikoTime conversational workspace</h2>
            <p className={`mt-2 max-w-3xl text-sm leading-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Direct answer first, context second, one next action, then citations. That response pattern comes straight from the PDF.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-2 text-xs font-bold ${isDark ? "bg-cyan-900/40 text-cyan-200" : "bg-sky-100 text-sky-800"}`}>Production spec aligned</span>
            <span className={`rounded-full px-3 py-2 text-xs font-bold ${isDark ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-700"}`}>Responsive shell</span>
          </div>
        </div>
      </header>

      <div className={`border-b px-4 py-4 sm:px-5 ${isDark ? "border-slate-700" : "border-sky-100"}`}>
        <div className="flex flex-wrap gap-2">
          {workspaceChips.map((chip) => (
            <span
              key={chip}
              className={`rounded-full border px-3 py-2 text-xs font-semibold ${isDark ? "border-sky-900/60 bg-sky-950/70 text-sky-100" : "border-sky-200 bg-sky-50 text-sky-800"}`}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
          <div className={`flex flex-col items-center rounded-[28px] border border-dashed px-5 py-8 text-center ${isDark ? "border-sky-900/60 bg-[linear-gradient(180deg,#0b2547,#0d1f3a)]" : "border-sky-200 bg-[linear-gradient(180deg,#eef6ff,#f8fbff)]"}`}>
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,#123f88,#38bdf8)] text-2xl text-white shadow-[0_18px_45px_rgba(37,99,235,0.26)]">
              <HiShieldCheck />
            </div>
            <p className={`mt-5 text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Kairos for ZoikoTime</p>
            <p className={`mt-2 max-w-2xl text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Enterprise-facing UI structure for grounded product help, admin support, employee transparency, and governed escalation.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {starterPrompts.slice(0, 4).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${isDark ? "border-sky-900/60 bg-slate-900 text-sky-100 hover:border-sky-700 hover:bg-slate-800" : "border-sky-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50"}`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {messages.map((message, index) => {
            const isUser = message.role === "user";

            return (
              <article
                key={`${message.label}-${index}`}
                className={`max-w-[92%] rounded-[28px] px-4 py-4 sm:max-w-[80%] ${
                  isUser
                    ? "self-end rounded-br-lg bg-[linear-gradient(135deg,#0f3a8a,#2563eb)] text-white shadow-[0_20px_40px_rgba(37,99,235,0.22)]"
                    : index === 0
                      ? isDark
                        ? "self-start rounded-bl-lg border border-slate-700 bg-slate-800 text-white"
                        : "self-start rounded-bl-lg border border-sky-200 bg-white text-slate-900"
                      : isDark
                        ? "self-start rounded-bl-lg border border-sky-900/60 bg-sky-950/40 text-white"
                        : "self-start rounded-bl-lg border border-sky-100 bg-sky-50/85 text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-[11px] font-bold uppercase tracking-[0.14em] ${isUser ? "bg-white/14 text-white" : isDark ? "bg-sky-900/70 text-sky-100" : "bg-sky-100 text-sky-800"}`}
                  >
                    {isUser ? "User" : "AI"}
                  </span>
                  <p className={`m-0 text-sm font-bold ${isUser ? "text-white" : isDark ? "text-white" : "text-slate-950"}`}>{message.label}</p>
                </div>
                <p className={`mt-3 text-sm leading-7 ${isUser ? "text-white/95" : isDark ? "text-slate-200" : "text-slate-700"}`}>{message.text}</p>
                {message.citations ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {message.citations.map((citation) => (
                      <span
                        key={citation}
                        className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${isDark ? "border-sky-900/60 bg-sky-950/70 text-sky-100" : "border-sky-200 bg-sky-50 text-sky-800"}`}
                      >
                        {citation}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>

      <footer className={`border-t px-4 py-4 sm:px-5 ${isDark ? "border-slate-700" : "border-sky-100"}`}>
        <div className="mb-4 flex flex-wrap gap-2">
          {footerChips.map((chip) => (
            <span
              key={chip}
              className={`rounded-full border px-3 py-2 text-xs font-semibold ${isDark ? "border-slate-700 bg-slate-800 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-700"}`}
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <label className="block flex-1">
            <span className="sr-only">Chat input</span>
            <textarea
              rows={3}
              className={`min-h-24 w-full resize-none rounded-[24px] border px-4 py-3 text-sm outline-none transition ${isDark ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-400 focus:border-sky-500" : "border-sky-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-sky-400"}`}
              placeholder="Ask about pricing, screenshots, reports, permissions, support, or employee transparency..."
            />
          </label>
          <button
            type="button"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[22px] bg-[linear-gradient(135deg,#0f3a8a,#38bdf8)] px-6 text-sm font-bold text-white shadow-[0_14px_30px_rgba(37,99,235,0.24)] transition hover:brightness-105 md:min-w-32"
          >
            <HiArrowUpRight />
            Send
          </button>
        </div>

        <div className={`mt-3 flex flex-wrap items-center gap-3 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          <span className={`rounded-full px-2.5 py-1 font-semibold ${isDark ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-600"}`}>Enter sends</span>
          <span className={`rounded-full px-2.5 py-1 font-semibold ${isDark ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-600"}`}>Shift+Enter new line</span>
          <span>Static UI only, backend wiring comes later</span>
        </div>
      </footer>
    </section>
  );
}
