import { createContext, useState, useEffect, useCallback } from "react";
import API_BASE from "../config/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        setUserState(null);
        return null;
      }

      const data = await res.json();
      setUserState(data);
      return data;
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

  const login = async () => {
    return await fetchUser();
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    setUserState(null);
    setLoading(false);
  };

  const setUser = (data) => {
    setUserState(data);
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
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
