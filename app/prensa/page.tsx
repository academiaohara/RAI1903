"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { NewsCard } from "@/components/NewsCard";
import { newsItems } from "@/data/mock";
import type { NewsTag } from "@/types";

const tags: Array<NewsTag | "todas"> = ["todas", "partido", "fichajes", "cantera", "previa", "cronica", "club"];

export default function PrensaPage() {
  const [source, setSource] = useState("Todos");
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<NewsTag | "todas">("todas");
  const sources = ["Todos", ...Array.from(new Set(newsItems.map((item) => item.source)))];

  const filtered = useMemo(() => newsItems.filter((item) => {
    const matchesSource = source === "Todos" || item.source === source;
    const matchesQuery = `${item.title} ${item.excerpt}`.toLowerCase().includes(query.toLowerCase());
    const matchesTag = tag === "todas" || item.tags.includes(tag);
    return matchesSource && matchesQuery && matchesTag;
  }), [query, source, tag]);

  const featured = newsItems.find((item) => item.featured) ?? newsItems[0];

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-[#214C9B]/30 to-[#981915]/25 p-6">
        <Badge tone="white">Media room</Badge>
        <h1 className="mt-4 text-4xl font-black text-white">Prensa blanquiazul</h1>
        <p className="mt-3 max-w-3xl text-slate-300">Noticias agregadas por medio, etiquetas y busqueda para seguir la actualidad del club, mercado, cantera y previas.</p>
      </section>

      <NewsCard item={featured} featured />

      <Card eyebrow="Filtros" title="Busca por medio, texto o etiqueta">
        <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
          <select value={source} onChange={(event) => setSource(event.target.value)} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-300">
            {sources.map((item) => <option key={item}>{item}</option>)}
          </select>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar titulares o extractos..." className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-300" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((item) => (
            <button key={item} onClick={() => setTag(item)} className={`rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${tag === item ? "border-white bg-white text-slate-950" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}>{item}</button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((item) => <NewsCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}
