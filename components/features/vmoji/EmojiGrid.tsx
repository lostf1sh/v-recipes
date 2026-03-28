"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";

interface Emoji {
  name: string;
  url: string;
}

interface EmojiCategory {
  category: string;
  emojis: Emoji[];
}

export function EmojiGrid() {
  const [categories, setCategories] = useState<EmojiCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/vmoji-data.json")
      .then((res) => {
        if (!res.ok) {
          if (res.status === 429) {
            throw new Error(
              "Showing the last successful emoji list because Discord temporarily rate-limited the live refresh."
            );
          }
          throw new Error(
            "Showing the last successful emoji list because a fresh Discord sync is temporarily unavailable."
          );
        }
        return res.json();
      })
      .then((data: EmojiCategory[]) => {
        if (!data || !Array.isArray(data) || data.length === 0) {
          setError("No emojis currently available on the web page.");
          return;
        }
        setCategories(data);
        if (data.length > 0) setActiveCategory(data[0].category);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load emojis.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#3f83f8] border-t-transparent" />
      </div>
    );
  }

  if (!categories.length && !error) {
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-[#111111] px-4 py-3 text-[13px] text-[#888888]">
        No emojis currently available on the web page.
      </div>
    );
  }

  const active = categories.find((c) => c.category === activeCategory);
  const totalEmojis = categories.reduce((s, c) => s + c.emojis.length, 0);

  return (
    <div>
      {/* Error / rate limit banner */}
      {error && (
        <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-[13px] text-amber-400">
          {error}
        </div>
      )}

      {/* Category tabs */}
      {categories.length > 0 && (
        <>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.category}
                type="button"
                onClick={() => setActiveCategory(cat.category)}
                className={cn(
                  "cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  activeCategory === cat.category
                    ? "bg-[#5865F2] text-white"
                    : "bg-[#111111] text-[#888888] hover:text-[#ededed]"
                )}
              >
                {cat.category}
                <span className="ml-1 text-[10px] opacity-60">
                  {cat.emojis.length}
                </span>
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          {active && (
            <div className="grid grid-cols-4 gap-1 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
              {active.emojis.map((emoji) => (
                <div
                  key={emoji.name}
                  className="group flex flex-col items-center gap-1.5 rounded-lg p-2 transition-colors hover:bg-[#111111]"
                >
                  <img
                    src={emoji.url}
                    alt={emoji.name}
                    width={48}
                    height={48}
                    loading="lazy"
                    className="h-12 w-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "0.3";
                    }}
                  />
                  <span className="max-w-full truncate text-[10px] text-[#555555] group-hover:text-[#888888]">
                    {emoji.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 text-center text-xs text-[#555555]">
            {totalEmojis} emojis across {categories.length} categories. Use{" "}
            <code className="text-[#3f83f8]">/emoji</code> in Discord to browse
            the full catalog.
          </p>
        </>
      )}
    </div>
  );
}
