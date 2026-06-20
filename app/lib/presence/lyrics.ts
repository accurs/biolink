export type LyricsPayload = {
  syncedLyrics: string | null;
  plainLyrics: string | null;
};

type LrcLibResponse = {
  syncedLyrics?: string;
  plainLyrics?: string;
};

export async function fetchLyricsFromLrcLib(track: string, artist: string): Promise<LyricsPayload | null> {
  const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(track)}&artist_name=${encodeURIComponent(artist)}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "biolink/1.0 (https://github.com/accurs/portfolio)",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = (await res.json()) as LrcLibResponse;
  return {
    syncedLyrics: data.syncedLyrics ?? null,
    plainLyrics: data.plainLyrics ?? null,
  };
}
