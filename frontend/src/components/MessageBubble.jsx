import ReactMarkdown from "react-markdown";

export default function MessageBubble({ message, compact = true }) {
  const isAssistant = message.role === "assistant";

  return (
    <article
      className={[
        "rounded-[22px] border px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
        isAssistant
          ? "border-[#28485e] bg-[#142d42] text-[#e7eef4]"
          : "ml-auto max-w-[88%] border-[#285871] bg-[#123851] text-[#f3f8fb]",
        compact ? "max-w-[88%]" : "max-w-full",
      ].join(" ")}
    >
      {!compact ? null : (
        <div className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#1ed8bf]/90">
          {isAssistant ? "Koiris" : "You"}
        </div>
      )}

      <div
        className={[
          "max-w-none",
          compact ? "text-[1rem] leading-7 [&_p]:m-0" : "text-[1.15rem] font-medium leading-[1.7] [&_p]:m-0 [&_p+p]:mt-6",
        ].join(" ")}
      >
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>

      {isAssistant && compact && message.meta?.suggestions?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {message.meta.suggestions.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[#1b4853] bg-[#0d2736] px-3 py-1 text-xs text-[#1fd9bf]"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
