import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/Badge";
import { formatDate } from "@/lib/utils";
import type { NewsItem } from "@/types";

export function NewsCard({ item, featured = false }: { item: NewsItem; featured?: boolean }) {
  return (
    <article className={`rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-blue-300/30 hover:bg-white/[0.07] ${featured ? "bg-gradient-to-br from-[#214C9B]/35 to-[#981915]/20" : ""}`}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge tone={featured ? "white" : "blue"}>{item.source}</Badge>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{formatDate(item.date)}</span>
      </div>
      <h3 className={featured ? "text-3xl font-black text-white" : "text-lg font-black text-white"}>{item.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{item.excerpt}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <Badge key={tag} tone="slate">{tag}</Badge>
        ))}
      </div>
      <a href={item.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-200 transition hover:text-white">
        Leer en medio externo <ExternalLink size={15} />
      </a>
    </article>
  );
}
