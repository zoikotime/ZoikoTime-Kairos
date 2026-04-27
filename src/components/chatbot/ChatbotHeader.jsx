import { HiMiniLanguage, HiMiniMoon, HiMiniSun, HiOutlineTrash } from "react-icons/hi2";

import { assistantProfile } from "../../data/kairosContent";
import { useTheme } from "../../context/ThemeContext";
import ShellButton from "./ShellButton";

export default function ChatbotHeader({ language, onClearChat, onLanguageChange }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className={`border-b px-4 py-5 sm:px-6 ${isDark ? "border-sky-900/60 bg-[linear-gradient(180deg,#17110e_0%,#0a1b28_100%)]" : "border-sky-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-[22px] border-2 shadow-[0_10px_30px_rgba(56,189,248,0.18)] ${isDark ? "border-cyan-300 bg-white" : "border-sky-400 bg-sky-50"}`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#67e8f9)] text-xl font-black text-white">
              K
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>{assistantProfile.name}</h1>
              <span className={`text-xl ${isDark ? "text-cyan-300" : "text-sky-500"}`}>✦</span>
            </div>

            <div className="mt-1 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold uppercase tracking-[0.08em] shadow-sm">
              <span className="text-amber-300">⚡</span>
              <span className={isDark ? "text-cyan-200" : "text-sky-700"}>{assistantProfile.badge}</span>
            </div>

            <div className={`mt-1 flex items-center gap-2 text-sm font-semibold ${isDark ? "text-emerald-400" : "text-sky-600"}`}>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span>{assistantProfile.liveStatus}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <ShellButton label="Clear Chat" icon={HiOutlineTrash} onClick={onClearChat} />
          <ShellButton label={isDark ? "Light Mode" : "Dark Mode"} icon={isDark ? HiMiniSun : HiMiniMoon} onClick={toggleTheme} />
          <ShellButton label={`Language ${language}`} icon={HiMiniLanguage} onClick={onLanguageChange} />
        </div>
      </div>
    </header>
  );
}
