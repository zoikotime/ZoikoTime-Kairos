import { HiOutlineCheck, HiOutlineXMark } from "react-icons/hi2";

export const LANGS = [
  { code: "en", short: "EN", label: "English" },
  { code: "hi", short: "HI", label: "Hindi" },
  { code: "es", short: "ES", label: "Spanish" },
  { code: "fr", short: "FR", label: "French" },
  { code: "de", short: "DE", label: "German" },
];

export default function LangPanel({ current, onChange, onClose, theme }) {
  const isDark = theme === "dark";

  return (
    <div
      className={`absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border shadow-2xl ${
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
          Language
        </span>
        <button
          onClick={onClose}
          className={`orbit-icon-button h-7 w-7 rounded-[10px] flex items-center justify-center border transition-all ${
            isDark
              ? "border-[rgba(255,255,255,0.07)] text-[#7ecf9a] hover:border-[rgba(80,214,123,0.4)] hover:bg-[rgba(15,51,27,0.8)]"
              : "border-[rgba(31,154,70,0.2)] text-[#2d8a4e] hover:border-[rgba(31,154,70,0.45)] hover:bg-[rgba(80,214,123,0.1)]"
          }`}
        >
          <HiOutlineXMark className="h-4 w-4 hover:text-red-500" />
        </button>
      </div>
      <div className="p-2">
        {LANGS.map((language) => (
          <button
            key={language.code}
            onClick={() => {
              onChange(language.code);
              onClose();
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
              isDark
                ? "text-[#b8d8c0] hover:bg-[rgba(80,214,123,0.06)] hover:text-[#e5ffea]"
                : "text-[#29613b] hover:bg-[rgba(80,214,123,0.08)] hover:text-[#134f28]"
            }`}
          >
            <span
              className={`rounded-md px-2 py-1 text-[0.68rem] font-black tracking-wide ${
                isDark
                  ? "bg-[rgba(80,214,123,0.12)] text-[#8df3a9]"
                  : "bg-[rgba(80,214,123,0.14)] text-[#18733a]"
              }`}
            >
              {language.short}
            </span>
            <span>{language.label}</span>
            {current === language.code ? (
              <HiOutlineCheck className="ml-auto h-3.5 w-3.5 text-[#44d66f]" />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
