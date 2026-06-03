"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { NewsCard } from "@/components/NewsCard";
import { Pagination } from "@/components/Pagination";
import { PrimerEquipoPageHero } from "@/components/PrimerEquipoPageHero";
import { usePagination } from "@/hooks/usePagination";
import { fetchPublishedNewsItems } from "@/lib/cms/news";
import { newsForTeam } from "@/lib/noticias";
import { genderLabels, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { NewsItem, NewsTag } from "@/types";

const tags: Array<NewsTag | "todas"> = ["todas", "partido", "fichajes", "cantera", "previa", "cronica", "club", "lesionados", "rumores", "renovaciones", "entrevistas", "otros"];

export default function PrimerEquipoNoticiasPage({ params }: { params: Promise<{ gender: string }> }) {
  const { gender } = use(params) as { gender: PrimerEquipoGender };
  const [tag, setTag] = useState<NewsTag | "todas">("todas");
  const [allNews, setAllNews] = useState<NewsItem[]>([]);

  const loadNews = useCallback(() => {
    void fetchPublishedNewsItems().then(setAllNews);
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const teamNews = useMemo(() => newsForTeam(allNews, gender), [allNews, gender]);

  const filtered = useMemo(
    () => teamNews.filter((item) => tag === "todas" || item.tags.includes(tag)),
    [teamNews, tag],
  );

  const pagination = usePagination(filtered);

  return (
    <div className="space-y-6">
      <PrimerEquipoPageHero
        title="Noticias"
        description={`Actualidad del primer equipo ${genderLabels[gender].club.toLowerCase()} filtrada por categorias.`}
      />

      <div className="-mx-1 flex touch-pan-x flex-nowrap gap-2 overflow-x-auto overscroll-x-contain pb-1 no-scrollbar">
        {tags.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTag(item)}
            className={`shrink-0 rounded-full border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-normal transition sm:px-3 sm:py-2 sm:text-xs ${tag === item ? "border-[#214C9B] bg-[#214C9B] text-white" : "border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50"}`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:gap-4">
        {pagination.paginatedItems.length > 0 ? (
          pagination.paginatedItems.map((item) => <NewsCard key={item.id} item={item} onUpdated={loadNews} />)
        ) : (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">
            Sin noticias en esta categoria para {genderLabels[gender].title.toLowerCase()}.
          </p>
        )}
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
    </div>
  );
}
