import "server-only";
import { MongoClient } from "mongodb";

declare global {
  var bookbarAuthMongo: { client: MongoClient; databaseName: string } | undefined;
}

export function getAuthDatabase() {
  if (!globalThis.bookbarAuthMongo) {
    const uri = process.env.MONGODB_URI?.trim();
    const databaseName = process.env.MONGODB_DB_NAME ?? "bookbar";
    if (!uri || !/^mongodb(?:\+srv)?:\/\/\S+$/.test(uri)) {
      throw new Error("Set MONGODB_URI privately in .env.local before using authentication storage.");
    }
    if (!/^[a-zA-Z0-9_-]{1,63}$/.test(databaseName)) {
      throw new Error("Invalid MONGODB_DB_NAME in the private environment configuration.");
    }
    try {
      globalThis.bookbarAuthMongo = {
        client: new MongoClient(uri, { appName: "BookBar Auth", maxPoolSize: 10, serverSelectionTimeoutMS: 5000 }),
        databaseName,
      };
    } catch {
      throw new Error("Invalid MongoDB connection settings. Check your private .env.local.");
    }
  }
  // Keep one pool across Next.js development reloads and warm server invocations.
  // Better Auth's adapter will manage its own collections in P03.
  return globalThis.bookbarAuthMongo.client.db(globalThis.bookbarAuthMongo.databaseName);
}
