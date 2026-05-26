"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { NewsCard } from "@/components/NewsCard";
import { PageHero } from "@/components/PageHero";
import { SectionTabs } from "@/components/SectionTabs";
import { newsItems } from "@/data/mock";
import type { NewsTag } from "@/types";

const tags: Array<NewsTag | "todas"> = ["todas", "partido", "fichajes", "cantera", "previa", "cronica", "club", "lesionados", "rumores", "renovaciones", "entrevistas", "otros"];

const tabs = [
  { href: "/prensa/noticias-externas", label: "Noticias externas" },
  { href: "/prensa/medios", label: "Medios" },
  { href: "/prensa/archivo", label: "Archivo" },
];

export default function NoticiasExternasPage() {
  const [source, setSource] = useState("Todos");
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<NewsTag | "todas">("todas");
  const sources = ["Todos", ...Array.from(new Set(newsItems.map((item) => item.source)))];
  const featured = newsItems.find((item) => item.featured) ?? newsItems[0];

  const filtered = useMemo(() => newsItems.filter((item) => {
    const matchesSource = source === "Todos" || item.source === source;
    const matchesQuery = `${item.title} ${item.excerpt}`.toLowerCase().includes(query.toLowerCase());
    const matchesTag = tag === "todas" || item.tags.includes(tag);
    return matchesSource && matchesQuery && matchesTag;
  }), [query, source, tag]);

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Prensa" title="Noticias externas" description="Busca por medio, texto o etiqueta sin mezclarlo con el archivo y los enlaces." />
      <SectionTabs tabs={tabs} />
      <NewsCard item={featured} featured />

      <Card eyebrow="Noticias externas" title="Busca por medio, texto o etiqueta">
        <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
          <select value={source} onChange={(event) => setSource(event.target.value)} className="rounded-2xl border border-[#214C9B]/25 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[#214C9B]">
            {sources.map((item) => <option key={item}>{item}</option>)}
          </select>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar titulares o extractos..." className="rounded-2xl border border-[#214C9B]/25 bg-white px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#214C9B]" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((item) => (
            <button key={item} onClick={() => setTag(item)} className={`rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-normal transition ${tag === item ? "border-[#214C9B] bg-[#214C9B] text-white" : "border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50"}`}>{item}</button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((item) => <NewsCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}
