import type { RedisOptions } from "ioredis";

export function redisOptionsFromUrl(url: string, extras: RedisOptions = {}): RedisOptions {
  const parsed = new URL(url);
  const dbPath = parsed.pathname.replace(/^\//, "");
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    db: dbPath ? Number(dbPath) : undefined,
    tls: parsed.protocol === "rediss:" ? {} : undefined,
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    ...extras,
  };
}
