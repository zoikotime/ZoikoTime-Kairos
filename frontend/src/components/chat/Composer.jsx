import { useRef } from "react";
import { HiOutlinePaperAirplane, HiOutlineTrash } from "react-icons/hi2";

export default function Composer({ input, setInput, isTyping, onSend, onClear, theme }) {
  const textareaRef = useRef(null);
  const isDark = theme === "dark";

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div
      className={`flex-shrink-0 border-t px-4 py-3.5 sm:px-5 sm:py-4 ${
        isDark ? "border-[rgba(255,255,255,0.05)]" : "border-[rgba(31,154,70,0.16)]"
      }`}
    >
      <div
        className={`flex items-end gap-2.5 rounded-[18px] border px-4 py-3 transition-colors duration-200 ${
          isDark
            ? "border-[rgba(42,106,55,0.75)] bg-[rgba(5,18,8,0.96)] focus-within:border-[rgba(80,214,123,0.35)]"
            : "border-[rgba(31,154,70,0.26)] bg-white focus-within:border-[rgba(31,154,70,0.55)] shadow-sm"
        }`}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            event.target.style.height = "auto";
            event.target.style.height = `${Math.min(event.target.scrollHeight, 130)}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask Kioris anything about ZoikoTime..."
          rows={1}
          disabled={isTyping}
          className={`flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none disabled:opacity-50 ${
            isDark ? "text-[#e5ffe9] placeholder-[#6c8d73]" : "text-[#12341c] placeholder-[#6e9978]"
          }`}
          style={{ maxHeight: "130px", minHeight: "22px" }}
        />

        <button
          onClick={onClear}
          title="Clear chat"
          className={`orbit-icon-button mb-0.5 h-8 w-8 flex-shrink-0 rounded-[11px] ${
            isDark
              ? "text-[#8edaa1] hover:bg-[rgba(80,214,123,0.08)]"
              : "text-[#1a7a38] hover:bg-[rgba(80,214,123,0.12)]"
          }`}
        >
          <HiOutlineTrash className="h-4 w-4 hover:text-red-500" />
        </button>

        <button
          onClick={onSend}
          disabled={!input.trim() || isTyping}
          title="Send"
          className="orbit-send-button mb-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[11px] transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <HiOutlinePaperAirplane className="h-4 w-4 text-[#042820]" />
        </button>
      </div>

      <p className={`mt-2 select-none text-center text-[0.58rem] tracking-wide ${isDark ? "text-[#587060]" : "text-[#78a285]"}`}>
        Kioris · ZoikoTime AI · Source-grounded · Governed responses
      </p>
    </div>
  );
}
