"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { NewsCard } from "@/components/NewsCard";
import { PageHero } from "@/components/PageHero";
import { newsItems } from "@/data/mock";
import { newsByChannel } from "@/lib/noticias";
import type { NewsTag } from "@/types";

const clubNews = newsByChannel(newsItems, "club");
const tags: Array<NewsTag | "todas"> = ["todas", "partido", "fichajes", "cantera", "previa", "cronica", "club", "lesionados", "rumores", "renovaciones", "entrevistas", "otros"];

export default function NoticiasClubPage() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<NewsTag | "todas">("todas");
  const featured = clubNews.find((item) => item.featured) ?? clubNews[0];

  const filtered = useMemo(
    () =>
      clubNews.filter((item) => {
        const matchesQuery = `${item.title} ${item.excerpt}`.toLowerCase().includes(query.toLowerCase());
        const matchesTag = tag === "todas" || item.tags.includes(tag);
        return matchesQuery && matchesTag;
      }),
    [query, tag],
  );

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Noticias" title="Club" description="Comunicados y actualidad oficial del Real Aviles Industrial." />
      {featured && <NewsCard item={featured} featured />}

      <Card eyebrow="Club" title="Busca por texto o etiqueta">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar titulares o extractos..."
          className="w-full rounded-2xl border border-[#214C9B]/25 bg-white px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#214C9B]"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((item) => (
            <button
              key={item}
              onClick={() => setTag(item)}
              className={`rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-normal transition ${tag === item ? "border-[#214C9B] bg-[#214C9B] text-white" : "border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4">
        {filtered.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
