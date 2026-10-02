import React, { createContext, useContext, useState } from "react";

interface AuthCtx {
  token: string | null;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>(null as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem("username"));

  async function auth(path: string, username: string, password: string) {
    const res = await fetch(`/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Auth failed");
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.user.username);
    setToken(data.token);
    setUsername(data.user.username);
  }

  return (
    <Ctx.Provider
      value={{
        token,
        username,
        login: (u, p) => auth("login", u, p),
        register: (u, p) => auth("register", u, p),
        logout: () => {
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          setToken(null);
          setUsername(null);
        }
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
