"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import type { LanyardData, StoredSpotify, StoredGame, PresenceResponse } from "@/app/lib/presence/types";
import { FiSmartphone, FiMonitor, FiGlobe } from "react-icons/fi";
import { CLIENT_POLL_INTERVAL, statusDotMap } from "@/app/lib/presence/constants";
import { formatMs, timeAgo, getDiscordAvatarUrl, getGameStatusText, findGameActivity } from "@/app/lib/presence/utils";
import SpotifyLyrics from "./SpotifyLyrics";

export default function LanyardStatus({ userId }: { userId: string }) {
  const [status, setStatus] = useState<LanyardData | null>(null);
  const [lastSpotify, setLastSpotify] = useState<StoredSpotify | null>(null);
  const [lastGame, setLastGame] = useState<StoredGame | null>(null);
  const [, setTick] = useState(0);
  const [spotifyProgress, setSpotifyProgress] = useState<number | null>(null);
  const [spotifyTimes, setSpotifyTimes] = useState<{ elapsed: string; total: string } | null>(null);
  const prevStatusRef = useRef<LanyardData["discord_status"] | null>(null);

  const calcSpotifyProgress = useCallback((s: typeof status) => {
    if (!s?.listening_to_spotify || !s.spotify?.timestamps) {
      setSpotifyProgress(null);
      setSpotifyTimes(null);
      return;
    }
    const { start, end } = s.spotify.timestamps;
    const now = Date.now();
    const pct = Math.min(1, Math.max(0, (now - start) / (end - start)));
    setSpotifyProgress(pct);
    setSpotifyTimes({ elapsed: formatMs(now - start), total: formatMs(end - start) });
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/presence/${userId}`, { cache: "no-store" });
        if (!res.ok) return;

        const payload = (await res.json()) as PresenceResponse;
        if (!mounted) return;

        setStatus(payload.current);
        if (payload.lastSpotify) setLastSpotify(payload.lastSpotify);
        if (payload.lastGame) setLastGame(payload.lastGame);
      } catch {
      }
    };

    fetchStatus();
    const id = window.setInterval(fetchStatus, CLIENT_POLL_INTERVAL);

    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, [userId]);

  useEffect(() => {
    if (!status) return;
    const prev = prevStatusRef.current;
    prevStatusRef.current = status.discord_status;
  }, [status]);

  useEffect(() => {
    if (status?.discord_status !== "offline") return;
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, [status?.discord_status]);

  useEffect(() => {
    const shouldTick = (lastSpotify && !status?.listening_to_spotify) || 
                       (lastGame && !status?.activities.find(a => a.type === 0));
    if (!shouldTick) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, [lastSpotify, lastGame, status?.listening_to_spotify, status?.activities]);

  useEffect(() => {
    calcSpotifyProgress(status);
    if (!status?.listening_to_spotify || !status.spotify?.timestamps) return;
    const id = window.setInterval(() => calcSpotifyProgress(status), 1_000);
    return () => window.clearInterval(id);
  }, [status, calcSpotifyProgress]);

  const currentGame = useMemo(() => {
    if (!status) return null;
    const game = findGameActivity(status.activities);
    if (!game) return null;
    return { name: game.name, details: game.details, state: game.state };
  }, [status]);

  const gameToDisplay = currentGame || lastGame;
  
  const gameStatusText = useMemo(() => {
    if (!gameToDisplay) return null;
    const text = getGameStatusText(gameToDisplay);
    const isOffline = status?.discord_status === "offline";
    if (!currentGame && lastGame && !isOffline) {
      return `${timeAgo(lastGame.seenAt)} - ${text}`;
    }
    return text;
  }, [gameToDisplay, currentGame, lastGame, status?.discord_status]);

  const currentSpotifyData = status?.listening_to_spotify ? status.spotify : null;
  const spotifyToDisplay = currentSpotifyData || lastSpotify;
  
  const spotifyText = useMemo(() => {
    if (!spotifyToDisplay) return null;
    const text = `${spotifyToDisplay.song} by ${spotifyToDisplay.artist}`;
    const isOffline = status?.discord_status === "offline";
    if (!currentSpotifyData && lastSpotify && !isOffline) {
      return `${timeAgo(lastSpotify.seenAt)} - ${text}`;
    }
    return text;
  }, [spotifyToDisplay, currentSpotifyData, lastSpotify, status?.discord_status]);

  const displayName = status?.discord_user.global_name || status?.discord_user.username || "discord";
  const dotClass = status ? statusDotMap[status.discord_status] : "bg-zinc-500";
  const avatarUrl = status
    ? getDiscordAvatarUrl(status.discord_user)
    : "https://cdn.discordapp.com/embed/avatars/0.png";
  const avatarDecorationUrl = status?.discord_user.avatar_decoration_data
    ? `https://cdn.discordapp.com/avatar-decoration-presets/${status.discord_user.avatar_decoration_data.asset}.png?size=128`
    : null;
  const nameplateUrl = status?.discord_user.collectibles?.nameplate
    ? `https://cdn.discordapp.com/assets/collectibles/${status.discord_user.collectibles.nameplate.asset}static.png`
    : null;

  const activePlatforms = useMemo(() => {
    if (!status) return [];
    const platforms = [];
    if (status.active_on_discord_mobile) platforms.push({ icon: FiSmartphone, name: "Mobile" });
    if (status.active_on_discord_desktop) platforms.push({ icon: FiMonitor, name: "Desktop" });
    if (status.active_on_discord_web) platforms.push({ icon: FiGlobe, name: "Web" });
    return platforms;
  }, [status]);

  const isOffline = status?.discord_status === "offline";
  
  const lastSeenLabel = useMemo(() => {
    if (!isOffline) return null;
    const timestamps = [lastGame?.seenAt, lastSpotify?.seenAt].filter((t): t is number => t !== undefined);
    if (timestamps.length === 0) return null;
    const mostRecent = Math.max(...timestamps);
    return `last seen ${timeAgo(mostRecent)}`;
  }, [isOffline, lastGame, lastSpotify]);

  const spotifyAlbumArt = spotifyToDisplay?.album_art_url ?? null;
  const spotifyTrackId = spotifyToDisplay?.track_id ?? null;
  const isSpotifyCurrent = currentSpotifyData !== null;
  const spotifyInlineArtwork = spotifyAlbumArt ? (
    spotifyTrackId ? (
      <a
        href={`https://open.spotify.com/track/${spotifyTrackId}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-4 w-4 flex-shrink-0 overflow-hidden rounded border border-white/15 align-middle"
      >
        <img
          src={spotifyAlbumArt}
          alt=""
          className="h-full w-full object-cover opacity-90"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </a>
    ) : (
      <span className="inline-flex h-4 w-4 flex-shrink-0 overflow-hidden rounded border border-white/15 align-middle">
        <img
          src={spotifyAlbumArt}
          alt=""
          className="h-full w-full object-cover opacity-90"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </span>
    )
  ) : null;

  return (
    <>
      <SpotifyLyrics
        track={currentSpotifyData?.song ?? null}
        artist={currentSpotifyData?.artist ?? null}
        timestamps={currentSpotifyData?.timestamps ?? null}
        isPlaying={status?.listening_to_spotify ?? false}
      />
      <section className="fade-in-up delay-1 glass-card relative px-5 py-4 overflow-hidden">
      {nameplateUrl && (
        <img
          src={nameplateUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      )}
      <div className="relative flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative h-11 w-11 flex-shrink-0">
            <div className="h-full w-full rounded-full bg-white/10 overflow-hidden">
              <img
                src={avatarUrl}
                alt={`${displayName} avatar`}
                className="h-full w-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            {avatarDecorationUrl && (
              <img
                src={avatarDecorationUrl}
                alt=""
                className="absolute -inset-1.5 h-[calc(100%+12px)] w-[calc(100%+12px)] object-contain pointer-events-none"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            )}
            <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border border-[#0f0f0f] ${dotClass}`} />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-zinc-100 truncate">{displayName}</p>
            {activePlatforms.length > 0 && (
              <div className="flex items-center gap-1">
                {activePlatforms.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <Icon
                      key={platform.name}
                      className="text-zinc-400 cursor-default"
                      size={14}
                      title={platform.name}
                    />
                  );
                })}
              </div>
            )}
          </div>
          {isOffline && lastSeenLabel ? (
            <>
              <p className="text-xs text-zinc-500 truncate">{lastSeenLabel}</p>
              {gameStatusText && (
                <p className="text-xs text-zinc-400 truncate">{gameStatusText}</p>
              )}
              {spotifyText && (
                <p className="text-xs text-zinc-400 truncate inline-flex items-center gap-1.5">
                  {spotifyInlineArtwork}
                  <span className="truncate">{spotifyText}</span>
                </p>
              )}
            </>
          ) : (
            <>
              {gameStatusText && (
                <p className="text-xs text-zinc-400 truncate">{gameStatusText}</p>
              )}
              {spotifyText && (
                <p className="text-xs text-zinc-400 truncate inline-flex items-center gap-1.5">
                  {spotifyInlineArtwork}
                  <span className="truncate">{spotifyText}</span>
                </p>
              )}
            </>
          )}
          {isSpotifyCurrent && spotifyProgress !== null && spotifyTimes && (
            <div className="space-y-0.5">
              <div className="h-0.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-none"
                  style={{ width: `${spotifyProgress * 100}%` }}
                />
              </div>
              <div className="flex justify-between" style={{ fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
                <span className="text-[10px] text-zinc-500">{spotifyTimes.elapsed}</span>
                <span className="text-[10px] text-zinc-500">{spotifyTimes.total}</span>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </section>
    </>
  );
}
