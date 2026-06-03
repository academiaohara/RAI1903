"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { MatchArticleNewsLinker } from "@/components/editor/MatchArticleNewsLinker";
import { EditableText } from "@/components/inline-editing/EditableText";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { usePublishedNews } from "@/hooks/usePublishedNews";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import { findMatchInBundles } from "@/lib/season/find-match-in-bundles";
import { formatDate } from "@/lib/utils";
import type { MatchArticle, NewsItem } from "@/types";
import type { Route } from "next";

type MatchArticleListProps = {
  articles: MatchArticle[];
  gender: PrimerEquipoGender;
  bundles?: SeasonBundlesMap;
};

export function MatchArticleList({ articles, gender, bundles }: MatchArticleListProps) {
  const { items: newsItems } = usePublishedNews();

  return (
    <div className="space-y-2 sm:space-y-3">
      {articles.map((article) => (
        <MatchArticleCard
          key={article.id}
          article={article}
          gender={gender}
          newsItems={newsItems}
          bundles={bundles}
        />
      ))}
    </div>
  );
}

function matchArticleLabel(article: MatchArticle, bundles?: SeasonBundlesMap): string {
  const match = bundles ? findMatchInBundles(bundles, article.matchId) : undefined;
  if (match?.status === "finished") return "Crónica";
  if (match?.status === "scheduled") return "Próximo partido";
  return article.type === "cronica" ? "Partido" : "Previa";
}

function MatchArticleCard({
  article,
  gender,
  newsItems,
  bundles,
}: {
  article: MatchArticle;
  gender: PrimerEquipoGender;
  newsItems: NewsItem[];
  bundles?: SeasonBundlesMap;
}) {
  const { editMode } = useInlineEditing();
  const href = `${primerEquipoBase(gender)}/cronicas/${article.id}` as Route;
  const typeLabel = matchArticleLabel(article, bundles);
  const content = (
    <>
      <p className="text-[9px] font-bold uppercase tracking-normal text-slate-500 sm:text-xs">
        {typeLabel} · {formatDate(article.date)} · {article.source}
      </p>
      <h2 className="mt-1 text-[13px] font-extrabold uppercase leading-snug text-[#214C9B] sm:mt-2 sm:text-lg">
        <EditableText
          storageKey={`match-article:${article.id}:title`}
          value={article.title}
          aria-label="Editar titular"
          inputClassName="font-extrabold uppercase"
        />
      </h2>
      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-600 sm:mt-2 sm:text-sm sm:leading-6">
        <EditableText
          storageKey={`match-article:${article.id}:excerpt`}
          value={article.excerpt}
          multiline
          aria-label="Editar entradilla"
          inputClassName="text-sm text-slate-700"
        />
      </p>
    </>
  );

  if (editMode) {
    return (
      <article className="rounded-xl border border-[#214C9B]/20 bg-white p-2.5 sm:rounded-2xl sm:p-4">
        {content}
        <MatchArticleNewsLinker article={article} newsItems={newsItems} />
        <Link
          href={href}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#214C9B]/20 px-3 py-2 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50"
        >
          Abrir
          <ExternalLink size={13} />
        </Link>
      </article>
    );
  }

  return (
    <Link
      href={href}
      className="block rounded-xl border border-[#214C9B]/20 bg-white p-2.5 transition hover:border-[#214C9B] hover:bg-blue-50 sm:rounded-2xl sm:p-4"
    >
      {content}
    </Link>
  );
}
