import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/useStore";
import {
  HiOutlineClock,
  HiOutlineGlobeAlt,
  HiOutlineMoon,
  HiOutlineSun,
} from "react-icons/hi2";
import {
  HiOutlinePencil,
  HiOutlineMail,
  HiOutlineChatAlt2,
} from "react-icons/hi";
import { TiThMenu } from "react-icons/ti";

import LangPanel, { LANGS } from "./LangPanel";
import HistoryPanel from "../panels/HistoryPanel";

export default function ChatHeader({
  theme,
  onToggleTheme,
  lang,
  onLangChange,
  openPanel,
  onTogglePanel,
  onClosePanel,
  sessions,
  onSelectSession,
  onNewChat,
  onMailClick,
}) {
  const isDark = theme === "dark";
  const panelRef = useRef(null);
  const [actionOpen, setActionOpen] = useState(false);

  const currentLanguage = LANGS.find((item) => item.code === lang) || LANGS[0];
  const navigate = useNavigate();
  const startEditing = useStore((s) => s.startEditing);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!panelRef.current) return;

      // ✅ ONLY close if clicked OUTSIDE
      if (!panelRef.current.contains(event.target)) {
        onClosePanel();
        setActionOpen(false);
      }
    }

    // ✅ use click (NOT mousedown)
    setTimeout(() => {
      document.addEventListener("click", handleOutsideClick);
    }, 0);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [onClosePanel]);

  const iconButton =
    "orbit-icon-button flex h-9 min-w-9 items-center justify-center rounded-[12px] border transition-all";

  const wideButton =
    "flex h-9 items-center gap-1.5 rounded-[12px] border px-2.5 text-[0.65rem] font-bold transition-all";

  const activeButton = isDark
    ? "border-[rgba(80,214,123,0.45)] bg-[rgba(15,51,27,0.9)] text-[#8df3a9]"
    : "border-[rgba(31,154,70,0.35)] bg-[rgba(80,214,123,0.14)] text-[#176d38]";

  return (
    <header
      className={`relative flex items-center gap-3 border-b px-5 py-3.5 ${
        isDark
          ? "border-[rgba(255,255,255,0.05)] bg-[rgba(5,11,6,0.96)]"
          : "border-[rgba(31,154,70,0.18)] bg-[rgba(245,255,248,0.96)]"
      }`}
    >
      {/* Title */}
      <div className="flex-1">Kioris</div>

      <div className="relative flex items-center gap-1.5" ref={panelRef}>
        {/* History */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
           

            onTogglePanel("history");
          }}
          className={iconButton}
        >
          <HiOutlineClock className="h-[17px] w-[17px]" />
        </button>

        {/* Theme */}
        <button type="button" onClick={onToggleTheme} className={iconButton}>
          {isDark ? <HiOutlineSun /> : <HiOutlineMoon />}
        </button>

        {/* Language */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePanel("lang");
          }}
          className={wideButton}
        >
          <HiOutlineGlobeAlt />
          {currentLanguage.short}
        </button>

        {/* MENU */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActionOpen((p) => !p)}
            className="flex h-10 items-center gap-2 rounded-[14px] border px-3"
          >
            <TiThMenu />
            MENU
          </button>

          {actionOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl border bg-white shadow-lg z-50">
              <button
                type="button"
                onClick={() => {
                  setActionOpen(false);
                  onNewChat();
                }}
                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-green-400/20"
              >
                <HiOutlineChatAlt2 /> New Conversation
              </button>

              <button
                type="button"
                onClick={(e) => {
                 
                  e.preventDefault();
                  e.stopPropagation();
                  setActionOpen(false);
                  startEditing();
                  navigate("/");
                }}
                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-green-400/20"
              >
                <HiOutlinePencil className="h-[16px] w-[16px]" />
                Edit Details
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionOpen(false);
                  onMailClick();
                }}
                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-green-400/20"
              >
                <HiOutlineMail /> Mail
              </button>
            </div>
          )}
        </div>
        {/* Panels */}

        {openPanel === "history" && (
          <HistoryPanel
            sessions={sessions}
            onClose={onClosePanel}
            onSelect={onSelectSession}
            onNewChat={onNewChat}
            theme={theme}
          />
        )}

        {openPanel === "lang" && (
          <LangPanel
            current={lang}
            onChange={onLangChange}
            onClose={onClosePanel}
            theme={theme}
          />
        )}
      </div>
    </header>
  );
}
