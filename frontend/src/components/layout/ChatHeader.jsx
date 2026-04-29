import { useEffect, useRef, useState } from "react";
import {
  HiOutlineClock,
  HiOutlineGlobeAlt,
  HiOutlineMoon,
  HiOutlinePlusCircle,
  HiOutlineSun,
} from "react-icons/hi2";
import {
  HiOutlineDotsVertical,
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

  useEffect(() => {
    function handleOutsideClick(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClosePanel();
        setActionOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
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
      className={`relative flex flex-shrink-0 items-center gap-3 border-b px-5 py-3.5 ${
        isDark
          ? "border-[rgba(255,255,255,0.05)] bg-[rgba(5,11,6,0.96)]"
          : "border-[rgba(31,154,70,0.18)] bg-[rgba(245,255,248,0.96)]"
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="orbit-avatar-shell h-9 w-9 rounded-[14px]">
          <div className="orbit-avatar flex h-8 w-8 items-center justify-center rounded-[11px]">
            <span className="orbit-avatar-z text-[0.74rem] font-black text-[#1d4e61]">
              K
            </span>
            <span className="orbit-avatar-node" />
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`text-[0.96rem] font-black tracking-tight ${
              isDark ? "text-[#dff7e4]" : "text-[#11371f]"
            }`}
          >
            Kioris
          </span>
          <span className="rounded-full border border-[rgba(80,214,123,0.22)] bg-[rgba(80,214,123,0.09)] px-2 py-0.5 text-[0.56rem] font-black uppercase tracking-widest text-[#44d66f]">
            AI
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-[#57d275]" />
          <span
            className={`text-[0.63rem] ${
              isDark ? "text-[#6d8f77]" : "text-[#5d8e6a]"
            }`}
          >
            ZoikoTime Assistant · Online
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="relative flex items-center gap-1.5" ref={panelRef}>
        {/* New Chat */}

        {/* History */}
        <button
          onClick={() => onTogglePanel("history")}
          title="Chat history"
          className={`${iconButton} ${
            openPanel === "history"
              ? activeButton
              : isDark
                ? "border-[rgba(80,214,123,0.14)] text-[#8dc89f] hover:border-[rgba(80,214,123,0.28)]"
                : "border-[rgba(31,154,70,0.15)] text-[#356b47] hover:border-[rgba(31,154,70,0.3)]"
          }`}
        >
          <HiOutlineClock className="h-[17px] w-[17px]" />
        </button>

        {/* Theme */}
        <button
          onClick={onToggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className={`${iconButton} ${
            isDark
              ? "border-[rgba(80,214,123,0.14)] text-[#f8da71] hover:border-[rgba(80,214,123,0.28)]"
              : "border-[rgba(31,154,70,0.15)] text-[#356b47] hover:border-[rgba(31,154,70,0.3)]"
          }`}
        >
          {isDark ? (
            <HiOutlineSun className="h-[17px] w-[17px]" />
          ) : (
            <HiOutlineMoon className="h-[17px] w-[17px]" />
          )}
        </button>

        {/* Language */}
        <button
          onClick={() => onTogglePanel("lang")}
          title="Change language"
          className={`${wideButton} ${
            openPanel === "lang"
              ? activeButton
              : isDark
                ? "border-[rgba(80,214,123,0.14)] text-[#8dc89f] hover:border-[rgba(80,214,123,0.28)]"
                : "border-[rgba(31,154,70,0.15)] text-[#356b47] hover:border-[rgba(31,154,70,0.3)]"
          }`}
        >
          <HiOutlineGlobeAlt className="h-[17px] w-[17px]" />
          <span className="hidden sm:inline">{currentLanguage.short}</span>
        </button>

        {/* ✅ NEW ACTION BUTTON */}
        <div className="relative">
          <button
            onClick={() => setActionOpen(!actionOpen)}
            title="Actions"
            className={`flex h-10 items-center gap-2 rounded-[14px] border px-3 text-[0.7rem] font-bold transition-all ${
              isDark
                ? "border-[rgba(80,214,123,0.2)] text-[#8df3a9] hover:border-[rgba(80,214,123,0.4)] hover:bg-[rgba(15,51,27,0.8)]"
                : "border-[rgba(31,154,70,0.22)] text-[#176d38] hover:border-[rgba(31,154,70,0.42)] hover:bg-[rgba(80,214,123,0.12)]"
            }`}
          >
            <TiThMenu className="h-[18px] w-[18px]" />
            <span className="hidden sm:inline">MENU</span>
          </button>

          {actionOpen && (
            <div
              className={`absolute right-0 mt-2 w-44 rounded-xl border shadow-lg z-50 ${
                isDark
                  ? "bg-[#0f1f17] border-[rgba(80,214,123,0.2)]"
                  : "bg-white border-[rgba(31,154,70,0.2)]"
              }`}
            >
              <button
                onClick={onNewChat}
                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-green-400/20"
              >
                <HiOutlineChatAlt2 className="h-[16px] w-[16px]" />
                New Conversation
              </button>

              <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-green-400/20">
                <HiOutlinePencil className="h-[16px] w-[16px]" />
                Edit
              </button>

              <button
                onClick={() => {
                  setActionOpen(false);
                  onMailClick(); // ✅ trigger
                }}
                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-green-400/20"
              >
                <HiOutlineMail className="h-[16px] w-[16px]" />
                Mail
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
