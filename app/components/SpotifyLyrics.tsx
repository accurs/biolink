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
  track: string | null;
  artist: string | null;
  timestamps: { start: number; end: number } | null;
  isPlaying: boolean;
};

export default function SpotifyLyrics({ track, artist, timestamps, isPlaying }: Props) {
  const [lines, setLines] = useState<LyricLine[] | null>(null);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const lastTrackRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLyrics = useCallback(async (t: string, a: string) => {
    try {
      const res = await fetch(`/api/lyrics?track=${encodeURIComponent(t)}&artist=${encodeURIComponent(a)}`);
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
    if (!track || !artist) { setLines(null); return; }
    if (lastTrackRef.current === track) return;
    lastTrackRef.current = track;
    setCurrentIdx(-1);
    fetchLyrics(track, artist);
  }, [track, artist, fetchLyrics]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!lines || !timestamps || !isPlaying) {
      setCurrentIdx(-1);
      return;
    }

    const sync = () => {
      const elapsed = Date.now() - timestamps.start;
      let idx = -1;
      for (let i = lines.length - 1; i >= 0; i--) {
        if (elapsed >= lines[i].time) { idx = i; break; }
      }
      setCurrentIdx(idx);
    };

    sync();
    intervalRef.current = setInterval(sync, 200);
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

