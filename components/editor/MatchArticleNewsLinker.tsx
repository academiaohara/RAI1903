"use client";

import { Link2, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ClubChronicleCard } from "@/components/match-center/ClubChronicleCard";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { newsTagLabels } from "@/lib/noticias";
import type { MatchArticle, NewsChannel, NewsItem, NewsTag } from "@/types";

const clubNewsOverrideKey = (articleId: string) => `match-article:${articleId}:clubNewsId`;

const FILTER_TAGS: Array<NewsTag | "todas"> = [
  "todas",
  "cronica",
  "partido",
  "previa",
  "club",
  "fichajes",
  "cantera",
  "lesionados",
  "rumores",
  "renovaciones",
  "entrevistas",
  "otros",
];

type MatchArticleNewsLinkerProps = {
  article: MatchArticle;
  newsItems: NewsItem[];
};

function resolveNewsIdFromInput(input: string, items: NewsItem[]): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const byId = items.find((item) => item.id === trimmed);
  if (byId) return byId.id;

  const normalized = trimmed.toLowerCase().replace(/\/$/, "");
  const byUrl = items.find((item) => {
    const url = item.url.toLowerCase().replace(/\/$/, "");
    return url === normalized || url.includes(normalized) || normalized.includes(url);
  });
  return byUrl?.id ?? null;
}

export function MatchArticleNewsLinker({ article, newsItems }: MatchArticleNewsLinkerProps) {
  const { editMode, canEdit, getValue, saveValue, clearValue } = useInlineEditing();
  const suggestedTag: NewsTag = article.type === "cronica" ? "cronica" : "previa";

  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<NewsTag | "todas">(suggestedTag);
  const [channel, setChannel] = useState<NewsChannel | "todas">("club");
  const [manualInput, setManualInput] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);

  const resolvedNewsId = getValue<string | null>(
    clubNewsOverrideKey(article.id),
    article.clubNewsId ?? null,
  );

  const linkedNews = useMemo(
    () => (resolvedNewsId ? newsItems.find((item) => item.id === resolvedNewsId) ?? null : null),
    [newsItems, resolvedNewsId],
  );

  const filtered = useMemo(
    () =>
      newsItems.filter((item) => {
        const haystack = `${item.title} ${item.excerpt} ${item.source} ${item.id}`.toLowerCase();
        const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
        const matchesTag = tag === "todas" || item.tags.includes(tag);
        const matchesChannel = channel === "todas" || item.channel === channel;
        return matchesQuery && matchesTag && matchesChannel;
      }),
    [channel, newsItems, query, tag],
  );

  const linkManual = () => {
    const id = resolveNewsIdFromInput(manualInput, newsItems);
    if (!id) {
      setManualError("No encontramos esa noticia. Pega el ID o la URL de /noticias.");
      return;
    }
    setManualError(null);
    saveValue(clubNewsOverrideKey(article.id), id);
    setManualInput("");
  };

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
        Noticia oficial
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Elige una noticia publicada o pega su ID o URL (como en Noticias → Club).
      </p>

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
      ) : null}

      <div className="mt-4 space-y-2">
        <label className="text-xs font-bold uppercase text-slate-500" htmlFor={`manual-news-${article.id}`}>
          ID o URL de la noticia
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id={`manual-news-${article.id}`}
            type="text"
            value={manualInput}
            onChange={(event) => {
              setManualInput(event.target.value);
              setManualError(null);
            }}
            placeholder="Ej. club-comunicado-j38 o https://realavilesindustrial1903.com/..."
            className="min-w-0 flex-1 rounded-xl border border-[#214C9B]/25 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#214C9B]"
          />
          <button
            type="button"
            onClick={linkManual}
            disabled={!manualInput.trim()}
            className="shrink-0 rounded-xl bg-[#214C9B] px-4 py-2.5 text-xs font-bold uppercase text-white transition hover:bg-[#1a3d7d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Vincular
          </button>
        </div>
        {manualError ? <p className="text-xs text-red-600">{manualError}</p> : null}
      </div>

      <div className="mt-4 space-y-3 border-t border-[#214C9B]/15 pt-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por titular, extracto o fuente..."
            className="w-full rounded-xl border border-[#214C9B]/25 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#214C9B]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(["todas", "club", "prensa"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setChannel(item)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase transition ${channel === item ? "border-[#214C9B] bg-[#214C9B] text-white" : "border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50"}`}
            >
              {item === "todas" ? "Todos" : item === "club" ? "Club" : "Prensa"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTER_TAGS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTag(item)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase transition ${tag === item ? "border-[#214C9B] bg-[#214C9B] text-white" : "border-[#214C9B]/20 bg-white text-slate-700 hover:bg-blue-50"}`}
            >
              {item === "todas" ? "Todas" : newsTagLabels[item]}
            </button>
          ))}
        </div>

        <ul className="max-h-56 space-y-2 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="text-sm text-slate-500">
              No hay noticias con esos filtros. Prueba otra etiqueta o añade la nota en Noticias.
            </li>
          ) : (
            filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => saveValue(clubNewsOverrideKey(article.id), item.id)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition ${resolvedNewsId === item.id ? "border-[#214C9B] bg-white ring-1 ring-[#214C9B]/30" : "border-[#214C9B]/15 bg-white hover:border-[#214C9B]"}`}
                >
                  <span className="font-bold text-slate-900">{item.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {item.date} · {item.source} · {item.channel}
                    {item.tags.length > 0 ? ` · ${item.tags.map((t) => newsTagLabels[t]).join(", ")}` : ""}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
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
