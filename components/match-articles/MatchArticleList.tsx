"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { MatchArticleNewsLinker } from "@/components/editor/MatchArticleNewsLinker";
import { EditableText } from "@/components/inline-editing/EditableText";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { usePublishedNews } from "@/hooks/usePublishedNews";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import { formatDate } from "@/lib/utils";
import type { MatchArticle, NewsItem } from "@/types";
import type { Route } from "next";

type MatchArticleListProps = {
  articles: MatchArticle[];
  gender: PrimerEquipoGender;
};

export function MatchArticleList({ articles, gender }: MatchArticleListProps) {
  const { items: newsItems } = usePublishedNews();

  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <MatchArticleCard key={article.id} article={article} gender={gender} newsItems={newsItems} />
      ))}
    </div>
  );
}

function MatchArticleCard({
  article,
  gender,
  newsItems,
}: {
  article: MatchArticle;
  gender: PrimerEquipoGender;
  newsItems: NewsItem[];
}) {
  const { editMode } = useInlineEditing();
  const href = `${primerEquipoBase(gender)}/cronicas/${article.id}` as Route;
  const typeLabel = article.type === "cronica" ? "Crónica" : "Previa";
  const content = (
    <>
      <p className="text-xs font-bold uppercase tracking-normal text-slate-500">
        {typeLabel} · {formatDate(article.date)} · {article.source}
      </p>
      <h2 className="mt-2 text-lg font-extrabold uppercase text-[#214C9B]">
        <EditableText
          storageKey={`match-article:${article.id}:title`}
          value={article.title}
          aria-label="Editar titular"
          inputClassName="font-extrabold uppercase"
        />
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
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
      <article className="rounded-2xl border border-[#214C9B]/20 bg-white p-4">
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
      className="block rounded-2xl border border-[#214C9B]/20 bg-white p-4 transition hover:border-[#214C9B] hover:bg-blue-50"
    >
      {content}
    </Link>
  );
}
