import { PrismaClient } from "@prisma/client";
import { provider } from "../clients/rpcClient";
import { config } from "../config/config";
import { blockRepo } from "../repositories/blockRepo";

export async function startIndexer(db: PrismaClient) {
  let lastIndexed = await blockRepo.getLastIndexedBlock(db); 

  while (true) {
    try {
      const head = await provider.getBlockNumber();
      const safe = head - config.CONFIRM_DEPTH;

      if (safe <= lastIndexed) {
        await sleep(config.POLL_MS);
        continue;
      }

      console.log(`Indexing blocks ${lastIndexed + 1} -> ${safe}`);

      for (let n = lastIndexed + 1; n <= safe; n++) {
        const block = await provider.getBlock(n);
        if (!block?.hash) continue;

        await blockRepo.upsertBlock(
          {
            number: block.number,
            hash: block.hash,
            parentHash: block.parentHash,
            timestamp: new Date(block.timestamp * 1000),
            txCount: block.transactions.length,
          },
          db
        );

        lastIndexed = n; 
      }
    } catch (err) {
      console.error("Indexer error:", err);
      
    }

    await sleep(config.POLL_MS);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
