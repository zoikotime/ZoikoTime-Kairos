import TypingDots from "./TypingDots";

export default function MessageBubble({ msg, onSuggestion, theme }) {
  const isUser = msg.role === "user";
  const isDark = theme === "dark";
  const body = msg.text ?? msg.content ?? "";

  return (
    <div
      className={`flex w-full gap-2.5 ${isUser ? "justify-end" : "justify-start"} mb-4`}
      style={{ animation: "msgIn 0.22s ease both" }}
    >
      {/* Bot avatar */}
      {!isUser && (
        <div className="flex-shrink-0 mt-0.5">
          <div className="orbit-avatar-shell h-8 w-8 rounded-[13px]">
            <div className="orbit-avatar h-7 w-7 rounded-[10px] flex items-center justify-center">
              <span className="orbit-avatar-z text-[0.72rem] font-black text-[#1d4e61]">K</span>
            </div>
          </div>
        </div>
      )}

      <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"} max-w-[78%]`}>
        {/* Bubble */}
        <div
          className={
            isUser
              ? "rounded-2xl rounded-tr-sm bg-gradient-to-br from-[#1ac7bf] to-[#57d995] px-4 py-2.5 text-[#042820] font-semibold text-sm shadow-lg"
              : isDark
              ? "rounded-2xl rounded-tl-sm border border-[rgba(51,227,205,0.11)] bg-[rgba(7,26,38,0.85)] px-4 py-3 text-[#cde8f0] text-sm leading-relaxed shadow-md"
              : "rounded-2xl rounded-tl-sm border border-[rgba(26,199,191,0.25)] bg-white px-4 py-3 text-[#103040] text-sm leading-relaxed shadow-md"
          }
        >
          {msg.typing ? <TypingDots /> : <span className="whitespace-pre-wrap">{body}</span>}
        </div>

        {/* Citations */}
        {!isUser && !msg.typing && msg.citations?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {msg.citations.map((c, i) => (
              <span
                key={i}
                className={`rounded-full border px-2 py-0.5 text-[0.6rem] font-medium ${
                  isDark
                    ? "border-[rgba(51,227,205,0.13)] bg-[rgba(10,35,48,0.5)] text-[#4a8a94]"
                    : "border-[rgba(26,199,191,0.3)] bg-[rgba(26,199,191,0.08)] text-[#1a7a75]"
                }`}
              >
                {c.title}
              </span>
            ))}
          </div>
        )}

        {/* Quick reply chips */}
        {!isUser && !msg.typing && msg.suggestions?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSuggestion(s)}
                className={`rounded-full border px-3 py-1 text-[0.71rem] font-medium transition-all active:scale-95 ${
                  isDark
                    ? "border-[rgba(51,227,205,0.2)] bg-[rgba(10,35,48,0.65)] text-[#6dddd0] hover:border-[#33e3cd] hover:bg-[rgba(18,52,62,0.9)] hover:text-[#33e3cd]"
                    : "border-[rgba(26,199,191,0.35)] bg-[rgba(26,199,191,0.07)] text-[#1a9a92] hover:border-[#1ac7bf] hover:bg-[rgba(26,199,191,0.15)] hover:text-[#0e7a75]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 mt-0.5">
          <div
            className={`h-8 w-8 rounded-[13px] flex items-center justify-center text-[0.68rem] font-bold ${
              isDark
                ? "border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.07)] text-[#8bc8d5]"
                : "border border-[rgba(26,199,191,0.3)] bg-[rgba(26,199,191,0.1)] text-[#1a7a75]"
            }`}
          >
            U
          </div>
        </div>
      )}
    </div>
  );
}
