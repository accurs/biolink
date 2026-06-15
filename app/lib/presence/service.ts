import type { LanyardData, StoredSpotify, StoredGame } from "./types";
import { LANYARD_API_BASE, CURRENT_TTL, LAST_TTL, getRedisKeys } from "./constants";
import { findGameActivity } from "./utils";
import type Redis from "ioredis";

export type LanyardResponse = { success: boolean; data?: LanyardData };

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchLanyardData(
  userId: string, 
  maxRetries: number = 3
): Promise<LanyardData | null> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(`${LANYARD_API_BASE}/users/${userId}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        if (res.status >= 500 && attempt < maxRetries - 1) {
          lastError = new Error(`Lanyard API error: ${res.status}`);
          const backoffMs = Math.min(1000 * Math.pow(2, attempt), 5000);
          await sleep(backoffMs);
          continue;
        }
        throw new Error(`Lanyard API error: ${res.status}`);
      }

      const payload = (await res.json()) as LanyardResponse;

      if (!payload.success || !payload.data) {
        throw new Error("Invalid Lanyard response");
      }

      return payload.data;
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw lastError || error;
      }
      lastError = error as Error;
      const backoffMs = Math.min(1000 * Math.pow(2, attempt), 5000);
      await sleep(backoffMs);
    }
  }
  
  throw lastError || new Error("Failed to fetch Lanyard data");
}

export async function storePresenceData(
  redis: Redis,
  userId: string,
  current: LanyardData
): Promise<{ lastSpotify: StoredSpotify | null; lastGame: StoredGame | null }> {
  const keys = getRedisKeys(userId);

  await redis.set(keys.current, JSON.stringify(current), "EX", CURRENT_TTL);

  let lastSpotify: StoredSpotify | null = null;
  let lastGame: StoredGame | null = null;

  if (current.listening_to_spotify && current.spotify) {
    lastSpotify = {
      song: current.spotify.song,
      artist: current.spotify.artist,
      album_art_url: current.spotify.album_art_url,
      track_id: current.spotify.track_id,
      seenAt: Date.now(),
    };
    await redis.set(keys.spotify, JSON.stringify(lastSpotify), "EX", LAST_TTL);
  }

  const game = findGameActivity(current.activities);
  if (game && current.discord_status !== "offline") {
    lastGame = {
      name: game.name,
      details: game.details,
      state: game.state,
      seenAt: Date.now(),
    };
    await redis.set(keys.game, JSON.stringify(lastGame), "EX", LAST_TTL);
  }

  return { lastSpotify, lastGame };
}

export async function getCachedPresenceData(
  redis: Redis,
  userId: string
): Promise<{
  current: LanyardData | null;
  lastSpotify: StoredSpotify | null;
  lastGame: StoredGame | null;
}> {
  const keys = getRedisKeys(userId);

  const [cachedCurrent, cachedSpotify, cachedGame] = await Promise.all([
    redis.get(keys.current),
    redis.get(keys.spotify),
    redis.get(keys.game),
  ]);

  return {
    current: cachedCurrent ? (JSON.parse(cachedCurrent) as LanyardData) : null,
    lastSpotify: cachedSpotify ? (JSON.parse(cachedSpotify) as StoredSpotify) : null,
    lastGame: cachedGame ? (JSON.parse(cachedGame) as StoredGame) : null,
  };
}
