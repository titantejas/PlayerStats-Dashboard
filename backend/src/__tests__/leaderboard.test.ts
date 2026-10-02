import request from "supertest";
import { createApp } from "../app";
import { resetMemoryStore as resetPlayers } from "../store/playerStore";
import { resetMemoryStore as resetUsers } from "../store/userStore";

const app = createApp();

async function token(): Promise<string> {
  await request(app).post("/api/auth/register").send({ username: "t", password: "password123" });
  const r = await request(app).post("/api/auth/login").send({ username: "t", password: "password123" });
  return r.body.token;
}

beforeEach(() => {
  resetUsers();
  resetPlayers();
});

describe("players + leaderboard + stats", () => {
  it("lists players and leaderboard sorted desc", async () => {
    const list = await request(app).get("/api/players?limit=5");
    expect(list.status).toBe(200);
    expect(list.body.length).toBeGreaterThan(0);

    const board = await request(app).get("/api/leaderboard?limit=5");
    expect(board.status).toBe(200);
    const ratings = board.body.map((p: any) => p.rating);
    expect([...ratings].sort((a, b) => b - a)).toEqual(ratings);
  });

  it("requires auth to create player and submit stat; submit reorders board", async () => {
    const noAuth = await request(app).post("/api/players").send({ name: "Nope" });
    expect(noAuth.status).toBe(401);

    const tok = await token();
    const created = await request(app).post("/api/players").set("Authorization", `Bearer ${tok}`).send({ name: "TestPro", team: "Titans" });
    expect(created.status).toBe(201);

    const sub = await request(app).post("/api/stats/submit").set("Authorization", `Bearer ${tok}`).send({ playerId: created.body.id, score: 200, kills: 10 });
    expect(sub.status).toBe(201);

    const bad = await request(app).post("/api/stats/submit").set("Authorization", `Bearer ${tok}`).send({ playerId: "missing", score: 10 });
    expect(bad.status).toBe(404);
  });
});
