import { Router } from "express";
import { getLeaderboard } from "../store/playerStore";

const router = Router();

router.get("/", async (req, res) => {
  const limit = Math.min(parseInt(String(req.query.limit ?? "10"), 10) || 10, 100);
  res.json(await getLeaderboard(limit));
});

export default router;
