import OrbitShell from "../components/OrbitShell";
import { ThemeProvider } from "../context/ThemeContext";

export default function HomePage() {
  return (
    <ThemeProvider>
      <OrbitShell />
    </ThemeProvider>
  );
}
