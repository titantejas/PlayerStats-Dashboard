import mongoose from "mongoose";
import { Player } from "../models/Player";
import { Stat } from "../models/Stat";
import { isDbConnected } from "../config/db";

export interface PlayerDto {
  id: string;
  name: string;
  team: string;
  rating: number;
  gamesPlayed: number;
  totalScore: number;
  wins: number;
  losses: number;
  avgScore?: number;
}

export interface StatDto {
  id: string;
  playerId: string;
  score: number;
  kills: number;
  deaths: number;
  assists: number;
  createdAt: string;
}

const players = new Map<string, PlayerDto>();
const stats: StatDto[] = [];
let seq = 1;

const TEAMS = ["Sentinels", "Phantoms", "Vortex", "Titans", "Free Agents"];
const NAMES = ["Nova","Blaze","Viper","Ghost","Falcon","Rogue","Pixel","Storm","Echo","Onyx","Drift","Cipher"];

export function resetMemoryStore() {
  players.clear();
  stats.length = 0;
  seq = 1;
  seedMemory();
}

export function seedMemory() {
  if (players.size > 0) return;
  for (let i = 0; i < 12; i++) {
    const id = String(seq++);
    const totalScore = 500 + Math.floor(Math.random() * 2000);
    const gamesPlayed = 5 + Math.floor(Math.random() * 20);
    players.set(id, {
      id,
      name: `${NAMES[i % NAMES.length]}-${i + 1}`,
      team: TEAMS[i % TEAMS.length],
      rating: 900 + Math.floor(Math.random() * 600),
      gamesPlayed,
      totalScore,
      wins: Math.floor(gamesPlayed / 2),
      losses: Math.ceil(gamesPlayed / 2),
      avgScore: Math.round(totalScore / gamesPlayed)
    });
  }
}

function toDto(p: any): PlayerDto {
  return {
    id: String(p._id ?? p.id),
    name: p.name,
    team: p.team,
    rating: p.rating,
    gamesPlayed: p.gamesPlayed,
    totalScore: p.totalScore,
    wins: p.wins,
    losses: p.losses,
    avgScore: p.gamesPlayed ? Math.round(p.totalScore / p.gamesPlayed) : 0
  };
}

export async function listPlayers(sort = "rating", order: "asc" | "desc" = "desc", limit = 50): Promise<PlayerDto[]> {
  if (isDbConnected()) {
    const dir = order === "asc" ? 1 : -1;
    const allowed = ["rating", "totalScore", "gamesPlayed", "name"];
    const key = allowed.includes(sort) ? sort : "rating";
    const docs = await Player.find().sort({ [key]: dir }).limit(Math.min(limit, 100));
    return docs.map(toDto);
  }
  seedMemory();
  const arr = [...players.values()];
  arr.sort((a, b) => {
    const av = (a as any)[sort] ?? a.rating;
    const bv = (b as any)[sort] ?? b.rating;
    if (typeof av === "string") return order === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    return order === "asc" ? av - bv : bv - av;
  });
  return arr.slice(0, Math.min(limit, 100));
}

export async function createPlayer(name: string, team = "Free Agents"): Promise<PlayerDto> {
  if (isDbConnected()) {
    const doc = await Player.create({ name, team });
    return toDto(doc);
  }
  seedMemory();
  const id = String(seq++);
  const p: PlayerDto = { id, name, team, rating: 1000, gamesPlayed: 0, totalScore: 0, wins: 0, losses: 0, avgScore: 0 };
  players.set(id, p);
  return p;
}

export async function getPlayer(id: string): Promise<PlayerDto | null> {
  if (isDbConnected()) {
    if (!mongoose.isValidObjectId(id)) return null;
    const doc = await Player.findById(id);
    return doc ? toDto(doc) : null;
  }
  seedMemory();
  return players.get(id) ?? null;
}

