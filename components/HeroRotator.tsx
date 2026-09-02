"use client";

import type { Niche } from "@/lib/content";

export function HeroRotator({
  items,
  activeIndex,
  paused,
  durationMs,
  onSelect,
}: {
  items: Niche[];
  activeIndex: number;
  paused: boolean;
  durationMs: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((niche, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={niche.id}
            onClick={() => onSelect(i)}
            className={`group relative overflow-hidden rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-brand-blue/60 text-white"
                : "border-white/15 text-white/50 hover:border-white/30 hover:text-white/80"
            }`}
          >
            <span
              className={`absolute inset-0 -z-10 bg-white/10 transition-opacity ${
                active ? "opacity-100" : "opacity-0"
              }`}
            />
            {active && !paused && (
              <span
                key={`${niche.id}-${activeIndex}`}
                className="animate-fill absolute inset-0 -z-10 bg-brand-blue/25"
                style={{ animationDuration: `${durationMs}ms` }}
              />
            )}
            {niche.label}
          </button>
        );
      })}
    </div>
  );
}
