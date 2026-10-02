import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import playerRoutes from "./routes/players";
import leaderboardRoutes from "./routes/leaderboard";
import analyticsRoutes from "./routes/analytics";
import statsRoutes from "./routes/stats";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/players", playerRoutes);
  app.use("/api/leaderboard", leaderboardRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/stats", statsRoutes);

  // 404 + error handler
  app.use((_req, res) => res.status(404).json({ error: "Not found" }));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(err.status ?? 500).json({ error: err.message ?? "Server error" });
  });

  return app;
}
