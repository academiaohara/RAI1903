"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { EditableText } from "@/components/inline-editing/EditableText";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import { formatDate } from "@/lib/utils";
import type { MatchArticle } from "@/types";
import type { Route } from "next";

type MatchArticleListProps = {
  articles: MatchArticle[];
  gender: PrimerEquipoGender;
  type: MatchArticle["type"];
};

export function MatchArticleList({ articles, gender, type }: MatchArticleListProps) {
  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <MatchArticleCard key={article.id} article={article} gender={gender} type={type} />
      ))}
    </div>
  );
}

function MatchArticleCard({
  article,
  gender,
  type,
}: {
  article: MatchArticle;
  gender: PrimerEquipoGender;
  type: MatchArticle["type"];
}) {
  const { editMode } = useInlineEditing();
  const href = `${primerEquipoBase(gender)}/${type === "cronica" ? "cronicas" : "previas"}/${article.id}` as Route;
  const content = (
    <>
      <p className="text-xs font-bold uppercase tracking-normal text-slate-500">
        {formatDate(article.date)} · {article.source}
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
