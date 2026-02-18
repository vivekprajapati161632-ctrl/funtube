import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("funtube_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("funtube_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [isGuest, setIsGuest] = useState(localStorage.getItem("funtube_guest") === "true");
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const loadMe = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
        localStorage.setItem("funtube_user", JSON.stringify(data.user));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadMe();
  }, [token]);

  const login = (authPayload) => {
    setToken(authPayload.token);
    setUser(authPayload.user);
    setIsGuest(false);
    localStorage.setItem("funtube_token", authPayload.token);
    localStorage.setItem("funtube_user", JSON.stringify(authPayload.user));
    localStorage.removeItem("funtube_guest");
  };

  const skipLogin = () => {
    setToken(null);
    setUser({ username: "Guest" });
    setIsGuest(true);
    localStorage.removeItem("funtube_token");
    localStorage.setItem("funtube_user", JSON.stringify({ username: "Guest" }));
    localStorage.setItem("funtube_guest", "true");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem("funtube_token");
    localStorage.removeItem("funtube_user");
    localStorage.removeItem("funtube_guest");
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isGuest,
      loading,
      isAuthenticated: Boolean(token),
      login,
      skipLogin,
      logout
    }),
    [token, user, isGuest, loading]
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
