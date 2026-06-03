import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

const STORAGE_KEY = "creatorreach_auth";
const AuthContext = createContext(null);

const readStoredSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { token: "", user: null };
  } catch {
    return { token: "", user: null };
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStoredSession().token || "");
  const [user, setUser] = useState(() => readStoredSession().user || null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
  }, [token, user]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let active = true;

    apiRequest("/auth/me", { token })
      .then((data) => {
        if (!active) return;
        setUser(data.user);
      })
      .catch(() => {
        if (!active) return;
        setToken("");
        setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const value = {
    token,
    user,
    loading,
    login(session) {
      setToken(session.token);
      setUser(session.user);
      setLoading(false);
    },
    logout() {
      setToken("");
      setUser(null);
      setLoading(false);
    },
    updateUser(nextUser) {
      setUser(nextUser);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
