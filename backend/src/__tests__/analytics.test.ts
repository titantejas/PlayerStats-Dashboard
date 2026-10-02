import request from "supertest";
import { createApp } from "../app";
import { resetMemoryStore as resetPlayers } from "../store/playerStore";
import { resetMemoryStore as resetUsers } from "../store/userStore";

const app = createApp();

beforeEach(() => {
  resetUsers();
  resetPlayers();
});

describe("analytics + health", () => {
  it("returns summary shape", async () => {
    const r = await request(app).get("/api/analytics/summary");
    expect(r.status).toBe(200);
    expect(r.body).toHaveProperty("totalPlayers");
    expect(r.body).toHaveProperty("topTeams");
    expect(Array.isArray(r.body.topTeams)).toBe(true);
  });

  it("health + 404", async () => {
    expect((await request(app).get("/health")).status).toBe(200);
    expect((await request(app).get("/nope")).status).toBe(404);
  });
});
