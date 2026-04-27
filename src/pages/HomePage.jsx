import OrbitShell from "../components/OrbitShell";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

function HomePageLayout() {
  useTheme();

  return (
    <div className="min-h-screen bg-[#030e1a] text-slate-100">
      <OrbitShell />
    </div>
  );
}

export default function HomePage() {
  return (
    <ThemeProvider>
      <HomePageLayout />
    </ThemeProvider>
  );
}
