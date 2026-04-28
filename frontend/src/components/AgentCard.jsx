import { Building2, Mail, LogOut, UserRound } from "lucide-react";
import { useStore } from "../store/useStore";
import { uiText } from "../data/translations";

export default function AgentCard({ user, onLogout }) {
  const language = useStore((state) => state.language);
  const copy = uiText[language] || uiText.en;

  return (
    <div className="agent-card">
      <div className="agent-avatar">ZT</div>
      <h3>{user?.name || "Employee"}</h3>
      <p className="agent-subtitle">ZoikoTime self-service chat</p>

      <div className="agent-details">
        <span>
          <UserRound size={16} /> {user?.employeeId || "Session active"}
        </span>
        <span>
          <Mail size={16} /> {user?.email}
        </span>
        <span>
          <Building2 size={16} /> {user?.company}
        </span>
      </div>

      <div className="agent-card-note">
        Ask about desktop app usage, web app flow, screenshots, attendance, login, reports, and
        common troubleshooting.
      </div>

      <button className="secondary-button" type="button" onClick={onLogout}>
        <LogOut size={16} /> {copy.endSession}
      </button>
    </div>
  );
}
