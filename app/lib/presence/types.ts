export type LanyardActivity = {
  name: string;
  type: number;
  details?: string;
  state?: string;
};

export type LanyardData = {
  discord_status: "online" | "idle" | "dnd" | "offline";
  discord_user: {
    id: string;
    username: string;
    global_name?: string | null;
    avatar?: string | null;
    avatar_decoration_data?: {
      asset: string;
      sku_id: string;
    } | null;
    collectibles?: {
      nameplate?: {
        asset: string;
        sku_id: string;
        label: string;
        palette: string;
      } | null;
    } | null;
  };
  listening_to_spotify: boolean;
  spotify?: {
    song: string;
    artist: string;
    album_art_url?: string;
    track_id?: string;
    timestamps?: {
      start: number;
      end: number;
    };
  };
  activities: LanyardActivity[];
  active_on_discord_mobile: boolean;
  active_on_discord_desktop: boolean;
  active_on_discord_web: boolean;
};

export type StoredSpotify = {
  song: string;
  artist: string;
  album_art_url?: string;
  track_id?: string;
  seenAt: number;
};

export type StoredGame = {
  name: string;
  details?: string;
  state?: string;
  seenAt: number;
};

export type StoredStatus = {
  status: "online" | "idle" | "dnd";
  seenAt: number;
};

export type StoredLyrics = {
  trackId: string;
  track: string;
  artist: string;
  syncedLyrics: string | null;
  plainLyrics: string | null;
  fetchedAt: number;
};

export type PresenceResponse = {
  current: LanyardData;
  lastSpotify: StoredSpotify | null;
  lastGame: StoredGame | null;
  lastStatus: StoredStatus | null;
};
