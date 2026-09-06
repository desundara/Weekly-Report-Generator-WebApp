import { createContext, useContext, useState, ReactNode } from "react";
import { api } from "lib/api";

type Role = "TEAM_MEMBER" | "MANAGER";
type User = { id: string; name: string; email: string; role: Role };
type AuthState = { token: string | null; user: User | null };

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "sisenco_auth";

function loadStoredAuth(): AuthState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { token: null, user: null };
  try {
    return JSON.parse(raw);
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadStoredAuth);

  function persist(next: AuthState) {
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  async function login(email: string, password: string) {
    const data = await api("/api/auth/login", { method: "POST", body: { email, password } });
    persist({ token: data.token, user: data.user });
  }

  async function register(name: string, email: string, password: string) {
    const data = await api("/api/auth/register", { method: "POST", body: { name, email, password } });
    persist({ token: data.token, user: data.user });
  }

  function logout() {
    persist({ token: null, user: null });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
