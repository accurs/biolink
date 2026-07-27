# biolink

Personal link-in-bio / portfolio — projects, tech stack, Discord presence (Lanyard), and synced Spotify lyrics.

Built with Next.js 16, React 19, Tailwind CSS 4, Redis, and a background presence worker.

## Requirements

- [Bun](https://bun.sh)
- Redis (`redis://localhost:6379` by default)
- A Discord user ID monitored via [Lanyard](https://github.com/Phineas/lanyard)

## Environment

Create a `.env` in the project root:

```bash
REDIS_URL=redis://localhost:6379
DISCORD_USER_ID=your_discord_user_id
```

| Variable | Used by | Description |
|---|---|---|
| `REDIS_URL` | Next.js API routes, worker | Redis connection string |
| `DISCORD_USER_ID` | worker | Discord user to poll via Lanyard |

The Discord user id on the page itself is set in `app/page.tsx` (`LanyardStatus`).

## Development

Install and start the web app + presence worker together:

```bash
bun install
bun run dev
```

- Web: [http://localhost:3000](http://localhost:3000)
- Worker: polls Lanyard, caches presence in Redis, and prefetches lyrics

Or run them separately:

```bash
bun run dev:web      # next dev
bun run dev:worker  # tsx worker.ts
```

## Production

```bash
bun run build
bun run start          # Next.js (default port 3000)
bun run dev:worker     # presence worker
```

Or with PM2 (`ecosystem.config.js`):

```bash
bun run build
pm2 start ecosystem.config.js
pm2 save
```

That starts:

- `portfolio` — `bun run start` on port **8080**
- `presence-worker` — Redis-backed Lanyard poller

Update `cwd`, `PORT`, `REDIS_URL`, and `DISCORD_USER_ID` in `ecosystem.config.js` for your host.

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Web + worker (concurrently) |
| `bun run build` | Production build |
| `bun run start` | Serve production build |
| `bun run lint` | ESLint |

## API

| Route | Description |
|---|---|
| `GET /api/presence/[userId]` | Cached presence (current + last Spotify/game/status) |
| `GET /api/lyrics` | Cached Spotify lyrics for the current track |

Presence routes reject direct browser hits without a same-origin referer/origin.

## License

MIT — see [LICENSE.md](./LICENSE.md).
