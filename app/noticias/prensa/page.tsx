"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { NewsCard } from "@/components/NewsCard";
import { PageHero } from "@/components/PageHero";
import { newsItems, pressLinks } from "@/data/mock";
import { newsByChannel } from "@/lib/noticias";
import type { NewsTag } from "@/types";

const pressNews = newsByChannel(newsItems, "prensa");
const tags: Array<NewsTag | "todas"> = ["todas", "partido", "fichajes", "cantera", "previa", "cronica", "club", "lesionados", "rumores", "renovaciones", "entrevistas", "otros"];

export default function NoticiasPrensaPage() {
  const [source, setSource] = useState("Todos");
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<NewsTag | "todas">("todas");
  const sources = ["Todos", ...Array.from(new Set(pressNews.map((item) => item.source)))];

  const filtered = useMemo(
    () =>
      pressNews.filter((item) => {
        const matchesSource = source === "Todos" || item.source === source;
        const matchesQuery = `${item.title} ${item.excerpt}`.toLowerCase().includes(query.toLowerCase());
        const matchesTag = tag === "todas" || item.tags.includes(tag);
        return matchesSource && matchesQuery && matchesTag;
      }),
    [query, source, tag],
  );

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Noticias" title="Post partido" description="Titulares de medios externos, enlaces a fuentes y archivo reciente." />

      <div className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
          <select
            value={source}
            onChange={(event) => setSource(event.target.value)}
            className="rounded-2xl border border-[#214C9B]/25 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[#214C9B]"
          >
            {sources.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar titulares o extractos..."
            className="rounded-2xl border border-[#214C9B]/25 bg-white px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#214C9B]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
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
      </div>

      <div className="grid gap-3 sm:gap-4">
        {filtered.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>

      <Card eyebrow="Enlaces a medios" title="Fuentes para seguir el club">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pressLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-3xl border border-[#214C9B]/25 bg-white p-5 transition hover:-translate-y-1 hover:border-[#214C9B]"
            >
              <Badge tone="blue">{link.outlet}</Badge>
              <h3 className="mt-4 break-words text-xl font-extrabold uppercase text-[#214C9B] sm:text-2xl">{link.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{link.description}</p>
            </a>
          ))}
        </div>
      </Card>

      <Card eyebrow="Archivo" title="Historico reciente">
        <div className="overflow-hidden rounded-2xl border border-[#214C9B]/20 bg-white">
          <div className="divide-y divide-slate-100 md:hidden">
            {pressNews.map((item) => (
              <article key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 break-words text-sm font-extrabold leading-snug text-slate-900">{item.title}</h3>
                  <span className="shrink-0 text-right text-[11px] font-bold uppercase text-slate-500">{item.date}</span>
                </div>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.06em] text-[#214C9B]">{item.source}</p>
              </article>
            ))}
          </div>

          <table className="hidden w-full text-left text-sm md:table">
            <thead className="bg-[#214C9B] text-[11px] uppercase tracking-normal text-white">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Titular</th>
                <th className="px-4 py-3">Medio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pressNews.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-slate-500">{item.date}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{item.title}</td>
                  <td className="px-4 py-3 text-[#214C9B]">{item.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
