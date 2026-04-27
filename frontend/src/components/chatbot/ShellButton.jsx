import { useTheme } from "../../context/ThemeContext";

export default function ShellButton({ label, icon: Icon, onClick }) {
  const { isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition ${
        isDark
          ? "border-sky-900/70 bg-slate-900/90 text-sky-100 hover:border-sky-700 hover:bg-slate-800"
          : "border-sky-200 bg-white text-sky-700 hover:border-sky-300 hover:bg-sky-50"
      }`}
    >
      <Icon className="text-lg" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
