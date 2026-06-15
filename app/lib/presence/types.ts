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

export type PresenceResponse = {
  current: LanyardData;
  lastSpotify: StoredSpotify | null;
  lastGame: StoredGame | null;
};
