import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { getLeaderboard } from "./store/playerStore";

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL ?? "http://localhost:5173", methods: ["GET", "POST"] }
  });

  io.on("connection", async (socket) => {
    // Send current board immediately so new clients sync.
    socket.emit("leaderboard:update", await getLeaderboard(10));
  });

  return io;
}

export function getIO(): Server | null {
  return io;
}
