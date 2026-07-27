import Redis from "ioredis";
import { redisOptionsFromUrl } from "./redis-options";

declare global {
  var _redis: Redis | undefined;
}

function createClient(): Redis {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL environment variable is not set");
  return new Redis(redisOptionsFromUrl(url));
}

function getRedis(): Redis {
  if (!globalThis._redis) {
    globalThis._redis = createClient();
  }
  return globalThis._redis;
}

const redis = new Proxy({} as Redis, {
  get(_target, prop, receiver) {
    const client = getRedis();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default redis;
