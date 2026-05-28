import { ArrowLeftRight, Newspaper } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/Badge";
import { NewsMedia } from "@/components/NewsMedia";
import { newsCategoryBadge } from "@/lib/noticias";
import { formatDate } from "@/lib/utils";
import type { NewsItem } from "@/types";

const categoryIcons: Record<string, LucideIcon> = {
  fichajes: ArrowLeftRight,
  noticia: Newspaper,
};

export function NewsCard({ item }: { item: NewsItem }) {
  const category = newsCategoryBadge(item);
  const CategoryIcon = categoryIcons[category.key] ?? Newspaper;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="news-card-item group flex min-h-[7.5rem] overflow-hidden rounded-xl border border-[#214C9B] bg-white sm:min-h-[8.5rem]"
    >
      <NewsMedia item={item} variant="card" />
      <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <h3 className="news-card-title text-base font-extrabold uppercase leading-tight text-[#214C9B] sm:text-lg">
            {item.title}
          </h3>
          <p className="news-card-excerpt mt-2 line-clamp-2 text-sm leading-6 text-slate-800 sm:line-clamp-3">{item.excerpt}</p>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 sm:mt-4">
          <span className="news-card-date text-xs font-medium text-[#214C9B]/65">
            {formatDate(item.date, { day: "numeric", month: "long" })} | {item.source}
          </span>
          <Badge tone={category.tone} className="news-card-badge shrink-0 gap-1.5 px-3 py-1.5">
            <CategoryIcon className="size-3.5 shrink-0" aria-hidden />
            {category.label}
          </Badge>
        </div>
      </div>
    </a>
  );
}
