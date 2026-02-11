import { PrismaClient } from "@prisma/client";
import { provider } from "../clients/rpcClient";
import { config } from "../config/config";
import { blockRepo } from "../repositories/blockRepo";
import { createBlockProducer } from "../clients/kafkaClient";

type BlockMessage = {
  number: number;
  hash: string;
  parentHash: string;
  timestampMs: number;
  txCount: number;
};

export async function startBlockProducer(db: PrismaClient) {
  const producer = createBlockProducer();
  await producer.connect();

  let lastIndexed = await blockRepo.getLastIndexedBlock(db);

  // Main polling loop
  while (true) {
    try {
      const latestBlockNumber = await provider.getBlockNumber();
      const safeBlockNumber = latestBlockNumber - config.CONFIRM_DEPTH;

      if (safeBlockNumber <= lastIndexed) {
        await sleep(config.POLL_MS);
        continue;
      }

      console.log(
        `Producing block messages ${lastIndexed + 1} -> ${safeBlockNumber}`
      );

      for (
        let currentBlockNumber = lastIndexed + 1;
        currentBlockNumber <= safeBlockNumber;
        currentBlockNumber++
      ) {
        const block = await provider.getBlock(currentBlockNumber);
        if (!block?.hash) continue;

        const payload: BlockMessage = {
          number: block.number,
          hash: block.hash,
          parentHash: block.parentHash,
          timestampMs: Number(block.timestamp) * 1000,
          txCount: block.transactions.length,
        };

        await producer.send({
          topic: config.KAFKA_BLOCKS_TOPIC,
          messages: [
            {
              key: block.number.toString(),
              value: JSON.stringify(payload),
            },
          ],
        });

        lastIndexed = currentBlockNumber;
      }
    } catch (err) {
      console.error("Block producer error:", err);
      // Brief pause before retrying to avoid tight error loops
      await sleep(config.POLL_MS);
    }

    await sleep(config.POLL_MS);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
