import { HiMiniCheckBadge } from "react-icons/hi2";

import { statusItems } from "../../data/kairosContent";
import { useTheme } from "../../context/ThemeContext";

export default function StatusBar() {
  const { isDark } = useTheme();

  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-3 text-sm font-semibold sm:px-6 ${isDark ? "border-sky-900/60 text-cyan-300" : "border-sky-200 text-sky-700"}`}>
      {statusItems.map((item, index) => (
        <div key={item} className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            {index === 0 ? <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> : null}
            <span>{item}</span>
          </span>
          {index < statusItems.length - 1 ? <span className={isDark ? "text-sky-700" : "text-sky-300"}>•</span> : null}
        </div>
      ))}

      <span className={`ml-auto inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-black uppercase tracking-[0.08em] ${isDark ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-sky-300 bg-sky-100 text-sky-700"}`}>
        <HiMiniCheckBadge />
        Production
      </span>
    </div>
  );
}
