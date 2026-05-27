import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/Badge";
import { formatDate } from "@/lib/utils";
import type { NewsItem } from "@/types";

function NewsCardMedia({ item, featured }: { item: NewsItem; featured: boolean }) {
  if (item.imageUrl) {
    return (
      <div className={`relative min-h-24 overflow-hidden rounded-2xl bg-slate-100 sm:min-h-32 ${featured ? "sm:min-h-40" : ""}`}>
        <Image
          src={item.imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes={featured ? "(max-width: 640px) 100vw, 160px" : "(max-width: 640px) 100vw, 160px"}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-24 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#214C9B_0%,#214C9B_48%,#ffffff_48%,#ffffff_56%,#981915_56%,#981915_100%)] text-3xl font-extrabold text-white shadow-inner sm:min-h-32 sm:text-4xl">
      {item.source.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function NewsCard({ item, featured = false }: { item: NewsItem; featured?: boolean }) {
  return (
    <article className={`grid gap-4 rounded-3xl border border-[#214C9B]/30 bg-white p-4 shadow-[0_12px_30px_rgba(17,24,39,0.06)] transition hover:-translate-y-0.5 hover:border-[#214C9B] sm:grid-cols-[160px_1fr] ${featured ? "border-[#214C9B] bg-gradient-to-br from-white to-blue-50" : ""}`}>
      <NewsCardMedia item={item} featured={featured} />
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone={featured ? "blue" : "red"}>{item.source}</Badge>
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{formatDate(item.date)}</span>
        </div>
        <h3 className={featured ? "text-2xl font-extrabold uppercase leading-tight text-[#214C9B] sm:text-3xl" : "text-xl font-extrabold uppercase leading-tight text-[#214C9B]"}>{item.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{item.excerpt}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <Badge key={tag} tone="slate">{tag}</Badge>
          ))}
        </div>
        <a href={item.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-normal text-[#214C9B] transition hover:text-[#981915]">
          {item.channel === "club" ? "Leer noticia" : "Leer en medio externo"} <ExternalLink size={15} />
        </a>
      </div>
    </article>
  );
}
