import toast from "react-hot-toast";
import { FaClockRotateLeft, FaTrashCan, FaXmark } from "react-icons/fa6";
import { deleteChatSession, fetchHistory } from "../services/api";
import { useStore } from "../store/useStore";
import { uiText } from "../data/translations";

export default function HistoryDrawer() {
  const language = useStore((state) => state.language);
  const user = useStore((state) => state.user);
  const sessionId = useStore((state) => state.sessionId);
  const sessions = useStore((state) => state.sessions);
  const setSessions = useStore((state) => state.setSessions);
  const setSessionId = useStore((state) => state.setSessionId);
  const replaceMessages = useStore((state) => state.replaceMessages);
  const closeHistory = useStore((state) => state.closeHistory);
  const copy = uiText[language] || uiText.en;

  const handleOpenSession = async (targetSessionId, expiresAt) => {
    try {
      const response = await fetchHistory(targetSessionId);
      replaceMessages(response.messages || []);
      await setSessionId(targetSessionId, expiresAt);
      closeHistory();
    } catch (_error) {
      toast.error("Could not open that conversation");
    }
  };

  const handleDeleteSession = async (targetSessionId) => {
    try {
      await deleteChatSession(targetSessionId, user?.email);
      const nextSessions = sessions.filter((item) => item.sessionId !== targetSessionId);
      setSessions(nextSessions);

      if (targetSessionId === sessionId) {
        replaceMessages([]);
      }

      toast.success("Conversation deleted");
    } catch (_error) {
      toast.error("Could not delete that conversation");
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-[3px]" onClick={closeHistory} role="presentation">
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-[360px] flex-col border-l border-[#14505d] bg-[#0a2230] p-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1ed8bf]">{copy.history}</p>
            <h3 className="mt-1 text-xl font-semibold text-white">{copy.historyTitle}</h3>
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#20465a] bg-[#10283a] text-slate-100"
            type="button"
            onClick={closeHistory}
          >
            <FaXmark />
          </button>
        </div>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
          {sessions.length ? (
            sessions.map((conversation) => (
              <div
                key={conversation.sessionId}
                className={`rounded-2xl border p-3 ${
                  conversation.sessionId === sessionId
                    ? "border-[#1ed8bf] bg-[#113141]"
                    : "border-[#1d4355] bg-[#10283a]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{conversation.title || "New conversation"}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-200">{conversation.preview || copy.noHistory}</p>
                  </div>
                  <button
                    className="mt-0.5 rounded-xl border border-[#365060] bg-[#0c1f2d] p-2 text-[#e2eff4] transition hover:border-red-400 hover:text-red-300"
                    type="button"
                    onClick={() => handleDeleteSession(conversation.sessionId)}
                    title={copy.deleteSession}
                  >
                    <FaTrashCan />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#89a1b2]">
                  <span className="flex items-center gap-1">
                    <FaClockRotateLeft />
                    {new Date(conversation.lastMessageAt || Date.now()).toLocaleString()}
                  </span>
                  <span>{conversation.messageCount || 0} msgs</span>
                </div>

                <button
                  className="mt-3 w-full rounded-xl border border-[#1c5764] bg-[#0d3341] px-3 py-2 text-sm font-semibold text-[#baf6eb] transition hover:border-[#1ed8bf]"
                  type="button"
                  onClick={() => handleOpenSession(conversation.sessionId, conversation.expiresAt)}
                >
                  {copy.openChat}
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">{copy.noHistory}</p>
          )}
        </div>
      </aside>
    </div>
  );
}
