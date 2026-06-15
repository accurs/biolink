import type { IconType } from "react-icons";
import {
  SiCloudflare,
  SiDocker,
  SiFastapi,
  SiFlask,
  SiGit,
  SiGithub,
  SiPostgresql,
  SiPython,
  SiRedis,
  SiSentry,
  SiVercel,
} from "react-icons/si";

export const tech = [
  { label: "PostgreSQL", href: "https://www.postgresql.org" },
  { label: "Redis", href: "https://redis.io" },
  { label: "Docker", href: "https://www.docker.com" },
  { label: "Git", href: "https://git-scm.com" },
  { label: "GitHub", href: "https://github.com" },
  { label: "Vercel", href: "https://vercel.com" },
  { label: "Cloudflare", href: "https://cloudflare.com" },
  { label: "Python", href: "https://www.python.org" },
  { label: "FastAPI", href: "https://fastapi.tiangolo.com" },
  { label: "Flask", href: "https://flask.palletsprojects.com" },
  { label: "Sentry", href: "https://sentry.io" },
] as const;

export type TechItem = (typeof tech)[number];
export type TechName = TechItem["label"];

export const techIcons: Record<TechName, IconType> = {
  PostgreSQL: SiPostgresql,
  Redis: SiRedis,
  Docker: SiDocker,
  Git: SiGit,
  GitHub: SiGithub,
  Vercel: SiVercel,
  Cloudflare: SiCloudflare,
  Python: SiPython,
  FastAPI: SiFastapi,
  Flask: SiFlask,
  Sentry: SiSentry,
};
