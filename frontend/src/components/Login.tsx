import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export function Login() {
  const { token, username, login, register, logout } = useAuth();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  if (token) {
    return (
      <div className="card row">
        <span>Signed in as <b>{username}</b></span>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  async function go(fn: (u: string, p: string) => Promise<void>) {
    setErr("");
    try { await fn(u, p); } catch (e: any) { setErr(e.message); }
  }

  return (
    <div className="card">
      <h2>Login / Register</h2>
      <div className="row">
        <input placeholder="username" value={u} onChange={(e) => setU(e.target.value)} />
        <input placeholder="password" type="password" value={p} onChange={(e) => setP(e.target.value)} />
        <button onClick={() => go(login)}>Login</button>
        <button onClick={() => go(register)}>Register</button>
      </div>
      {err && <p className="error">{err}</p>}
    </div>
  );
}
