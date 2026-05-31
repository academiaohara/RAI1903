"use client";

import { NewsTicker } from "@/components/NewsTicker";
import { usePublishedNews } from "@/hooks/usePublishedNews";

export function HomeNewsTicker() {
  const { items, loading } = usePublishedNews();

  if (loading) {
    return (
      <p className="rounded-2xl border border-dashed border-[#214C9B]/20 bg-slate-50/80 p-4 text-sm font-semibold text-slate-500">
        Cargando noticias…
      </p>
    );
  }

  if (!items.length) {
    return (
      <p className="rounded-2xl border border-dashed border-[#214C9B]/20 bg-slate-50/80 p-4 text-sm font-semibold text-slate-500">
        No hay noticias publicadas en este momento.
      </p>
    );
  }

  return <NewsTicker items={items} />;
}
