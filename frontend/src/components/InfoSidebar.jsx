import { designNotes, guardrails, tools } from "../data/kairosContent";
import { useTheme } from "../context/ThemeContext";
import PanelTitle from "./PanelTitle";

export default function InfoSidebar() {
  const { isDark } = useTheme();

  return (
    <aside className="flex min-h-0 flex-col gap-4">
      <section className={`rounded-[28px] border p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] ${isDark ? "border-slate-700 bg-slate-900" : "border-sky-200/70 bg-white"}`}>
        <PanelTitle
          isDark={isDark}
          eyebrow="Guardrails"
          title="Non-negotiable behavior"
          description="These panels translate the PDF's core boundaries into the UI structure."
        />
        <div className="mt-4 space-y-3">
          {guardrails.map((item) => (
            <div
              key={item}
              className={`rounded-2xl border px-4 py-3 text-sm font-medium ${isDark ? "border-sky-900/60 bg-sky-950/40 text-slate-100" : "border-sky-100 bg-sky-50/75 text-slate-700"}`}
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className={`rounded-[28px] border p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] ${isDark ? "border-slate-700 bg-slate-900" : "border-sky-200/70 bg-white"}`}>
        <PanelTitle
          isDark={isDark}
          eyebrow="Tool layer"
          title="Typed actions"
          description="Controlled actions the chatbot can trigger after permission checks."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {tools.map((tool) => (
            <div key={tool.name} className={`rounded-2xl border px-4 py-3 ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"}`}>
              <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{tool.name}</p>
              <p className={`mt-1 text-xs leading-5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{tool.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`rounded-[28px] border p-5 text-white shadow-[0_18px_60px_rgba(8,26,54,0.18)] ${isDark ? "border-sky-900/60 bg-[linear-gradient(180deg,#0d2247,#13366f)]" : "border-sky-200/70 bg-[linear-gradient(180deg,#0f3a8a,#2563eb)]"}`}>
        <PanelTitle
          isDark
          eyebrow="Design notes"
          title="Responsive shell"
          description="Single-column on small screens, split layout on larger screens, and stable message dimensions throughout."
        />
        <div className="mt-4 grid gap-3">
          {designNotes.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.text} className="flex gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm leading-6 text-sky-50/90">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-base">
                  <Icon />
                </div>
                <p className="m-0">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
