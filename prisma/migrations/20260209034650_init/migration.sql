-- CreateTable
CREATE TABLE "Block" (
    "number" BIGINT NOT NULL,
    "hash" TEXT NOT NULL,
    "parentHash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "txCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("number")
);

-- CreateIndex
CREATE UNIQUE INDEX "Block_hash_key" ON "Block"("hash");
