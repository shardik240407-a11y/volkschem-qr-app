import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "vchem_token";
const ADMIN_KEY = "vchem_admin";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem(ADMIN_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const logout = useCallback(() => {
    setToken("");
    setAdmin(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  }, []);

  // Verify stored token is still valid on app mount
  useEffect(() => {
    if (!token) return;

    api.get("/auth/me").catch(() => {
      // Token expired or revoked — clear session silently
      logout();
    });
  }, []); // intentionally run once on mount only

  const login = useCallback((payload) => {
    setToken(payload.token);
    setAdmin(payload.admin);
    localStorage.setItem(TOKEN_KEY, payload.token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(payload.admin));
  }, []);

  const value = useMemo(
    () => ({
      token,
      admin,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, admin, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
