import { HiMicrophone, HiPaperAirplane } from "react-icons/hi2";

import { useTheme } from "../../context/ThemeContext";

export default function ChatComposer({ messageInput, onInputChange }) {
  const { isDark } = useTheme();

  return (
    <footer className={`border-t px-4 py-4 sm:px-6 ${isDark ? "border-sky-900/60 bg-[#061a29]" : "border-sky-200 bg-white/80"}`}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-[18px] border text-xl ${isDark ? "border-sky-900/60 bg-[#10283d] text-slate-300" : "border-sky-200 bg-sky-50 text-sky-700"}`}
        >
          <HiMicrophone />
        </button>

        <div className={`flex flex-1 items-center gap-3 rounded-[22px] border px-4 py-4 ${isDark ? "border-sky-900/60 bg-[#10283d]" : "border-sky-200 bg-[#f8fcff]"}`}>
          <input
            type="text"
            value={messageInput}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="Ask about pricing, reports, screenshots, admin setup, support, or employee transparency..."
            className={`w-full bg-transparent text-lg outline-none placeholder:text-slate-400 ${isDark ? "text-slate-100" : "text-slate-800"}`}
          />
        </div>

        <button
          type="button"
          className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#2563eb,#67e8f9)] text-xl text-white shadow-[0_14px_35px_rgba(37,99,235,0.35)]"
        >
          <HiPaperAirplane className="translate-x-[1px] rotate-45" />
        </button>
      </div>

      <div className={`mt-3 flex flex-wrap items-center justify-center gap-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        <span className={`rounded-md border px-2 py-0.5 text-xs ${isDark ? "border-sky-900/60 bg-[#10283d]" : "border-sky-200 bg-sky-50"}`}>Enter</span>
        <span>send</span>
        <span>•</span>
        <span className={`rounded-md border px-2 py-0.5 text-xs ${isDark ? "border-sky-900/60 bg-[#10283d]" : "border-sky-200 bg-sky-50"}`}>Shift+Enter</span>
        <span>new line</span>
      </div>
    </footer>
  );
}
