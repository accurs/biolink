"use client";

import { useEffect, useState } from "react";
import type { PresenceResponse } from "@/app/lib/presence/types";

type Rgb = [number, number, number];

function colorDistance(a: Rgb, b: Rgb): number {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function toCssRgb([r, g, b]: Rgb): string {
  return `${r}, ${g}, ${b}`;
}

function extractDominantColors(img: HTMLImageElement): Rgb[] {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  const SIZE = 56;
  canvas.width = SIZE;
  canvas.height = SIZE;
  ctx.drawImage(img, 0, 0, SIZE, SIZE);

  const data = ctx.getImageData(0, 0, SIZE, SIZE).data;
  const buckets = new Map<string, { rgb: Rgb; weight: number; count: number }>();

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 140) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;
    if (lightness < 16) continue;

    const saturation = max === 0 ? 0 : (max - min) / max;
    const weight = 1 + saturation * 1.6 + (lightness / 255) * 0.7;

    const q = 24;
    const qr = Math.round(r / q) * q;
    const qg = Math.round(g / q) * q;
    const qb = Math.round(b / q) * q;
    const key = `${qr},${qg},${qb}`;
    const existing = buckets.get(key);

    if (existing) {
      existing.rgb = [
        existing.rgb[0] + r,
        existing.rgb[1] + g,
        existing.rgb[2] + b,
      ];
      existing.weight += weight;
      existing.count++;
    } else {
      buckets.set(key, { rgb: [r, g, b], weight, count: 1 });
    }
  }

  const sorted = [...buckets.values()]
    .map(({ rgb, count, weight }) => ({
      rgb: [
        Math.round(rgb[0] / count),
        Math.round(rgb[1] / count),
        Math.round(rgb[2] / count),
      ] as Rgb,
      score: weight * count,
    }))
    .sort((a, b) => b.score - a.score);

  const picked: Rgb[] = [];
  for (const item of sorted) {
    if (picked.every((existing) => colorDistance(existing, item.rgb) > 36)) {
      picked.push(item.rgb);
    }
    if (picked.length === 3) break;
  }

  if (picked.length === 0) return [];
  while (picked.length < 3) picked.push(picked[picked.length - 1]);
  return picked;
}

export default function AmbientGradient({ userId }: { userId: string }) {
  const [colors, setColors] = useState<Rgb[] | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const res = await fetch(`/api/presence/${userId}`, { cache: "no-store" });
        if (!res.ok) {
          if (isMounted) setColors(null);
          return;
        }
        const data = (await res.json()) as PresenceResponse;
        const user = data.current?.discord_user;
        if (!user?.avatar) {
          if (isMounted) setColors(null);
          return;
        }

        const ext = user.avatar.startsWith("a_") ? "gif" : "png";
        const url = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256`;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          if (!isMounted) return;
          const extracted = extractDominantColors(img);
          setColors(extracted.length ? extracted : null);
        };
        img.onerror = () => {
          if (!isMounted) return;
          setColors(null);
        };
        img.src = url;
      } catch {
        if (isMounted) setColors(null);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    const root = document.documentElement;
    if (!colors) {
      root.classList.remove("avatar-colors-ready");
      root.style.removeProperty("--avatar-color-1");
      root.style.removeProperty("--avatar-color-2");
      root.style.removeProperty("--avatar-color-3");
      return;
    }

    const [c1, c2, c3] = colors.map(toCssRgb);
    root.style.setProperty("--avatar-color-1", c1);
    root.style.setProperty("--avatar-color-2", c2);
    root.style.setProperty("--avatar-color-3", c3);
    root.classList.add("avatar-colors-ready");

    return () => {
      root.classList.remove("avatar-colors-ready");
      root.style.removeProperty("--avatar-color-1");
      root.style.removeProperty("--avatar-color-2");
      root.style.removeProperty("--avatar-color-3");
    };
  }, [colors]);

  if (!colors) return null;

  const [c1, c2, c3] = colors.map(toCssRgb);

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 transition-opacity duration-700"
      style={{
        opacity: 1,
        background: `
          radial-gradient(120% 90% at 12% 8%, rgba(${c1}, 0.32) 0%, rgba(${c1}, 0.11) 36%, rgba(0, 0, 0, 0) 64%),
          radial-gradient(100% 80% at 86% 18%, rgba(${c2}, 0.26) 0%, rgba(${c2}, 0.09) 34%, rgba(0, 0, 0, 0) 62%),
          radial-gradient(92% 76% at 50% 88%, rgba(${c3}, 0.22) 0%, rgba(${c3}, 0.08) 30%, rgba(0, 0, 0, 0) 58%),
          linear-gradient(180deg, #040507 0%, #07080b 42%, #050608 100%)
        `,
      }}
    />
  );
}
