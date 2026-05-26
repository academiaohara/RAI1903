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
      <section className="rounded-[2rem] border border-[#c4121a]/25 bg-white p-6 shadow-[0_18px_45px_rgba(17,24,39,0.08)]">
        <Badge tone="red">Media room</Badge>
        <h1 className="mt-4 text-5xl font-black uppercase text-[#c4121a]">Prensa blanquiazul</h1>
        <p className="mt-3 max-w-3xl text-slate-600">Noticias agregadas por medio, etiquetas y busqueda para seguir la actualidad del club, mercado, cantera y previas.</p>
      </section>

      <NewsCard item={featured} featured />

      <Card eyebrow="Filtros" title="Busca por medio, texto o etiqueta">
        <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
          <select value={source} onChange={(event) => setSource(event.target.value)} className="rounded-2xl border border-[#c4121a]/25 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[#c4121a]">
            {sources.map((item) => <option key={item}>{item}</option>)}
          </select>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar titulares o extractos..." className="rounded-2xl border border-[#c4121a]/25 bg-white px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#c4121a]" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((item) => (
            <button key={item} onClick={() => setTag(item)} className={`rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${tag === item ? "border-[#c4121a] bg-[#c4121a] text-white" : "border-[#c4121a]/20 bg-white text-slate-700 hover:bg-red-50"}`}>{item}</button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((item) => <NewsCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}
