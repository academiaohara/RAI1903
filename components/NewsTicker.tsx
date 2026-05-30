"use client";

import { sortNewsByDate } from "@/lib/noticias";
import type { NewsItem } from "@/types";

export function NewsTicker({ items }: { items: NewsItem[] }) {
  const loop = [...sortNewsByDate(items), ...sortNewsByDate(items)];

  return (
    <div className="news-ticker overflow-hidden py-1">
      <div className="news-ticker-track flex w-max items-center gap-3">
        {loop.map((item, index) => (
          <a
            key={`${item.id}-${index}`}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="news-ticker-item flex h-9 w-[min(68vw,220px)] shrink-0 items-center overflow-hidden rounded-lg border border-[#214C9B]/15 bg-white px-3 sm:h-10 sm:w-[min(72vw,260px)]"
          >
            <h3 className="news-ticker-title min-w-0 truncate text-[11px] font-extrabold uppercase leading-tight text-[#214C9B] sm:text-xs">
              {item.title}
            </h3>
          </a>
        ))}
      </div>
    </div>
  );
}
