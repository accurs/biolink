import { NextResponse } from "next/server";
import redis from "@/app/lib/redis";
import type { PresenceResponse } from "@/app/lib/presence/types";
import { getCachedPresenceData, fetchLanyardData, storePresenceData } from "@/app/lib/presence/service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const referer = req.headers.get("referer");
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  
  const isDirectAccess = !referer && !origin;
  const isDifferentOrigin = referer && !referer.includes(host || "");
  
  if (isDirectAccess || isDifferentOrigin) {
    return NextResponse.json(
      { error: "Direct access not allowed" }, 
      { status: 403 }
    );
  }

  const { userId } = await params;

  let { current, lastSpotify, lastGame, lastStatus } = await getCachedPresenceData(redis, userId);

  if (!current) {
    try {
      current = await fetchLanyardData(userId);

      if (!current) {
        return NextResponse.json({ error: "no data" }, { status: 502 });
      }

      const stored = await storePresenceData(redis, userId, current);
      if (stored.lastSpotify) lastSpotify = stored.lastSpotify;
      if (stored.lastGame) lastGame = stored.lastGame;
      if (stored.lastStatus) lastStatus = stored.lastStatus;
    } catch (error) {
      console.error("Error fetching presence:", error);
      return NextResponse.json({ error: "upstream error" }, { status: 502 });
    }
  }

  const body: PresenceResponse = { current, lastSpotify, lastGame, lastStatus };
  return NextResponse.json(body);
}
