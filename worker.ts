import Redis from "ioredis";
import type { LanyardData } from "./app/lib/presence/types";
import type { StoredLyrics } from "./app/lib/presence/types";
import { LYRICS_TTL, WORKER_POLL_INTERVAL, getLyricsKey } from "./app/lib/presence/constants";
import { fetchLyricsFromLrcLib } from "./app/lib/presence/lyrics";
import { fetchLanyardData, storePresenceData } from "./app/lib/presence/service";
import { findGameActivity, getPlatformEmojis } from "./app/lib/presence/utils";

const REDIS_URL = process.env.REDIS_URL;
const USER_ID = process.env.DISCORD_USER_ID;

if (!REDIS_URL) {
  console.error("REDIS_URL environment variable is required");
  process.exit(1);
}

if (!USER_ID) {
  console.error("DISCORD_USER_ID environment variable is required");
  process.exit(1);
}

const userId: string = USER_ID;
const redisUrl: string = REDIS_URL;

const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
});

let lastLyricsTrackId: string | null = null;

async function prefetchLyrics(current: LanyardData) {
  if (!current.listening_to_spotify || !current.spotify?.track_id) {
    lastLyricsTrackId = null;
    return;
  }

  const trackId = current.spotify.track_id;
  if (trackId === lastLyricsTrackId) return;
  lastLyricsTrackId = trackId;

  const cacheKey = getLyricsKey(trackId);
  const cached = await redis.get(cacheKey);
  if (cached) return;

  const lyrics = await fetchLyricsFromLrcLib(current.spotify.song, current.spotify.artist);
  if (!lyrics) return;

  const payload: StoredLyrics = {
    trackId,
    track: current.spotify.song,
    artist: current.spotify.artist,
    syncedLyrics: lyrics.syncedLyrics,
    plainLyrics: lyrics.plainLyrics,
    fetchedAt: Date.now(),
  };

  await redis.set(cacheKey, JSON.stringify(payload), "EX", LYRICS_TTL);
  console.log(`[${new Date().toISOString()}] Cached lyrics: ${current.spotify.song} by ${current.spotify.artist}`);
}

async function updatePresence() {
  try {
    const current = await fetchLanyardData(userId);

    if (!current) {
      console.error("No data from Lanyard API");
      return;
    }

    await storePresenceData(redis, userId, current);
    await prefetchLyrics(current);

    const platformInfo = getPlatformEmojis(current);
    const game = findGameActivity(current.activities);

    if (current.listening_to_spotify && current.spotify) {
      console.log(`[${new Date().toISOString()}] Updated: 🎵 ${current.spotify.song} by ${current.spotify.artist}${platformInfo}`);
    } else if (game) {
      console.log(`[${new Date().toISOString()}] Updated: 🎮 ${game.name}${platformInfo}`);
    } else {
      console.log(`[${new Date().toISOString()}] Updated: ${current.discord_status}${platformInfo}`);
    }
  } catch (error) {
    console.error("Error updating presence:", error);
  }
}

async function main() {
  console.log("Connecting to Redis...");
  await redis.connect();
  console.log("Connected to Redis");
  console.log(`Starting presence worker for user ${userId}`);
  console.log(`Polling every ${WORKER_POLL_INTERVAL / 1000} seconds\n`);

  await updatePresence();

  setInterval(updatePresence, WORKER_POLL_INTERVAL);
}

process.on("SIGINT", async () => {
  console.log("\nShutting down worker...");
  await redis.quit();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nShutting down worker...");
  await redis.quit();
  process.exit(0);
});

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
