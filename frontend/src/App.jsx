import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import OnboardingPage from "./pages/OnboardingPage";
import ChatPage from "./pages/ChatPage";
import { useStore } from "./store/useStore";

// ✅ FIXED ProtectedRoute
function ProtectedRoute({ children }) {
  const user = useStore((state) => state.user);
  const hydrated = useStore((state) => state.hydrated);

  // ⛔ Wait until session is loaded
  if (!hydrated) return null; // or loader

  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  const hydrateSession = useStore((state) => state.hydrateSession);
  const hydrated = useStore((state) => state.hydrated);
  const user = useStore((state) => state.user);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  // ⛔ Block rendering until hydration completes
  if (!hydrated) {
    return null; // or loading screen
  }

  return (
    <Routes>
      {/* ✅ Auto redirect if already logged in */}
      <Route
        path="/"
        element={user ? <Navigate to="/chat" replace /> : <OnboardingPage />}
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}