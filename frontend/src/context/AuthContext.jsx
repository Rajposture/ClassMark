import { createContext, useState, useEffect, useCallback } from "react";
import API_BASE from "../config/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUserState(null);
      setLoading(false);
      return null;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setUserState(null);
        localStorage.removeItem("token");
        return null;
      }

      const data = await res.json();
      setUserState(data.user);
      return data.user;
    } catch {
      setUserState(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        return data;
      }

      localStorage.setItem("token", data.token);
      setUserState(data.user);
      setLoading(false);
      return data;
    } catch {
      setLoading(false);
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUserState(null);
    setLoading(false);
  };

  return (
  <AuthContext.Provider
    value={{
      user,
      loading,
      login,
      logout,
      refreshUser: fetchUser,
      setUser: setUserState
    }}
  >
    {children}
  </AuthContext.Provider>
);
};
