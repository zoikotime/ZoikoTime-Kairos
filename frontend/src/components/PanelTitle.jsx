export default function PanelTitle({ eyebrow, title, description, isDark }) {
  return (
    <div>
      <p className={`text-[11px] font-bold uppercase tracking-[0.24em] ${isDark ? "text-cyan-400" : "text-sky-700"}`}>{eyebrow}</p>
      <h2 className={`mt-2 text-xl font-bold sm:text-2xl ${isDark ? "text-white" : "text-slate-950"}`}>{title}</h2>
      {description ? <p className={`mt-2 text-sm leading-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{description}</p> : null}
    </div>
  );
}
