"use client";

import { NewsMedia } from "@/components/NewsMedia";
import { formatDate } from "@/lib/utils";
import type { NewsItem } from "@/types";

type MatchNewsCarouselProps = {
  items: NewsItem[];
  title?: string;
};

export function MatchNewsCarousel({ items, title = "Post partido en medios" }: MatchNewsCarouselProps) {
  if (items.length === 0) return null;

  const useTicker = items.length > 1;
  const loop = useTicker ? [...items, ...items] : items;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-extrabold uppercase tracking-normal text-[#214C9B]">{title}</h3>

      <div className={`py-1${useTicker ? " news-ticker overflow-hidden" : ""}`}>
        <div className={`flex w-max gap-4${useTicker ? " news-ticker-track" : ""}`}>
          {loop.map((item, index) => (
            <a
              key={`${item.id}-${index}`}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="news-ticker-item w-[min(72vw,260px)] shrink-0 overflow-hidden rounded-2xl border border-[#214C9B]/15 bg-white shadow-sm sm:w-[min(82vw,320px)]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <NewsMedia item={item} variant="ticker" />
              </div>
              <div className="space-y-1 p-3">
                <p className="news-ticker-source text-[10px] font-bold uppercase text-[#981915] sm:text-xs">
                  {item.source} · {formatDate(item.date, { day: "numeric", month: "short" })}
                </p>
                <p className="news-ticker-title line-clamp-3 text-sm font-extrabold leading-snug text-[#214C9B]">{item.title}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
