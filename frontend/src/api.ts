export interface Player {
  id: string;
  name: string;
  team: string;
  rating: number;
  gamesPlayed: number;
  totalScore: number;
  avgScore?: number;
  wins: number;
  losses: number;
}

export interface Summary {
  totalPlayers: number;
  totalMatches: number;
  avgScore: number;
  maxScore: number;
  topTeams: { team: string; players: number; avgRating: number; totalScore: number }[];
}

const API = "";

export function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { ...(opts.headers ?? {}), ...(opts.body ? authHeaders() : (localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {})) }
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({ error: res.statusText }))).error ?? "Request failed");
  return res.json() as Promise<T>;
}
