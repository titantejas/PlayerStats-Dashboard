import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { submitStat, getLeaderboard } from "../store/playerStore";
import { getIO } from "../socket";

const router = Router();

router.post("/submit", requireAuth, async (req, res) => {
  const { playerId, score, kills, deaths, assists } = req.body ?? {};
  if (!playerId || typeof score !== "number" || Number.isNaN(score)) {
    return res.status(400).json({ error: "playerId and numeric score required" });
  }
  try {
    const stat = await submitStat(String(playerId), { score, kills, deaths, assists });
    const board = await getLeaderboard(10);
    getIO()?.emit("stats:new", stat);
    getIO()?.emit("leaderboard:update", board);
    res.status(201).json(stat);
  } catch (err: any) {
    res.status(err.status ?? 400).json({ error: err.message ?? "Submit failed" });
  }
});

export default router;
