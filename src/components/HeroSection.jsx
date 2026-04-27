import { HiBars3BottomLeft, HiBolt, HiLifebuoy, HiMoon, HiSun } from "react-icons/hi2";

import { headerChips, topStats } from "../data/kairosContent";
import { useTheme } from "../context/ThemeContext";
import BrandMark from "./BrandMark";
import HeaderAction from "./HeaderAction";

export default function HeroSection() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <section className={`rounded-[30px] border p-4 text-white shadow-[0_28px_80px_rgba(0,0,0,0.3)] sm:p-6 transition-all ${isDark ? "border-sky-900/40 bg-[linear-gradient(135deg,#0d1f2d,#102545_42%,#0f2d4a_100%)]" : "border-sky-200/60 bg-[linear-gradient(135deg,#081a36,#102957_42%,#123f88_100%)]"}`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <BrandMark />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Kairos</h1>
              <span className="rounded-full border border-sky-300/30 bg-sky-400/12 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-sky-100">
                ZoikoTime assistant
              </span>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-sky-50/90 sm:text-[15px]">
              A responsive chatbot shell built from the Kairos production PDF: governed, permission-aware, citation-ready, and shaped
              for ZoikoTime rather than a generic AI bot.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {headerChips.map((chip) => (
                <span key={chip} className="rounded-full border border-white/12 bg-white/10 px-3 py-2 text-xs font-semibold text-sky-50">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <HeaderAction onClick={toggleTheme}>{isDark ? <HiSun /> : <HiMoon />}</HeaderAction>
          <HeaderAction>
            <HiBars3BottomLeft />
          </HeaderAction>
          <HeaderAction>
            <HiLifebuoy />
          </HeaderAction>
          <HeaderAction>
            <HiBolt />
          </HeaderAction>
        </div>
      </div>

      <div className="mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-2 xl:grid-cols-4">
        {topStats.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 transition-colors">
            <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${isDark ? "text-cyan-300/70" : "text-sky-100/70"}`}>{item.label}</p>
            <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
