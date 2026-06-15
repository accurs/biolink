import type { LanyardData, LanyardActivity } from "./types";
import { ACTIVITY_TYPES } from "./constants";

export function formatMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getDiscordAvatarUrl(user: LanyardData["discord_user"]): string {
  if (user.avatar) {
    const ext = user.avatar.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
  }

  let fallbackIndex = 0;

  try {
    const snowflake = BigInt(user.id);
    fallbackIndex = Number((snowflake >> BigInt(22)) % BigInt(6));
  } catch {
    fallbackIndex = 0;
  }

  return `https://cdn.discordapp.com/embed/avatars/${fallbackIndex}.png`;
}

export function findGameActivity(activities: LanyardActivity[]): LanyardActivity | undefined {
  return activities.find((activity) => activity.type === ACTIVITY_TYPES.PLAYING);
}

export function getGameStatusText(game: { name: string; details?: string; state?: string }): string {
  if (game.details) {
    return `${game.name}: ${game.details}`;
  }
  if (game.state) {
    return `${game.name}: ${game.state}`;
  }
  return game.name;
}

export function getActivitySummary(data: LanyardData): string {
  if (data.listening_to_spotify && data.spotify) {
    return `${data.spotify.song} by ${data.spotify.artist}`;
  }

  const active = data.activities.find(
    (activity) => activity.type !== ACTIVITY_TYPES.CUSTOM && activity.type !== ACTIVITY_TYPES.LISTENING
  );

  if (active?.details) {
    return `${active.name}: ${active.details}`;
  }

  if (active?.name) {
    return `${active.name}`;
  }

  return "no active session";
}

export function getPlatformEmojis(data: LanyardData): string {
  const platforms = [];
  if (data.active_on_discord_mobile) platforms.push("📱");
  if (data.active_on_discord_desktop) platforms.push("🖥️");
  if (data.active_on_discord_web) platforms.push("🌐");
  return platforms.length > 0 ? ` [${platforms.join(" ")}]` : "";
}
