import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { isDbConnected } from "../config/db";

export interface StoredUser {
  id: string;
  username: string;
  passwordHash: string;
}

// In-memory fallback (used when MONGO_URI is unset, e.g. local MVP / tests).
const users = new Map<string, StoredUser>();
let seq = 1;

export function resetMemoryStore() {
  users.clear();
  seq = 1;
}

export async function findUserByUsername(username: string): Promise<StoredUser | null> {
  if (isDbConnected()) {
    const u = await User.findOne({ username });
    return u ? { id: u.id, username: u.username, passwordHash: u.passwordHash } : null;
  }
  return users.get(username) ?? null;
}

export async function createUser(username: string, password: string): Promise<StoredUser> {
  const passwordHash = await bcrypt.hash(password, 10);
  if (isDbConnected()) {
    const u = await User.create({ username, passwordHash });
    return { id: u.id, username: u.username, passwordHash: u.passwordHash };
  }
  if (users.has(username)) throw Object.assign(new Error("Username taken"), { status: 409 });
  const user: StoredUser = { id: String(seq++), username, passwordHash };
  users.set(username, user);
  return user;
}
