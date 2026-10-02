import { useEffect, useState } from "react";
import { api, authHeaders, Player } from "../api";
import { useAuth } from "../auth/AuthContext";

export function SubmitStat({ onDone }: { onDone: () => void }) {
  const { token } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [score, setScore] = useState(120);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api<Player[]>("/api/players?limit=20").then((p) => {
      setPlayers(p);
      if (p[0]) setPlayerId(p[0].id);
    }).catch(() => undefined);
  }, []);

  if (!token) return null;

  async function submit() {
    setMsg("");
    const res = await fetch("/api/stats/submit", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ playerId, score: Number(score), kills: 5, deaths: 2, assists: 3 })
    });
    const data = await res.json();
    setMsg(res.ok ? `Submitted score ${data.score}` : data.error);
    if (res.ok) onDone();
  }

  return (
    <div className="card">
      <h2>Submit match stat</h2>
      <div className="row">
        <select value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
          {players.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.team})</option>)}
        </select>
        <input type="number" value={score} onChange={(e) => setScore(Number(e.target.value))} />
        <button onClick={submit}>Submit</button>
      </div>
      {msg && <p>{msg}</p>}
    </div>
  );
}
