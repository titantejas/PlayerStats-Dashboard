import { useEffect, useState } from "react";
import { api, Player } from "../api";
import { getSocket } from "../socket";

export function Leaderboard() {
  const [board, setBoard] = useState<Player[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Player[]>("/api/leaderboard?limit=10").then(setBoard).catch((e) => setError(e.message));
    const s = getSocket();
    const handler = (b: Player[]) => setBoard(b);
    s.on("leaderboard:update", handler);
    return () => { s.off("leaderboard:update", handler); };
  }, []);

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="card">
      <h2>Live Leaderboard <span className="live">● LIVE</span></h2>
      <table>
        <thead><tr><th>#</th><th>Player</th><th>Team</th><th>Rating</th><th>Games</th><th>Avg</th></tr></thead>
        <tbody>
          {board.map((p, i) => (
            <tr key={p.id} className={i < 3 ? "top" : ""}>
              <td>{i + 1}</td><td>{p.name}</td><td>{p.team}</td>
              <td>{p.rating}</td><td>{p.gamesPlayed}</td><td>{p.avgScore ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
