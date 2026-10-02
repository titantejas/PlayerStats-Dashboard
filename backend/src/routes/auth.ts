import { Router } from "express";
import bcrypt from "bcryptjs";
import { createUser, findUserByUsername } from "../store/userStore";
import { signToken } from "../middleware/auth";

const router = Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) return res.status(400).json({ error: "username and password required" });
  if (String(password).length < 6) return res.status(400).json({ error: "password must be >= 6 chars" });
  try {
    const user = await createUser(String(username), String(password));
    const token = signToken({ id: user.id, username: user.username });
    res.status(201).json({ token, user: { id: user.id, username: user.username } });
  } catch (err: any) {
    res.status(err.status ?? 400).json({ error: err.message ?? "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) return res.status(400).json({ error: "username and password required" });
  const user = await findUserByUsername(String(username));
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = signToken({ id: user.id, username: user.username });
  res.json({ token, user: { id: user.id, username: user.username } });
});

export default router;
