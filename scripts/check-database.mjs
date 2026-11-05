import { getAuthDatabase } from "../src/lib/database.ts";

try {
  if (!process.env.MONGODB_URI?.trim()) {
    console.error("BLOCKED_MANUAL: set MONGODB_URI in the private client .env.local (MANUAL-MONGO-01).");
    process.exitCode = 2;
  } else {
    await getAuthDatabase().command({ ping: 1 });
    console.log("PASS: Next.js authentication database is reachable.");
  }
} catch {
  console.error("FAIL: authentication database check failed. Verify private settings, Atlas user, and network access.");
  process.exitCode = 1;
} finally {
  await globalThis.bookbarAuthMongo?.client.close().catch(() => undefined);
  globalThis.bookbarAuthMongo = undefined;
}
