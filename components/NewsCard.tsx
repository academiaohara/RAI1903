import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/Badge";
import { NewsMedia } from "@/components/NewsMedia";
import { shouldShowTeamScopeBadge, teamScopeBadgeTone, teamScopeLabel } from "@/lib/noticias";
import { formatDate } from "@/lib/utils";
import type { NewsItem } from "@/types";

export function NewsCard({ item, featured = false }: { item: NewsItem; featured?: boolean }) {
  const teamLabel = teamScopeLabel(item.teams);
  const teamBadgeTone = teamScopeBadgeTone(item.teams);
  const showTeamBadge = shouldShowTeamScopeBadge(item);

  return (
    <article
      className={`grid items-stretch gap-4 rounded-3xl border border-[#214C9B]/30 bg-white p-4 shadow-[0_12px_30px_rgba(17,24,39,0.06)] transition hover:-translate-y-0.5 hover:border-[#214C9B] sm:grid-cols-[9rem_1fr] ${featured ? "border-[#214C9B] bg-gradient-to-br from-white to-blue-50 sm:grid-cols-[11rem_1fr]" : ""}`}
    >
      <NewsMedia item={item} variant={featured ? "featured" : "card"} />
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone={featured ? "blue" : "red"}>{item.source}</Badge>
          {showTeamBadge && teamLabel && teamBadgeTone && (
            <Badge tone={teamBadgeTone}>{teamLabel}</Badge>
          )}
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{formatDate(item.date)}</span>
        </div>
        <h3 className={featured ? "text-2xl font-extrabold uppercase leading-tight text-[#214C9B] sm:text-3xl" : "text-xl font-extrabold uppercase leading-tight text-[#214C9B]"}>{item.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{item.excerpt}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <Badge key={tag} tone="slate">
              {tag}
            </Badge>
          ))}
        </div>
        <a href={item.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-normal text-[#214C9B] transition hover:text-[#981915]">
          {item.channel === "club" ? "Leer noticia" : "Leer en medio externo"} <ExternalLink size={15} />
        </a>
      </div>
    </article>
  );
}
