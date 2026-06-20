import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const track = searchParams.get("track");
  const artist = searchParams.get("artist");

  if (!track || !artist) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://lrclib.net/api/get?track_name=${encodeURIComponent(track)}&artist_name=${encodeURIComponent(artist)}`,
      {
        headers: {
          "User-Agent": "biolink/1.0 (https://github.com)",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const data = await res.json();
    return NextResponse.json({
      syncedLyrics: data.syncedLyrics || null,
      plainLyrics: data.plainLyrics || null,
    });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
