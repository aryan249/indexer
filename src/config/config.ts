import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const config = {
  RPC_URL: requireEnv("RPC_URL"),

  DATABASE_URL: requireEnv("DATABASE_URL"),

  POLL_MS: Number(process.env.POLL_MS ?? "3000"),
  CONFIRM_DEPTH: Number(process.env.CONFIRM_DEPTH ?? "3"),
};
