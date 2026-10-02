import request from "supertest";
import { createApp } from "../app";
import { resetMemoryStore as resetPlayers } from "../store/playerStore";
import { resetMemoryStore as resetUsers } from "../store/userStore";

const app = createApp();

beforeEach(() => {
  resetUsers();
  resetPlayers();
});

describe("auth", () => {
  it("registers and logs in", async () => {
    const reg = await request(app).post("/api/auth/register").send({ username: "alice", password: "password123" });
    expect(reg.status).toBe(201);
    expect(reg.body.token).toBeDefined();

    const login = await request(app).post("/api/auth/login").send({ username: "alice", password: "password123" });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeDefined();
  });

  it("rejects bad credentials + validation", async () => {
    await request(app).post("/api/auth/register").send({ username: "bob", password: "password123" });
    const bad = await request(app).post("/api/auth/login").send({ username: "bob", password: "wrong" });
    expect(bad.status).toBe(401);
    const short = await request(app).post("/api/auth/register").send({ username: "x", password: "123" });
    expect(short.status).toBe(400);
  });
});
