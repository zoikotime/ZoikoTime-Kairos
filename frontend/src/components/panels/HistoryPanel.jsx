import { HiOutlineChatBubbleLeft, HiOutlineXMark } from "react-icons/hi2";

export default function HistoryPanel({ sessions, onClose, onSelect, onNewChat, theme }) {
  const isDark = theme === "dark";

  const formatDate = (raw) => {
    if (!raw) return "--";
    const value = new Date(raw);
    if (Number.isNaN(value.getTime())) return raw;
    return value.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border shadow-2xl ${
        isDark
          ? "border-[rgba(80,214,123,0.16)] bg-[rgba(4,14,7,0.98)]"
          : "border-[rgba(31,154,70,0.24)] bg-white"
      }`}
      style={{ animation: "panelIn 0.17s ease both" }}
    >
      <div
        className={`flex items-center justify-between border-b px-4 py-3 ${
          isDark
            ? "border-[rgba(255,255,255,0.05)]"
            : "border-[rgba(31,154,70,0.12)]"
        }`}
      >
        <span className="text-[0.65rem] font-black uppercase tracking-widest text-[#44d66f]">
          Chat History
        </span>
        <button onClick={onClose} className="orbit-icon-button h-7 w-7 rounded-[10px]">
          <HiOutlineXMark className="h-3.5 w-3.5" />
        </button>
      </div>

      <div
        className={`border-b px-3 py-3 ${
          isDark
            ? "border-[rgba(255,255,255,0.05)]"
            : "border-[rgba(31,154,70,0.12)]"
        }`}
      >
        <button
          onClick={() => {
            onNewChat();
            onClose();
          }}
          className={`w-full rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
            isDark
              ? "bg-[rgba(15,51,27,0.92)] text-[#92f1af] hover:bg-[rgba(19,64,34,0.98)]"
              : "bg-[rgba(80,214,123,0.14)] text-[#176d38] hover:bg-[rgba(80,214,123,0.2)]"
          }`}
        >
          Start a new conversation
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto p-2" style={{ scrollbarWidth: "thin" }}>
        {sessions?.length ? (
          sessions.map((session, index) => (
            <button
              key={session.sessionId || index}
              onClick={() => {
                onSelect(session);
                onClose();
              }}
              className={`mb-1 flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                isDark
                  ? "text-[#b8d8c0] hover:bg-[rgba(80,214,123,0.06)] hover:text-[#e5ffea]"
                  : "text-[#29613b] hover:bg-[rgba(80,214,123,0.08)] hover:text-[#134f28]"
              }`}
            >
              <HiOutlineChatBubbleLeft className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#44d66f]" />
              <div className="min-w-0">
                <div className="truncate font-semibold">
                  {session.title || `Session ${index + 1}`}
                </div>
                {session.preview ? (
                  <div className={`mt-0.5 line-clamp-2 text-[0.68rem] ${isDark ? "text-[#789483]" : "text-[#6f9378]"}`}>
                    {session.preview}
                  </div>
                ) : null}
                <div className={`mt-0.5 text-[0.68rem] ${isDark ? "text-[#5e7d68]" : "text-[#7ca084]"}`}>
                  {formatDate(session.lastMessageAt || session.createdAt || session.date)}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className={`py-10 text-center text-xs ${isDark ? "text-[#5e7d68]" : "text-[#7ca084]"}`}>
            No history yet
          </div>
        )}
      </div>

      <div className={`px-4 py-2 text-[0.62rem] ${isDark ? "text-[#5f8169]" : "text-[#6d9b79]"}`}>
        Chats stay available for 24 hours and then expire automatically.
      </div>
    </div>
  );
}
