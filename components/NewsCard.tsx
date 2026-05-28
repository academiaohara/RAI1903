import { Badge } from "@/components/Badge";
import { NewsMedia } from "@/components/NewsMedia";
import { teamScopeLabel } from "@/lib/noticias";
import { formatDate } from "@/lib/utils";
import type { NewsItem } from "@/types";

export function NewsCard({ item, featured = false }: { item: NewsItem; featured?: boolean }) {
  const teamLabel = teamScopeLabel(item.teams);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="news-card-item group block overflow-hidden rounded-3xl border border-[#214C9B]/30 bg-white shadow-[0_12px_30px_rgba(17,24,39,0.06)]"
    >
      <NewsMedia item={item} variant={featured ? "featured" : "card"} />
      <div className="p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone={featured ? "blue" : "red"} className="news-card-badge">
            {item.source}
          </Badge>
          {teamLabel && (
            <Badge tone="slate" className="news-card-badge">
              {teamLabel}
            </Badge>
          )}
          <span className="news-card-date text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{formatDate(item.date)}</span>
        </div>
        <h3
          className={
            featured
              ? "news-card-title text-2xl font-extrabold uppercase leading-tight text-[#214C9B] sm:text-3xl"
              : "news-card-title text-xl font-extrabold uppercase leading-tight text-[#214C9B]"
          }
        >
          {item.title}
        </h3>
        <p className="news-card-excerpt mt-3 text-sm leading-6 text-slate-600">{item.excerpt}</p>
        {item.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag} tone="slate" className="news-card-badge">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}
