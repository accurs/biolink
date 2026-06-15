import Redis from "ioredis";

declare global {
  var _redis: Redis | undefined;
}

function createClient(): Redis {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL environment variable is not set");
  return new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 2 });
}

const redis: Redis = globalThis._redis ?? createClient();
if (process.env.NODE_ENV !== "production") globalThis._redis = redis;

export default redis;
