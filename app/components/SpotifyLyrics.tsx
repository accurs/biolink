"use client";

import { useEffect, useState, useRef, useCallback } from "react";

type LyricLine = { time: number; text: string };

function parseLrc(lrc: string): LyricLine[] {
  const lines: LyricLine[] = [];
  for (const line of lrc.split("\n")) {
    const match = line.match(/^\[(\d+):(\d+)\.(\d+)\]\s*(.*)/);
    if (!match) continue;
    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    const ms = parseInt(match[3].padEnd(3, "0").slice(0, 3), 10);
    const time = minutes * 60000 + seconds * 1000 + ms;
    const text = match[4].trim();
    if (text) lines.push({ time, text });
  }
  return lines.sort((a, b) => a.time - b.time);
}

type Props = {
  trackId: string | null;
  track: string | null;
  artist: string | null;
  timestamps: { start: number; end: number } | null;
  isPlaying: boolean;
};

export default function SpotifyLyrics({ trackId, track, artist, timestamps, isPlaying }: Props) {
  const [lines, setLines] = useState<LyricLine[] | null>(null);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const lastTrackRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLyrics = useCallback(async (id: string | null, t: string, a: string) => {
    try {
      const params = new URLSearchParams({
        track: t,
        artist: a,
      });
      if (id) params.set("trackId", id);
      const res = await fetch(`/api/lyrics?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) { setLines(null); return; }
      const data = await res.json();
      if (data.syncedLyrics) {
        setLines(parseLrc(data.syncedLyrics));
      } else {
        setLines(null);
      }
    } catch {
      setLines(null);
    }
  }, []);

  useEffect(() => {
    if (!track || !artist) {
      const resetId = window.setTimeout(() => {
        setLines(null);
        setCurrentIdx(-1);
      }, 0);
      return () => window.clearTimeout(resetId);
    }
    const currentTrackKey = trackId ?? `${track}::${artist}`;
    if (lastTrackRef.current === currentTrackKey) return;
    lastTrackRef.current = currentTrackKey;
    const resetId = window.setTimeout(() => setCurrentIdx(-1), 0);
    fetchLyrics(trackId, track, artist);
    return () => window.clearTimeout(resetId);
  }, [trackId, track, artist, fetchLyrics]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!lines || !timestamps || !isPlaying) {
      const resetId = window.setTimeout(() => setCurrentIdx(-1), 0);
      return () => window.clearTimeout(resetId);
    }

    const sync = () => {
      const elapsed = Date.now() - timestamps.start;
      if (elapsed < 0) {
        setCurrentIdx(-1);
        return;
      }
      let low = 0;
      let high = lines.length - 1;
      let idx = -1;
      while (low <= high) {
        const mid = (low + high) >> 1;
        if (lines[mid].time <= elapsed) {
          idx = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      setCurrentIdx(idx);
    };

    sync();
    intervalRef.current = setInterval(sync, 120);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [lines, timestamps, isPlaying]);

  if (!lines || !isPlaying || currentIdx < 0) return null;

  const current = lines[currentIdx];

  return (
    <p
      key={current.time}
      className="text-center text-[13px] text-zinc-500 italic animate-lyric-fade"
    >
      {current.text}
    </p>
  );
}