export async function getLeaderboard(limit = 10): Promise<PlayerDto[]> {
  if (isDbConnected()) {
    // Covered by { rating: -1 } index.
    const docs = await Player.find().sort({ rating: -1 }).limit(Math.min(limit, 100));
    return docs.map(toDto);
  }
  seedMemory();
  return [...players.values()].sort((a, b) => b.rating - a.rating).slice(0, Math.min(limit, 100));
}

export async function submitStat(playerId: string, s: { score: number; kills?: number; deaths?: number; assists?: number }): Promise<StatDto> {
  const { score, kills = 0, deaths = 0, assists = 0 } = s;
  if (isDbConnected()) {
    if (!mongoose.isValidObjectId(playerId)) throw Object.assign(new Error("Player not found"), { status: 404 });
    const player = await Player.findById(playerId);
    if (!player) throw Object.assign(new Error("Player not found"), { status: 404 });
    const stat = await Stat.create({ playerId: player._id, score, kills, deaths, assists });
    // Simple Elo-ish update: rating += (score - avg)/50, win if score >= 100.
    player.gamesPlayed += 1;
    player.totalScore += score;
    player.rating = Math.max(100, Math.round(player.rating + (score - 100) / 20));
    if (score >= 100) player.wins += 1; else player.losses += 1;
    await player.save();
    return { id: stat.id, playerId: String(player._id), score, kills, deaths, assists, createdAt: stat.createdAt.toISOString() };
  }
  seedMemory();
  const p = players.get(playerId);
  if (!p) throw Object.assign(new Error("Player not found"), { status: 404 });
  p.gamesPlayed += 1;
  p.totalScore += score;
  p.rating = Math.max(100, Math.round(p.rating + (score - 100) / 20));
  if (score >= 100) p.wins += 1; else p.losses += 1;
  p.avgScore = Math.round(p.totalScore / p.gamesPlayed);
  const dto: StatDto = { id: `s${Date.now()}${stats.length}`, playerId, score, kills, deaths, assists, createdAt: new Date().toISOString() };
  stats.push(dto);
  return dto;
}

export async function getSummary() {
  if (isDbConnected()) {
    const [counts, agg] = await Promise.all([
      Player.countDocuments(),
      Stat.aggregate([
        { $group: { _id: null, matches: { $sum: 1 }, avgScore: { $avg: "$score" }, maxScore: { $max: "$score" } } }
      ])
    ]);
    const topTeams = await Player.aggregate([
      { $group: { _id: "$team", players: { $sum: 1 }, avgRating: { $avg: "$rating" }, totalScore: { $sum: "$totalScore" } } },
      { $sort: { avgRating: -1 } },
      { $limit: 5 }
    ]);
    const a = agg[0] ?? { matches: 0, avgScore: 0, maxScore: 0 };
    return {
      totalPlayers: counts,
      totalMatches: a.matches,
      avgScore: Math.round(a.avgScore ?? 0),
      maxScore: a.maxScore ?? 0,
      topTeams: topTeams.map((t) => ({ team: t._id, players: t.players, avgRating: Math.round(t.avgRating), totalScore: t.totalScore }))
    };
  }
  seedMemory();
  const arr = [...players.values()];
  const totalScore = arr.reduce((n, p) => n + p.totalScore, 0);
  const byTeam = new Map<string, { players: number; ratingSum: number; totalScore: number }>();
  for (const p of arr) {
    const t = byTeam.get(p.team) ?? { players: 0, ratingSum: 0, totalScore: 0 };
    t.players += 1; t.ratingSum += p.rating; t.totalScore += p.totalScore;
    byTeam.set(p.team, t);
  }
  return {
    totalPlayers: arr.length,
    totalMatches: stats.length + arr.reduce((n, p) => n + p.gamesPlayed, 0),
    avgScore: arr.length ? Math.round(totalScore / arr.reduce((n, p) => n + Math.max(p.gamesPlayed, 1), 0)) : 0,
    maxScore: arr.reduce((m, p) => Math.max(m, p.avgScore ?? 0), 0),
    topTeams: [...byTeam.entries()]
      .map(([team, v]) => ({ team, players: v.players, avgRating: Math.round(v.ratingSum / v.players), totalScore: v.totalScore }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5)
  };
}
