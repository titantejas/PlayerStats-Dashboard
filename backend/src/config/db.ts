import mongoose from "mongoose";

let connected = false;

export function isDbConnected(): boolean {
  return connected && mongoose.connection.readyState === 1;
}

export async function connectDb(uri?: string): Promise<boolean> {
  const mongoUri = uri ?? process.env.MONGO_URI ?? "";
  if (!mongoUri) {
    connected = false;
    return false; // memory fallback mode
  }
  try {
    await mongoose.connect(mongoUri);
    connected = true;
    // eslint-disable-next-line no-console
    console.log("MongoDB connected");
    return true;
  } catch (err) {
    connected = false;
    console.error("MongoDB connection failed, using in-memory store:", (err as Error).message);
    return false;
  }
}
