import { Router } from "express";
import { getSummary } from "../store/playerStore";

const router = Router();

router.get("/summary", async (_req, res) => {
  res.json(await getSummary());
});

export default router;
