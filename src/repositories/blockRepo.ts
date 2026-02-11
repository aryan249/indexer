import { PrismaClient } from "@prisma/client";

async function getLastIndexedBlock(db: PrismaClient): Promise<number> {
  const last = await db.block.findFirst({
    orderBy: { number: "desc" },
  });
  return last ? Number(last.number) : 0;
}

async function upsertBlock(b: {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: Date;
  txCount: number;
}, db: PrismaClient) {
  await db.block.upsert({
    where: { number: BigInt(b.number) },
    update: {
      hash: b.hash,
      parentHash: b.parentHash,
      timestamp: b.timestamp,
      txCount: b.txCount,
    },
    create: {
      number: BigInt(b.number),
      hash: b.hash,
      parentHash: b.parentHash,
      timestamp: b.timestamp,
      txCount: b.txCount,
    },
  });
}

export const blockRepo = {
    getLastIndexedBlock,
    upsertBlock

}