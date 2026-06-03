import React, { useEffect, useState } from "react";
import { clearSession, getStoredSession, storeSession, apiRequest } from "./lib/api";
import { PageFrame } from "./components/layout/PageFrame";
import { Header } from "./components/layout/Header";
import { StatusMessage } from "./components/ui/StatusMessage";
import { AuthView } from "./pages/AuthView";
import { CreatorDashboard } from "./pages/CreatorDashboard";
import { PromoterDashboard } from "./pages/PromoterDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";

function App() {
  const [session, setSession] = useState(() => getStoredSession());
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loadingUser, setLoadingUser] = useState(Boolean(getStoredSession()));

  const token = session?.token;
  const user = session?.user;

  const setAuthenticatedSession = (nextSession) => {
    storeSession(nextSession);
    setSession(nextSession);
  };

  const refreshUser = async () => {
    if (!token) return;

    const payload = await apiRequest("/auth/me", { token });
    const nextSession = { token, user: payload.user };

    storeSession(nextSession);
    setSession(nextSession);
  };

  useEffect(() => {
    if (!token) {
      setLoadingUser(false);
      return;
    }

    const query = new URLSearchParams(window.location.search);

    if (query.get("youtube") === "connected") {
      setNotice("YouTube account connected. Submissions are now enabled.");
      window.history.replaceState({}, "", window.location.pathname);
    }

    refreshUser()
      .catch((refreshError) => {
        clearSession();
        setSession(null);
        setError(refreshError.message);
      })
      .finally(() => setLoadingUser(false));
  }, []);

  const signOut = () => {
    clearSession();
    setSession(null);
    setNotice("");
    setError("");
  };

  if (loadingUser) {
    return <PageFrame>Loading workspace...</PageFrame>;
  }

  if (!user || !token) {
    return (
      <AuthView
        error={error}
        setError={setError}
        setNotice={setNotice}
        setSession={setAuthenticatedSession}
      />
    );
  }

  return (
    <PageFrame>
      <Header user={user} onSignOut={signOut} />
      <main className="mx-auto w-full max-w-7xl px-6 py-6">
        <StatusMessage message={notice} tone="success" />
        <StatusMessage message={error} tone="error" />
        {user.role === "creator" && (
          <CreatorDashboard token={token} onError={setError} onNotice={setNotice} />
        )}
        {user.role === "promoter" && (
          <PromoterDashboard
            token={token}
            user={user}
            onError={setError}
            onNotice={setNotice}
            refreshUser={refreshUser}
          />
        )}
        {user.role === "admin" && <AdminDashboard token={token} onError={setError} />}
      </main>
    </PageFrame>
  );
}

export default App;
