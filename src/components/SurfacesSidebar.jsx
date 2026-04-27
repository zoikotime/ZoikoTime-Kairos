import { starterPrompts, surfaces } from "../data/kairosContent";
import { useTheme } from "../context/ThemeContext";
import PanelTitle from "./PanelTitle";

export default function SurfacesSidebar() {
  const { isDark } = useTheme();

  return (
    <aside className={`overflow-hidden rounded-[28px] border shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-colors ${isDark ? "border-slate-700 bg-slate-900" : "border-sky-200/70 bg-white"}`}>
      <div className={`border-b px-5 py-5 ${isDark ? "border-slate-700" : "border-sky-100"}`}>
        <PanelTitle
          isDark={isDark}
          eyebrow="Conversation scope"
          title="Kairos surfaces"
          description="The chatbot is one governed system across multiple ZoikoTime contexts."
        />
      </div>

      <div className="space-y-3 px-4 py-4">
        {surfaces.map((surface) => {
          const Icon = surface.icon;

          return (
            <article key={surface.title} className={`rounded-3xl border p-4 transition-colors ${isDark ? "border-slate-600 bg-slate-800" : "border-sky-100 bg-sky-50/70"}`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm ${isDark ? "bg-slate-700 text-cyan-400" : "bg-white text-sky-700"}`}>
                  <Icon className="text-lg" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-950"}`}>{surface.title}</h3>
                  <p className={`mt-2 text-sm leading-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{surface.text}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className={`border-t px-4 py-4 ${isDark ? "border-slate-700" : "border-sky-100"}`}>
        <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${isDark ? "text-cyan-400" : "text-sky-700"}`}>Suggested starts</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${isDark ? "border-slate-600 bg-slate-800 text-slate-200 hover:border-slate-500 hover:bg-slate-700" : "border-sky-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50"}`}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
