import { assistantProfile, featuredCard, quickActions, responseActions, solutionCards, suggestionChips, welcomeMessage } from "../../data/kairosContent";
import { useTheme } from "../../context/ThemeContext";
import QuickActionPill from "./QuickActionPill";

export default function ChatbotBody() {
  const { isDark } = useTheme();
  const FeaturedIcon = featuredCard.icon;
  const ActionIcon = featuredCard.actionIcon;

  return (
    <div className="min-h-0 flex-1 px-4 py-4 sm:px-6 sm:py-5">
      <div className="mx-auto h-full max-w-[560px]">
        <div className={`scrollbar-thin flex h-full flex-col overflow-y-auto rounded-[28px] border px-4 py-5 sm:px-6 ${isDark ? "border-sky-900/60 bg-[#041827]" : "border-sky-200 bg-[#fafdff]"}`}>
          <div className="flex flex-col items-center text-center">
            <div className={`flex h-20 w-20 items-center justify-center rounded-[24px] border shadow-[0_14px_35px_rgba(37,99,235,0.16)] ${isDark ? "border-sky-900 bg-white" : "border-sky-200 bg-white"}`}>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1d4ed8,#67e8f9)] text-2xl font-black text-white">
                K
              </div>
            </div>

            <p className={`mt-5 max-w-[420px] text-xl font-semibold leading-8 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{assistantProfile.summary}</p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {quickActions.map((item) => (
                <QuickActionPill key={item.label} label={item.label} icon={item.icon} />
              ))}
            </div>

            <div className={`mt-6 w-full rounded-[24px] border p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ${isDark ? "border-sky-900/60 bg-[#10283d]" : "border-sky-200 bg-white"}`}>
              <p className={`text-[clamp(0.98rem,1.4vw,1.18rem)] font-bold leading-8 ${isDark ? "text-white" : "text-slate-900"}`}>{welcomeMessage.title}</p>
              <p className={`mt-5 text-[clamp(0.98rem,1.4vw,1.18rem)] font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{welcomeMessage.prompt}</p>
            </div>

            <button
              type="button"
              className={`mt-4 flex w-full items-center justify-between rounded-[22px] border px-5 py-4 text-left transition ${isDark ? "border-sky-900/60 bg-[#10283d] hover:bg-[#14324b]" : "border-sky-200 bg-white hover:bg-sky-50"}`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isDark ? "bg-sky-900/70 text-cyan-300" : "bg-sky-100 text-sky-600"}`}>
                  <FeaturedIcon className="text-2xl" />
                </div>
                <div>
                  <p className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{featuredCard.title}</p>
                  <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{featuredCard.subtitle}</p>
                </div>
              </div>
              <ActionIcon className={`text-2xl ${isDark ? "text-cyan-300" : "text-sky-600"}`} />
            </button>

            <div className="mt-2 w-full space-y-2">
              {solutionCards.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    type="button"
                    className={`flex w-full items-center justify-between rounded-[20px] border px-5 py-4 text-left transition ${
                      isDark ? "border-sky-900/60 bg-[#10283d] hover:bg-[#14324b]" : "border-sky-200 bg-white hover:bg-sky-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${isDark ? "bg-sky-900/70 text-cyan-300" : "bg-sky-100 text-sky-600"}`}>
                        <Icon className="text-xl" />
                      </div>
                      <div>
                        <p className={`text-[1.05rem] font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{item.title}</p>
                        <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{item.subtitle}</p>
                      </div>
                    </div>
                    <ActionIcon className={`text-xl ${isDark ? "text-cyan-300" : "text-sky-600"}`} />
                  </button>
                );
              })}
            </div>

            <div className={`mt-4 flex w-full flex-wrap items-center gap-5 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              {responseActions.map((item) => (
                <button key={item} type="button" className="transition hover:opacity-80">
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-4 flex w-full flex-wrap gap-3">
              {suggestionChips.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    isDark ? "border-sky-900/60 bg-[#0b2437] text-cyan-300 hover:bg-[#11314a]" : "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
