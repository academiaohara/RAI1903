"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { NewsCard } from "@/components/NewsCard";
import { PageHero } from "@/components/PageHero";
import { SectionTabs } from "@/components/SectionTabs";
import { newsItems, pressLinks } from "@/data/mock";
import type { NewsTag } from "@/types";

const tags: Array<NewsTag | "todas"> = ["todas", "partido", "fichajes", "cantera", "previa", "cronica", "club", "lesionados", "rumores", "renovaciones", "entrevistas", "otros"];

const tabs = [
  { href: "#noticias-externas", label: "Noticias externas" },
  { href: "#medios", label: "Enlaces a medios" },
  { href: "#archivo", label: "Archivo" },
];

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
      <PageHero eyebrow="Prensa" title="Medios y archivo" description="Noticias externas, enlaces a medios y archivo fan en una pagina sencilla de editar desde datos mock." />
      <SectionTabs tabs={tabs} />

      <NewsCard item={featured} featured />

      <section id="noticias-externas" className="space-y-5 scroll-mt-28">
        <Card eyebrow="Noticias externas" title="Busca por medio, texto o etiqueta">
          <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
            <select value={source} onChange={(event) => setSource(event.target.value)} className="rounded-2xl border border-[#981915]/25 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[#981915]">
              {sources.map((item) => <option key={item}>{item}</option>)}
            </select>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar titulares o extractos..." className="rounded-2xl border border-[#981915]/25 bg-white px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#981915]" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((item) => (
              <button key={item} onClick={() => setTag(item)} className={`rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[0.16em] transition ${tag === item ? "border-[#981915] bg-[#981915] text-white" : "border-[#981915]/20 bg-white text-slate-700 hover:bg-red-50"}`}>{item}</button>
            ))}
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((item) => <NewsCard key={item.id} item={item} />)}
        </div>
      </section>

      <section id="medios" className="scroll-mt-28">
        <Card eyebrow="Enlaces a medios" title="Fuentes para seguir el club">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pressLinks.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="rounded-3xl border border-[#214C9B]/25 bg-white p-5 transition hover:-translate-y-1 hover:border-[#214C9B]">
                <Badge tone="blue">{link.outlet}</Badge>
                <h3 className="mt-4 text-2xl font-black uppercase text-[#981915]">{link.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{link.description}</p>
              </a>
            ))}
          </div>
        </Card>
      </section>

      <section id="archivo" className="scroll-mt-28">
        <Card eyebrow="Archivo" title="Historico reciente">
          <div className="overflow-hidden rounded-2xl border border-[#981915]/20 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#981915] text-[11px] uppercase tracking-[0.18em] text-white"><tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Titular</th><th className="px-4 py-3">Medio</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {newsItems.map((item) => <tr key={item.id}><td className="px-4 py-3 text-slate-500">{item.date}</td><td className="px-4 py-3 font-bold text-slate-900">{item.title}</td><td className="px-4 py-3 text-[#214C9B]">{item.source}</td></tr>)}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
