"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  clearSession,
  getUser,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  verifyOtp as apiVerifyOtp,
  type AuthUser,
} from "./auth";

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean; // true une fois la session lue côté client (évite le flash SSR)
  isAdmin: boolean;
  isCourier: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  loginOtp: (phone: string, code: string) => Promise<AuthUser>;
  register: (input: { email: string; password: string; full_name?: string; phone?: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const s = await apiLogin(email, password);
    setUser(s.user);
    return s.user;
  }, []);

  const loginOtp = useCallback(async (phone: string, code: string) => {
    const s = await apiVerifyOtp(phone, code);
    setUser(s.user);
    return s.user;
  }, []);

  const register = useCallback(
    async (input: { email: string; password: string; full_name?: string; phone?: string }) => {
      const s = await apiRegister(input);
      setUser(s.user);
      return s.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => setUser(getUser()), []);

  // Déconnexion inter-onglets
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "tchokos_auth") setUser(getUser());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        isAdmin: !!user && (user.is_staff || user.role === "admin"),
        isCourier: !!user && user.role === "courier",
        login,
        loginOtp,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}

// Petit utilitaire pour forcer le nettoyage (ex: 401 hors contexte)
export { clearSession };
