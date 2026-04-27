export default function HeaderAction({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-lg text-sky-50 transition hover:bg-white/14"
    >
      {children}
    </button>
  );
}
