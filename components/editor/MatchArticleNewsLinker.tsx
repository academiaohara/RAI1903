"use client";

import { Link2, X } from "lucide-react";
import { useMemo } from "react";
import { ClubChronicleCard } from "@/components/match-center/ClubChronicleCard";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import type { MatchArticle, NewsItem } from "@/types";

const clubNewsOverrideKey = (articleId: string) => `match-article:${articleId}:clubNewsId`;

type MatchArticleNewsLinkerProps = {
  article: MatchArticle;
  newsItems: NewsItem[];
};

export function MatchArticleNewsLinker({ article, newsItems }: MatchArticleNewsLinkerProps) {
  const { editMode, canEdit, getValue, saveValue, clearValue } = useInlineEditing();

  const resolvedNewsId = getValue<string | null>(
    clubNewsOverrideKey(article.id),
    article.clubNewsId ?? null,
  );

  const linkedNews = useMemo(
    () => (resolvedNewsId ? newsItems.find((item) => item.id === resolvedNewsId) ?? null : null),
    [newsItems, resolvedNewsId],
  );

  const candidates = useMemo(() => {
    const tag = article.type === "cronica" ? "cronica" : "previa";
    return newsItems.filter((item) => item.tags.includes(tag));
  }, [article.type, newsItems]);

  if (!canEdit || !editMode) {
    if (!linkedNews) return null;
    return (
      <div className="mt-4">
        <p className="mb-2 text-xs font-bold uppercase text-slate-500">Noticia vinculada</p>
        <ClubChronicleCard item={linkedNews} />
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-dashed border-[#214C9B]/35 bg-blue-50/40 p-4">
      <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#214C9B]">
        <Link2 className="size-3.5" aria-hidden />
        Noticia {article.type === "cronica" ? "de crónica" : "de previa"}
      </div>

      {linkedNews ? (
        <div className="mt-3 space-y-3">
          <ClubChronicleCard item={linkedNews} />
          <button
            type="button"
            onClick={() => clearValue(clubNewsOverrideKey(article.id))}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold uppercase text-red-700 hover:bg-red-50"
          >
            <X className="size-3.5" aria-hidden />
            Quitar enlace
          </button>
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-600">
          Elige una noticia con etiqueta «{article.type === "cronica" ? "cronica" : "previa"}»:
        </p>
      )}

      <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto">
        {candidates.length === 0 ? (
          <li className="text-sm text-slate-500">No hay noticias con esa etiqueta. Añádelas en Noticias.</li>
        ) : (
          candidates.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => saveValue(clubNewsOverrideKey(article.id), item.id)}
                className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition ${resolvedNewsId === item.id ? "border-[#214C9B] bg-white" : "border-[#214C9B]/15 bg-white hover:border-[#214C9B]"}`}
              >
                <span className="font-bold text-slate-900">{item.title}</span>
                <span className="mt-1 block text-xs text-slate-500">
                  {item.date} · {item.source}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export function useLinkedClubNews(article: MatchArticle, newsItems: NewsItem[]): NewsItem | null {
  const { getValue } = useInlineEditing();
  const resolvedNewsId = getValue<string | null>(
    clubNewsOverrideKey(article.id),
    article.clubNewsId ?? null,
  );
  return resolvedNewsId ? newsItems.find((item) => item.id === resolvedNewsId) ?? null : null;
}
