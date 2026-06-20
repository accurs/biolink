import { NextResponse } from "next/server";
import redis from "@/app/lib/redis";
import { LYRICS_TTL, getLyricsKey } from "@/app/lib/presence/constants";
import { fetchLyricsFromLrcLib } from "@/app/lib/presence/lyrics";
import type { StoredLyrics } from "@/app/lib/presence/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const trackId = searchParams.get("trackId");
  const track = searchParams.get("track");
  const artist = searchParams.get("artist");

  if (!trackId && (!track || !artist)) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  try {
    if (trackId) {
      const cached = await redis.get(getLyricsKey(trackId));
      if (cached) {
        const parsed = JSON.parse(cached) as StoredLyrics;
        return NextResponse.json({
          syncedLyrics: parsed.syncedLyrics,
          plainLyrics: parsed.plainLyrics,
        });
      }
    }

    if (!track || !artist) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const data = await fetchLyricsFromLrcLib(track, artist);
    if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });

    if (trackId) {
      const payload: StoredLyrics = {
        trackId,
        track,
        artist,
        syncedLyrics: data.syncedLyrics,
        plainLyrics: data.plainLyrics,
        fetchedAt: Date.now(),
      };
      await redis.set(getLyricsKey(trackId), JSON.stringify(payload), "EX", LYRICS_TTL);
    }

    return NextResponse.json({
      syncedLyrics: data.syncedLyrics,
      plainLyrics: data.plainLyrics,
    });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
