"use client";

import { NewsMedia } from "@/components/NewsMedia";
import { sortNewsByDate } from "@/lib/noticias";
import { formatDate } from "@/lib/utils";
import type { NewsItem } from "@/types";

export function NewsTicker({ items }: { items: NewsItem[] }) {
  const loop = [...sortNewsByDate(items), ...sortNewsByDate(items)];

  return (
    <div className="news-ticker overflow-hidden py-1">
      <div className="news-ticker-track flex w-max gap-4">
        {loop.map((item, index) => (
          <a
            key={`${item.id}-${index}`}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="news-ticker-item flex w-[min(82vw,320px)] shrink-0 flex-col overflow-hidden rounded-2xl border border-[#214C9B]/15 bg-white"
          >
            <NewsMedia item={item} variant="ticker" />
            <div className="flex flex-col p-4">
              <p className="news-ticker-source text-xs font-bold uppercase tracking-normal text-[#981915]">
                {item.source} · {formatDate(item.date)}
              </p>
              <h3 className="news-ticker-title mt-2 text-lg font-extrabold uppercase leading-tight text-[#214C9B]">{item.title}</h3>
              <p className="news-ticker-excerpt mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.excerpt}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
