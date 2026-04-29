export default function WelcomeCard({ onSuggestion, theme }) {
  const isDark = theme === "dark";
  const chips = [
    "Clock-in / Clock-out help",
    "What gets recorded about me?",
    "Leave & Time Off",
    "Payslips & Earnings",
    "Speak to a human agent",
  ];

  return (
    <div
      className={`mx-auto mb-5 w-full max-w-sm rounded-2xl border p-4 ${
        isDark
          ? "border-[rgba(51,227,205,0.1)] bg-[rgba(7,24,35,0.7)]"
          : "border-[rgba(26,199,191,0.2)] bg-[rgba(26,199,191,0.05)]"
      }`}
      style={{ animation: "msgIn 0.3s ease both" }}
    >
      <p className="text-[0.62rem] font-black uppercase tracking-widest text-[#33e3cd] mb-3">
        Quick Start
      </p>
      <div className="flex flex-col gap-1.5">
        {chips.map((c, i) => (
          <button
            key={i}
            onClick={() => onSuggestion(c)}
            className={`w-full text-left rounded-xl border px-3 py-2 text-xs transition-all ${
              isDark
                ? "border-[rgba(51,227,205,0.11)] bg-[rgba(10,35,48,0.5)] text-[#6ec8d5] hover:border-[rgba(51,227,205,0.28)] hover:bg-[rgba(16,48,60,0.8)] hover:text-[#33e3cd]"
                : "border-[rgba(26,199,191,0.2)] bg-white text-[#1a7a75] hover:border-[rgba(26,199,191,0.5)] hover:bg-[rgba(26,199,191,0.1)] hover:text-[#0e5c58]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}