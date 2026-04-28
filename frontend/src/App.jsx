import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import OnboardingPage from "./pages/OnboardingPage";
import ChatPage from "./pages/ChatPage";
import { useStore } from "./store/useStore";

function ProtectedRoute({ children }) {
  const user = useStore((state) => state.user);
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  const hydrateSession = useStore((state) => state.hydrateSession);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  return (
    <Routes>
      <Route path="/" element={<OnboardingPage />} />
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
