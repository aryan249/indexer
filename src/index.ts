import { startIndexer } from "./indexer/indexer";
import { db } from "./clients/pgClient";

async function main() {
  console.log("Starting block indexer...");
  await startIndexer(db);
}

async function shutdown(signal: string) {
  console.log(`Received ${signal}. Shutting down...`);
  await db.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

main().catch(async (err) => {
  console.error("Fatal error:", err);
  await shutdown("fatal");
});
