import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listPlayers, createPlayer, getPlayer } from "../store/playerStore";

const router = Router();

router.get("/", async (req, res) => {
  const sort = String(req.query.sort ?? "rating");
  const order = req.query.order === "asc" ? "asc" : "desc";
  const limit = Math.min(parseInt(String(req.query.limit ?? "50"), 10) || 50, 100);
  res.json(await listPlayers(sort, order, limit));
});

router.get("/:id", async (req, res) => {
  const p = await getPlayer(req.params.id);
  if (!p) return res.status(404).json({ error: "Player not found" });
  res.json(p);
});

router.post("/", requireAuth, async (req, res) => {
  const { name, team } = req.body ?? {};
  if (!name) return res.status(400).json({ error: "name required" });
  res.status(201).json(await createPlayer(String(name), team ? String(team) : "Free Agents"));
});

export default router;
