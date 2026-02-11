module.exports = {
  apps: [
    {
      name: "block-producer",
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        RPC_URL: "https://eth-mainnet.g.alchemy.com/v2/fcQ0M89-I1l_7atN9YcKz",
        DATABASE_URL: "postgres://postgres:postgres@localhost:5432/indexer?schema=public",
        KAFKA_BROKERS: "localhost:9092",
        KAFKA_CLIENT_ID: "block-indexer",
        KAFKA_BLOCKS_TOPIC: "blocks.raw",
        KAFKA_BLOCKS_GROUP_ID: "block-consumers",
        POLL_MS: "1000",
        CONFIRM_DEPTH: "3",
      },
    },
    {
      name: "block-consumer",
      script: "dist/consumers/blockConsumer.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        DATABASE_URL: "postgres://postgres:postgres@localhost:5432/indexer?schema=public",
        KAFKA_BROKERS: "localhost:9092",
        KAFKA_CLIENT_ID: "block-indexer",
        KAFKA_BLOCKS_TOPIC: "blocks.raw",
        KAFKA_BLOCKS_GROUP_ID: "block-consumers",
      },
    },
  ],
};