"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AddNewsPanel } from "@/components/editor/AddNewsPanel";
import { NewsCard } from "@/components/NewsCard";
import { PageHero } from "@/components/PageHero";
import { Pagination } from "@/components/Pagination";
import { useNewsDateRangeFilter } from "@/hooks/useNewsDateRangeFilter";
import { usePagination } from "@/hooks/usePagination";
import { fetchPublishedNewsItems } from "@/lib/cms/news";
import { newsByChannel } from "@/lib/noticias";
import type { NewsItem, NewsTag } from "@/types";
const tags: Array<NewsTag | "todas"> = ["todas", "partido", "fichajes", "cantera", "previa", "cronica", "club", "lesionados", "rumores", "renovaciones", "entrevistas", "otros"];

export default function NoticiasClubPage() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<NewsTag | "todas">("todas");
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const { dateFrom, dateTo, setDateFrom, setDateTo, clearDateRange, matchesDateRange } = useNewsDateRangeFilter();

  const loadNews = useCallback(() => {
    void fetchPublishedNewsItems().then(setAllNews);
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const clubNews = useMemo(() => newsByChannel(allNews, "club"), [allNews]);

  const filtered = useMemo(
    () =>
      clubNews.filter((item) => {
        const matchesQuery = `${item.title} ${item.excerpt}`.toLowerCase().includes(query.toLowerCase());
        const matchesTag = tag === "todas" || item.tags.includes(tag);
        return matchesQuery && matchesTag && matchesDateRange(item);
      }),
    [clubNews, query, tag, matchesDateRange],
  );

  const pagination = usePagination(filtered);

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Noticias" title="Club" description="Comunicados y actualidad oficial del Real Avilés Industrial." />

      <div className="space-y-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar titulares o extractos..."
          className="w-full rounded-2xl border border-[#214C9B]/25 bg-white px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#214C9B]"
        />
        <div className="-mx-1 flex touch-pan-x flex-nowrap gap-2 overflow-x-auto overscroll-x-contain pb-1 no-scrollbar">
          {tags.map((item) => (
            <button
              key={item}
              onClick={() => setTag(item)}
              className={`shrink-0 rounded-full border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-normal transition sm:px-3 sm:py-2 sm:text-xs ${tag === item ? "border-[#214C9B] bg-[#214C9B] text-white" : "border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <AddNewsPanel defaultChannel="club" onCreated={loadNews} />

      <div className="grid gap-3 sm:gap-4">
        {pagination.paginatedItems.length > 0 ? (
          pagination.paginatedItems.map((item) => <NewsCard key={item.id} item={item} onUpdated={loadNews} />)
        ) : (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">
            Sin noticias con los filtros seleccionados.
          </p>
        )}
      </div>

      <Pagination
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onClearDateRange={clearDateRange}
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
    </div>
  );
}
