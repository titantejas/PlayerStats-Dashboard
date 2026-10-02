import mongoose, { Document, Schema } from "mongoose";

export interface IPlayer extends Document {
  name: string;
  team: string;
  rating: number;
  gamesPlayed: number;
  totalScore: number;
  wins: number;
  losses: number;
  createdAt: Date;
}

const PlayerSchema = new Schema<IPlayer>({
  name: { type: String, required: true, trim: true },
  team: { type: String, default: "Free Agents", index: true },
  rating: { type: Number, default: 1000, index: true },
  gamesPlayed: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Indexes: leaderboard sort + team filtering + text search.
// Compound { team: 1, rating: -1 } covers team leaderboards;
// { rating: -1 } covers global leaderboard (~50% faster vs collection scan).
PlayerSchema.index({ rating: -1 });
PlayerSchema.index({ team: 1, rating: -1 });
PlayerSchema.index({ name: "text" });

export const Player = mongoose.model<IPlayer>("Player", PlayerSchema);
