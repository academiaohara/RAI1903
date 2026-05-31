"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { AddNewsPanel } from "@/components/editor/AddNewsPanel";
import { NewsCard } from "@/components/NewsCard";
import { PageHero } from "@/components/PageHero";
import { Pagination } from "@/components/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { fetchPublishedNewsItems } from "@/lib/cms/news";
import { newsByChannel } from "@/lib/noticias";
import type { NewsItem, NewsTag } from "@/types";
const tags: Array<NewsTag | "todas"> = ["todas", "partido", "fichajes", "cantera", "previa", "cronica", "club", "lesionados", "rumores", "renovaciones", "entrevistas", "otros"];

export default function NoticiasPrensaPage() {
  const [source, setSource] = useState("Todos");
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<NewsTag | "todas">("todas");
  const [allNews, setAllNews] = useState<NewsItem[]>([]);

  const loadNews = () => {
    void fetchPublishedNewsItems().then(setAllNews);
  };

  useEffect(() => {
    loadNews();
  }, []);

  const pressNews = useMemo(() => newsByChannel(allNews, "prensa"), [allNews]);
  const sources = ["Todos", ...Array.from(new Set(pressNews.map((item) => item.source)))];

  const filtered = useMemo(
    () =>
      pressNews.filter((item) => {
        const matchesSource = source === "Todos" || item.source === source;
        const matchesQuery = `${item.title} ${item.excerpt}`.toLowerCase().includes(query.toLowerCase());
        const matchesTag = tag === "todas" || item.tags.includes(tag);
        return matchesSource && matchesQuery && matchesTag;
      }),
    [pressNews, query, source, tag],
  );

  const pagination = usePagination(filtered);
  const archivePagination = usePagination(pressNews, { defaultPageSize: 20, pageSizes: [20, 50, 100] });

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Noticias" title="Prensa" description="Titulares de medios externos y archivo reciente." />

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

      <AddNewsPanel defaultChannel="prensa" onCreated={loadNews} />

      <div className="grid gap-3 sm:gap-4">
        {pagination.paginatedItems.map((item) => (
          <NewsCard key={item.id} item={item} onUpdated={loadNews} />
        ))}
      </div>

      <Pagination
        pageSize={pagination.pageSize}
        pageSizes={pagination.pageSizes}
        totalItems={pagination.totalItems}
        rangeStart={pagination.rangeStart}
        rangeEnd={pagination.rangeEnd}
        canGoFirst={pagination.canGoFirst}
        canGoPrevious={pagination.canGoPrevious}
        canGoNext={pagination.canGoNext}
        canGoLast={pagination.canGoLast}
        onPageSizeChange={pagination.setPageSize}
        onFirst={pagination.goToFirst}
        onPrevious={pagination.goToPrevious}
        onNext={pagination.goToNext}
        onLast={pagination.goToLast}
      />

      <Card eyebrow="Archivo" title="Historico reciente">
        <div className="overflow-hidden rounded-2xl border border-[#214C9B]/20 bg-white">
          <div className="divide-y divide-slate-100 md:hidden">
            {archivePagination.paginatedItems.map((item) => (
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
              {archivePagination.paginatedItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-slate-500">{item.date}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{item.title}</td>
                  <td className="px-4 py-3 text-[#214C9B]">{item.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          className="mt-4 border-0 bg-transparent px-0"
          pageSizeLabel="Filas por página"
          pageSize={archivePagination.pageSize}
          pageSizes={archivePagination.pageSizes}
          totalItems={archivePagination.totalItems}
          rangeStart={archivePagination.rangeStart}
          rangeEnd={archivePagination.rangeEnd}
          canGoFirst={archivePagination.canGoFirst}
          canGoPrevious={archivePagination.canGoPrevious}
          canGoNext={archivePagination.canGoNext}
          canGoLast={archivePagination.canGoLast}
          onPageSizeChange={archivePagination.setPageSize}
          onFirst={archivePagination.goToFirst}
          onPrevious={archivePagination.goToPrevious}
          onNext={archivePagination.goToNext}
          onLast={archivePagination.goToLast}
        />
      </Card>
    </div>
  );
}
