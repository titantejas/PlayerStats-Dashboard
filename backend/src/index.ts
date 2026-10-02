import dotenv from "dotenv";
import http from "http";
import { createApp } from "./app";
import { connectDb } from "./config/db";
import { initSocket } from "./socket";

dotenv.config();

const PORT = parseInt(process.env.PORT ?? "4000", 10);

async function main() {
  await connectDb();
  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API + WS listening on http://localhost:${PORT}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
