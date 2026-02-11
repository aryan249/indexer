import { db } from "../clients/pgClient";
import { config } from "../config/config";
import { blockRepo } from "../repositories/blockRepo";
import { createBlockConsumer } from "../clients/kafkaClient";

type BlockMessage = {
  number: number;
  hash: string;
  parentHash: string;
  timestampMs: number;
  txCount: number;
};

async function runBlockConsumer() {
  const groupId =
    process.env.KAFKA_BLOCKS_GROUP_ID ?? "block-consumers";

  const consumer = createBlockConsumer(groupId);

  await consumer.connect();
  await consumer.subscribe({
    topic: config.KAFKA_BLOCKS_TOPIC,
    fromBeginning: false,
  });

  console.log(
    `Block consumer started. Group: ${groupId}, topic: ${config.KAFKA_BLOCKS_TOPIC}`
  );

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      const decoded: BlockMessage = JSON.parse(
        message.value.toString()
      );

      await blockRepo.upsertBlock(
        {
          number: decoded.number,
          hash: decoded.hash,
          parentHash: decoded.parentHash,
          timestamp: new Date(decoded.timestampMs),
          txCount: decoded.txCount,
        },
        db
      );
    },
  });

  const shutdown = async (signal: string) => {
    console.log(`Block consumer received ${signal}, shutting down...`);
    await consumer.disconnect();
    await db.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

runBlockConsumer().catch(async (err) => {
  console.error("Block consumer fatal error:", err);
  await db.$disconnect();
  process.exit(1);
});
