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
      if (!panelRef.current.contains(event.target)) {
        onClosePanel();
        setActionOpen(false);
      }
    }
    setTimeout(() => {
      document.addEventListener("click", handleOutsideClick);
    }, 0);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [onClosePanel]);

  const iconButton = `flex h-9 min-w-9 items-center justify-center rounded-[12px] border transition-all duration-200 ${
    isDark
      ? "border-[rgba(80,214,123,0.2)] bg-[rgba(15,51,27,0.5)] text-[#6dce91] hover:border-[rgba(80,214,123,0.55)] hover:bg-[rgba(15,51,27,0.85)] hover:text-[#8df3a9]"
      : "border-[rgba(31,154,70,0.28)] bg-[rgba(80,214,123,0.07)] text-[#217a40] hover:border-[rgba(31,154,70,0.55)] hover:bg-[rgba(80,214,123,0.15)] hover:text-[#145c2a]"
  }`;

  const wideButton = `flex h-9 items-center gap-1.5 rounded-[12px] border px-2.5 text-[0.65rem] font-bold transition-all duration-200 ${
    isDark
      ? "border-[rgba(80,214,123,0.2)] bg-[rgba(15,51,27,0.5)] text-[#6dce91] hover:border-[rgba(80,214,123,0.55)] hover:bg-[rgba(15,51,27,0.85)] hover:text-[#8df3a9]"
      : "border-[rgba(31,154,70,0.28)] bg-[rgba(80,214,123,0.07)] text-[#217a40] hover:border-[rgba(31,154,70,0.55)] hover:bg-[rgba(80,214,123,0.15)] hover:text-[#145c2a]"
  }`;

  return (
    <header
      className={`relative flex items-center gap-3 border-b px-1 py-1 sm:px-5 sm:py-3 ${
        isDark
          ? "border-[rgba(80,214,123,0.1)] bg-[rgba(5,11,6,0.97)]"
          : "border-[rgba(31,154,70,0.18)] bg-[rgba(245,255,248,0.97)]"
      }`}
    >
      {/* ── Logo + Title + Badge ── */}
      <div className="flex flex-1 items-center gap-3 min-w-0 ">
        {/* ✅ FIXED LOGO ONLY */}
        <div className="relative flex items-center ">
          {/* Desktop Logo */}
          <img
            src="./logo.png"
            alt="logo"
            className="hidden lg:block h-5 w-auto object-contain "
          />

          {/* Mobile / Tablet Logo */}
          <div className="block lg:hidden h-8 w-8 rounded-full overflow-hidden border-2 border-[#3FB97A]">

            <img
              src="./response-icon.png"
              alt="mobile logo"
              className="block lg:hidden h-full w-full object-cover "
            />
            </div>
          

          {/* Indicator */}
          <span className="absolute -bottom-0 -right-0 h-2 w-2 rounded-full bg-green-500 border border-white"></span>
        </div>

        {/* Name + badge */}
        <div className="flex min-w-0 flex-col gap-[6px]">
          <span
            className={`truncate font-extrabold text-[1.5rem]  leading-none ${
              isDark ? "text-[#d4f0dc]" : "text-[#0f3d20]"
            }`}
          >
            Kairos
          </span>
          <span
            className={`inline-flex w-fit items-center rounded-full px-2 py-[2px] text-[0.6rem] font-black uppercase tracking-wider leading-none ${
              isDark
                ? "bg-[rgba(34,197,94,0.15)] text-[#4ade80] ring-1 ring-[rgba(34,197,94,0.25)]"
                : "bg-[rgba(34,197,94,0.12)] text-[#16a34a] ring-1 ring-[rgba(34,197,94,0.3)]"
            }`}
          >
            ⚡ZoikoTime Assistant
          </span>
        </div>
      </div>

      {/* ── Right actions ── */}
      <div
        className="relative flex items-center gap-1.5 shrink-0"
        ref={panelRef}
      >
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

        <button type="button" onClick={onToggleTheme} className={iconButton}>
          {isDark ? (
            <HiOutlineSun className="h-[17px] w-[17px]" />
          ) : (
            <HiOutlineMoon className="h-[17px] w-[17px]" />
          )}
        </button>

        {/* <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePanel("lang");
          }}
          className={`${wideButton} hidden sm:flex`}
        >
          <HiOutlineGlobeAlt className="h-[15px] w-[15px]" />
          {currentLanguage.short}
        </button> */}

        <div className="relative">
          <button
            type="button"
            onClick={() => setActionOpen((p) => !p)}
            className={wideButton}
          >
            <TiThMenu className="h-[15px] w-[15px]" />
            <span className="hidden sm:inline">MENU</span>
          </button>

          {actionOpen && (
            <div
              className={`absolute right-0 mt-2 w-44 rounded-xl border shadow-xl z-50 overflow-hidden ${
                isDark
                  ? "border-[rgba(80,214,123,0.16)] bg-[rgba(4,14,7,0.98)]"
                  : "border-[rgba(31,154,70,0.2)] bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setActionOpen(false);
                  onNewChat();
                }}
                className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-all ${
                  isDark
                    ? "text-[#b8d8c0] hover:bg-[rgba(80,214,123,0.08)] hover:text-[#e5ffea]"
                    : "text-[#1a5c32] hover:bg-[rgba(80,214,123,0.12)] hover:text-[#0f3d20]"
                }`}
              >
                <HiOutlineChatAlt2 className="h-4 w-4 shrink-0" /> New
                Conversation
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
                className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-all ${
                  isDark
                    ? "text-[#b8d8c0] hover:bg-[rgba(80,214,123,0.08)] hover:text-[#e5ffea]"
                    : "text-[#1a5c32] hover:bg-[rgba(80,214,123,0.12)] hover:text-[#0f3d20]"
                }`}
              >
                <HiOutlinePencil className="h-4 w-4 shrink-0" /> Edit Details
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionOpen(false);
                  onMailClick();
                }}
                className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-all ${
                  isDark
                    ? "text-[#b8d8c0] hover:bg-[rgba(80,214,123,0.08)] hover:text-[#e5ffea]"
                    : "text-[#1a5c32] hover:bg-[rgba(80,214,123,0.12)] hover:text-[#0f3d20]"
                }`}
              >
                <HiOutlineMail className="h-4 w-4 shrink-0" /> Mail
              </button>
            </div>
          )}
        </div>

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
