import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/Badge";
import { formatDate } from "@/lib/utils";
import type { NewsItem } from "@/types";

export function NewsCard({ item, featured = false }: { item: NewsItem; featured?: boolean }) {
  return (
    <article className={`grid gap-4 rounded-3xl border border-[#981915]/30 bg-white p-4 shadow-[0_12px_30px_rgba(17,24,39,0.06)] transition hover:-translate-y-0.5 hover:border-[#981915] sm:grid-cols-[160px_1fr] ${featured ? "border-[#981915] bg-gradient-to-br from-white to-red-50" : ""}`}>
      <div className="flex min-h-32 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#981915_0%,#981915_48%,#ffffff_48%,#ffffff_56%,#214C9B_56%,#214C9B_100%)] text-4xl font-black text-white shadow-inner">
        {item.source.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone={featured ? "red" : "blue"}>{item.source}</Badge>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{formatDate(item.date)}</span>
        </div>
        <h3 className={featured ? "text-3xl font-black uppercase leading-tight text-[#981915]" : "text-xl font-black uppercase leading-tight text-[#981915]"}>{item.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{item.excerpt}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <Badge key={tag} tone="slate">{tag}</Badge>
          ))}
        </div>
        <a href={item.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#214C9B] transition hover:text-[#981915]">
          Leer en medio externo <ExternalLink size={15} />
        </a>
      </div>
    </article>
  );
}
