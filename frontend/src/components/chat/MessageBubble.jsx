import { useEffect, useRef, useState } from "react";
import TypingDots from "./TypingDots";

const animatedIds = new Set();

// ─── Module-level audio context singleton ────────────────────────────────────
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (
      window.AudioContext ||
      window.webkitAudioContext
    )();
  }
  return audioCtx;
}

// ─── Notify sound ─────────────────────────────────────────────────────────────
async function playDoneSound() {
  try {
    const ac = getAudioContext();

    if (ac.state !== "running") {
      await ac.resume();
    }

    const t = ac.currentTime;

    [[880, 0], [660, 0.15]].forEach(([freq, offset]) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();

      osc.connect(gain);
      gain.connect(ac.destination);

      osc.type = "sine";

      osc.frequency.setValueAtTime(freq, t + offset);

      gain.gain.setValueAtTime(0, t + offset);
      gain.gain.linearRampToValueAtTime(0.05, t + offset + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.2);

      osc.start(t + offset);
      osc.stop(t + offset + 0.2);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });

  } catch (_) {
    // audio is optional
  }
}

export default function MessageBubble({
  msg,
  onSuggestion,
  theme,
  isNew,
  bottomRef,
}) {
  const isUser = msg.role === "user";
  const isDark = theme === "dark";
  const body = msg.text ?? msg.content ?? "";
  const isStringBody = typeof body === "string";

  const shouldAnimate =
    !isUser && isStringBody && !msg.typing && isNew && !animatedIds.has(msg.id);

  const [displayed, setDisplayed] = useState(
    shouldAnimate ? "" : isStringBody ? body : "",
  );
  const [animating, setAnimating] = useState(shouldAnimate);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!shouldAnimate) return;

    animatedIds.add(msg.id);

    const words = body.split(" ");
    const totalWords = words.length;
    const DURATION_MS = Math.min(3000, Math.max(400, totalWords * 55));
    const intervalMs = DURATION_MS / totalWords;

    let wordIndex = 0;
    let lastTime = null;
    let accumulated = 0;

    function step(timestamp) {
      if (!lastTime) lastTime = timestamp;
      accumulated += timestamp - lastTime;
      lastTime = timestamp;

      const target = Math.min(
        totalWords,
        Math.floor(accumulated / intervalMs) + 1,
      );

      if (target > wordIndex) {
        wordIndex = target;
        setDisplayed(words.slice(0, wordIndex).join(" "));
        bottomRef?.current?.scrollIntoView({ behavior: "smooth" });
      }

      if (wordIndex < totalWords) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplayed(body);
        setAnimating(false);
        bottomRef?.current?.scrollIntoView({ behavior: "smooth" });

        // ─── Play notify sound 100ms after animation completes ─────────────
        setTimeout(playDoneSound, 100);
      }
    }

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderedBody = isStringBody ? (animating ? displayed : body) : body;

  function renderText(text) {
    const paragraphs = text.split("\n\n");
    return paragraphs.map((para, pi) => (
      <span key={pi}>
        {para.split("\n").map((line, li) => (
          <span key={li}>
            {line}
            {li < para.split("\n").length - 1 && <br />}
          </span>
        ))}
        {pi < paragraphs.length - 1 && (
          <span style={{ display: "block", height: "0.85em" }} />
        )}
      </span>
    ));
  }

  return (
    <div
      className={`flex w-full gap-2.5 ${isUser ? "justify-end" : "justify-start"} mb-4`}
      style={{ animation: "msgIn 0.22s ease both" }}
    >
      {!isUser && (
        <div className="relative h-8 w-8">
          <div className="h-8 w-8 rounded-full bg-[#e6f4f7] flex items-center justify-center">
            <span className="text-[0.72rem] font-semibold text-[#1d4e61]">
              <img src="./response-icon.png" alt="" />
            </span>
          </div>
        </div>
      )}

      <div
        className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"} max-w-[78%]`}
      >
        <div
          className={
            isUser
              ? "rounded-2xl rounded-tr-sm bg-gradient-to-br from-[#1ac7bf] to-[#57d995] px-4 py-2.5 text-[#042820] font-semibold text-sm shadow-lg"
              : isDark
                ? "rounded-2xl rounded-tl-sm border border-[rgba(51,227,205,0.11)] bg-[rgba(7,26,38,0.85)] px-4 py-3 text-[#cde8f0] text-sm shadow-md"
                : "rounded-2xl rounded-tl-sm border border-[rgba(26,199,191,0.25)] bg-white px-4 py-3 text-[#103040] text-sm shadow-md"
          }
        >
          {msg.typing ? (
            <TypingDots />
          ) : isStringBody ? (
            <span style={{ lineHeight: "1.45", display: "block" }}>
              {renderText(renderedBody)}
            </span>
          ) : (
            body
          )}
        </div>

        {!isUser && !msg.typing && !animating && msg.citations?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {msg.citations.map((c, i) => (
              <span
                key={i}
                className={`rounded-full border px-2 py-0.5 text-[0.6rem] font-medium ${
                  isDark
                    ? "border-[rgba(51,227,205,0.13)] bg-[rgba(10,35,48,0.5)] text-[#4a8a94]"
                    : "border-[rgba(26,199,191,0.3)] bg-[rgba(26,199,191,0.08)] text-[#1a7a75]"
                }`}
              >
                {c.title}
              </span>
            ))}
          </div>
        )}

        {!isUser &&
          !msg.typing &&
          !animating &&
          msg.suggestions?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {msg.suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => onSuggestion(s)}
                  className={`rounded-full border px-3 py-1 text-[0.71rem] font-medium transition-all active:scale-95 ${
                    isDark
                      ? "border-[rgba(51,227,205,0.2)] bg-[rgba(10,35,48,0.65)] text-[#6dddd0] hover:border-[#33e3cd] hover:bg-[rgba(18,52,62,0.9)] hover:text-[#33e3cd]"
                      : "border-[rgba(26,199,191,0.35)] bg-[rgba(26,199,191,0.07)] text-[#1a9a92] hover:border-[#1ac7bf] hover:bg-[rgba(26,199,191,0.15)] hover:text-[#0e7a75]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 mt-0.5">
          <div
            className={`h-8 w-8 rounded-[13px] flex items-center justify-center text-[0.68rem] font-bold bg-green-300 ${
              isDark
                ? "border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.07)] text-[#8bc8d5]"
                : "border border-[rgba(26,199,191,0.3)] bg-[rgba(26,199,191,0.1)] text-[#1a7a75]"
            }`}
          >
            <img
              src="/avatar.svg"
              alt="User avatar"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}