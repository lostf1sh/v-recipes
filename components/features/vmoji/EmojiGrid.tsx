"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";

interface Emoji {
  shortName: string;
  imageUrl: string;
}

interface EmojiCategory {
  name: string;
  emojis: Emoji[];
}

interface APIResponse {
  ok: boolean;
  total: number;
  categories: EmojiCategory[];
  stale?: boolean;
  staleReason?: string;
}

export function EmojiGrid() {
  const [categories, setCategories] = useState<EmojiCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/vmoji", { signal: controller.signal })
      .then((res) => {
        if (res.status === 429) {
          throw new Error(
            "Showing the last successful emoji list because Discord temporarily rate-limited the live refresh."
          );
        }
        if (!res.ok) {
          throw new Error(
            "Fresh emoji sync is temporarily unavailable. You can still browse emojis in Discord by running /emoji browse:true or /browse."
          );
        }
        return res.json();
      })
      .then((data: APIResponse) => {
        if (data.stale) {
          setError(
            data.staleReason === "rate_limited"
              ? "Showing the last successful emoji list because Discord temporarily rate-limited the live refresh."
              : "Showing cached emoji list because a fresh Discord sync is temporarily unavailable."
          );
        }

        const cats = data.categories ?? [];
        if (cats.length === 0) {
          setError("No emojis currently available on the web page.");
          return loadFallback();
        }

        setCategories(cats);
        setTotal(data.total ?? cats.reduce((s, c) => s + c.emojis.length, 0));
        if (cats.length > 0) setActiveCategory(cats[0].name);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load emojis.");
        loadFallback();
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  function loadFallback() {
    fetch("/vmoji-data.json")
      .then((r) => r.json())
      .then((fallback) => {
        const mapped: EmojiCategory[] = fallback.map(
          (c: { category: string; emojis: { name: string; url: string }[] }) => ({
            name: c.category,
            emojis: c.emojis.map((e) => ({ shortName: e.name, imageUrl: e.url })),
          })
        );
        setCategories(mapped);
        setTotal(mapped.reduce((s, c) => s + c.emojis.length, 0));
        if (mapped.length > 0) setActiveCategory(mapped[0].name);
      })
      .catch(() => {});
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#3f83f8] border-t-transparent" />
      </div>
    );
  }

  if (categories.length === 0 && !error) {
    return (
      <div className="rounded-lg border border-[#1a1a1a] bg-[#111] px-4 py-3 text-[13px] text-[#888]">
        No emojis currently available. Use <code className="text-[#3f83f8]">/emoji browse:true</code> or{" "}
        <code className="text-[#3f83f8]">/browse</code> in Discord to browse directly.
      </div>
    );
  }

  const active = categories.find((c) => c.name === activeCategory);

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-[13px] text-amber-400">
          {error}
        </div>
      )}

      {categories.length > 0 && (
        <>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveCategory(cat.name)}
                className={cn(
                  "cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  activeCategory === cat.name
                    ? "bg-[#5865F2] text-white"
                    : "bg-[#111] text-[#888] hover:text-[#ededed]"
                )}
              >
                {cat.name}
                <span className="ml-1 text-[10px] opacity-60">{cat.emojis.length}</span>
              </button>
            ))}
          </div>

          {active && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
              {active.emojis.map((emoji) => (
                <div
                  key={emoji.shortName}
                  className="group flex flex-col items-center gap-2 rounded-lg border border-transparent p-3 transition-all hover:border-[#1a1a1a] hover:bg-[#111]"
                >
                  <img
                    src={emoji.imageUrl}
                    alt={emoji.shortName}
                    width={56}
                    height={56}
                    loading="lazy"
                    className="h-14 w-14 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "0.3";
                    }}
                  />
                  <span className="max-w-full truncate text-[11px] text-[#555] group-hover:text-[#888]">
                    {emoji.shortName}
                  </span>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 text-center text-xs text-[#555]">
            {total} emojis across {categories.length} categories. Use{" "}
            <code className="text-[#3f83f8]">/emoji</code> or{" "}
            <code className="text-[#3f83f8]">/browse</code> in Discord to browse the full catalog.
          </p>
        </>
      )}
    </div>
  );
}
