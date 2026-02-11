import { db } from "./clients/pgClient";
import { startBlockProducer } from "./producers/blockProducer";

async function main() {
  await startBlockProducer(db);
}

async function shutdown(signal: string) {
  console.log(`Received ${signal}. Shutting down...`);
  await db.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

main().catch(async (err) => {
  console.error("Fatal error in block producer:", err);
  await shutdown("fatal");
});
