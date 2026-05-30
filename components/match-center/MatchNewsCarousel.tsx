"use client";

import { NewsTicker } from "@/components/NewsTicker";
import type { NewsItem } from "@/types";

type MatchNewsCarouselProps = {
  items: NewsItem[];
  title?: string;
};

export function MatchNewsCarousel({ items, title = "Post partido en medios" }: MatchNewsCarouselProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-extrabold uppercase tracking-normal text-[#214C9B]">{title}</h3>
      <NewsTicker items={items} />
    </div>
  );
}
