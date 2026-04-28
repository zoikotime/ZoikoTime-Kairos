import { useEffect } from "react";
import toast from "react-hot-toast";
import ChatWindow from "../components/ChatWindow";
import { useStore } from "../store/useStore";
import { fetchHistory, fetchUserSessions } from "../services/api";

export default function ChatPage() {
  const user = useStore((state) => state.user);
  const sessionId = useStore((state) => state.sessionId);
  const replaceMessages = useStore((state) => state.replaceMessages);
  const setSessions = useStore((state) => state.setSessions);

  useEffect(() => {
    async function loadHistory() {
      if (!sessionId) return;
      try {
        const response = await fetchHistory(sessionId);
        if (response.messages?.length) {
          replaceMessages(response.messages);
        }
      } catch (_error) {
        toast.error("Could not load chat history");
      }
    }

    loadHistory();
  }, [replaceMessages, sessionId]);

  useEffect(() => {
    async function loadSessions() {
      if (!user?.email) return;
      try {
        const response = await fetchUserSessions(user.email);
        setSessions(response.sessions || []);
      } catch (_error) {
        toast.error("Could not load saved conversations");
      }
    }

    loadSessions();
  }, [setSessions, user?.email, sessionId]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(23,139,255,0.18),transparent_26%),linear-gradient(180deg,#02060b_0%,#03101c_46%,#04182b_100%)] px-2 py-2 text-slate-100 sm:px-4 sm:py-4">
      <div className="mx-auto flex min-h-[calc(100vh-1rem)] w-full max-w-[1280px] items-center justify-center sm:min-h-[calc(100vh-2rem)]">
        <ChatWindow />
      </div>
    </div>
  );
}
