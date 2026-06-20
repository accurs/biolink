import type { LanyardData } from "./types";

export const CURRENT_TTL = 2;
export const LAST_TTL = 60 * 60 * 24 * 7;

export const WORKER_POLL_INTERVAL = 10 * 1000;
export const CLIENT_POLL_INTERVAL = 2 * 1000;

export const getRedisKeys = (userId: string) => ({
  current: `presence:current:${userId}`,
  spotify: `presence:spotify:${userId}`,
  game: `presence:game:${userId}`,
});

export const ACTIVITY_TYPES = {
  PLAYING: 0,
  STREAMING: 1,
  LISTENING: 2,
  WATCHING: 3,
  CUSTOM: 4,
  COMPETING: 5,
} as const;

export const statusTextMap: Record<LanyardData["discord_status"], string> = {
  online: "online",
  idle: "idle",
  dnd: "dnd",
  offline: "offline",
};

export const statusDotMap: Record<LanyardData["discord_status"], string> = {
  online: "bg-[#23a55a]",
  idle: "bg-[#f0b232]",
  dnd: "bg-[#f23f43]",
  offline: "bg-[#80848e]",
};

export const LANYARD_API_BASE = "https://api.lanyard.rest/v1";
