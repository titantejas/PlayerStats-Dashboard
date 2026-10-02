import mongoose, { Document, Schema } from "mongoose";

export interface IStat extends Document {
  playerId: mongoose.Types.ObjectId;
  score: number;
  kills: number;
  deaths: number;
  assists: number;
  createdAt: Date;
}

const StatSchema = new Schema<IStat>({
  playerId: { type: Schema.Types.ObjectId, ref: "Player", required: true, index: true },
  score: { type: Number, required: true },
  kills: { type: Number, default: 0 },
  deaths: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true }
});

// Hot-path indexes for leaderboard + history queries.
StatSchema.index({ playerId: 1, createdAt: -1 });
StatSchema.index({ score: -1 });
StatSchema.index({ createdAt: -1 });

export const Stat = mongoose.model<IStat>("Stat", StatSchema);
