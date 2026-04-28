import { useTheme } from "../../context/ThemeContext";

export default function QuickActionPill({ label, icon: Icon }) {
  const { isDark } = useTheme();

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
        isDark
          ? "border-sky-900/60 bg-[#07263a] text-sky-100 hover:border-sky-700 hover:bg-[#0a314a]"
          : "border-sky-200 bg-white text-sky-700 hover:border-sky-300 hover:bg-sky-50"
      }`}
    >
      <Icon className={`text-base ${isDark ? "text-cyan-300" : "text-sky-500"}`} />
      {label}
    </button>
  );
}
