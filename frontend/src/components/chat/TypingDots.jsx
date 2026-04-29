export default function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{ animationDelay: `${i * 0.18}s` }}
          className="h-1.5 w-1.5 rounded-full bg-[#33e3cd] opacity-80 animate-bounce"
        />
      ))}
    </div>
  );
}