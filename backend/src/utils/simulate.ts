/** Load simulator: 500 concurrent Socket.io clients + REST stat submits. */
import { io, Socket } from "socket.io-client";

const URL = process.env.API_URL ?? "http://localhost:4000";
const N = parseInt(process.env.USERS ?? "500", 10);

async function loginToken(): Promise<{ token: string; playerId: string }> {
  const base = URL;
  const username = `sim_${Date.now()}`;
  await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password: "password123" })
  });
  const login = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password: "password123" })
  }).then((r) => r.json());
  const players = await fetch(`${base}/api/players?limit=5`).then((r) => r.json());
  return { token: login.token, playerId: players[0]?.id };
}

async function main() {
  console.log(`Simulating ${N} concurrent users against ${URL} ...`);
  const { token, playerId } = await loginToken();
  if (!playerId) throw new Error("No players seeded");

  const sockets: Socket[] = [];
  let updates = 0;
  for (let i = 0; i < N; i++) {
    const s = io(URL);
    s.on("leaderboard:update", () => { updates++; });
    sockets.push(s);
  }
  await new Promise((r) => setTimeout(r, 2000));

  // Each simulated user submits one stat (burst).
  const start = Date.now();
  await Promise.all(
    sockets.map(() =>
      fetch(`${URL}/api/stats/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ playerId, score: 50 + Math.floor(Math.random() * 120) })
      }).catch(() => undefined)
    )
  );
  const elapsed = Date.now() - start;
  await new Promise((r) => setTimeout(r, 2000));
  console.log(`Done: ${N} submits in ${elapsed}ms, received ${updates} leaderboard pushes.`);
  sockets.forEach((s) => s.disconnect());
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
