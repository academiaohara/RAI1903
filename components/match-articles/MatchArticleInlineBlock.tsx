"use client";

import { EditableText } from "@/components/inline-editing/EditableText";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { formatDate } from "@/lib/utils";
import type { MatchArticle } from "@/types";

export function MatchArticleInlineBlock({
  article,
  sectionLabel,
}: {
  article: MatchArticle;
  sectionLabel?: string;
}) {
  const { editMode, getValue, saveValue } = useInlineEditing();
  const bodyKey = `match-article:${article.id}:body`;
  const fallbackBody = article.body.join("\n\n");
  const bodyText = getValue(bodyKey, fallbackBody);
  const paragraphs = bodyText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const label =
    sectionLabel ?? (article.type === "cronica" ? "Crónica" : "Previa");

  return (
    <article>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {label} · {formatDate(article.date)} · {article.source}
      </p>
      <h1 className="mt-3 text-2xl font-extrabold uppercase leading-tight text-[#214C9B] sm:text-4xl">
        <EditableText
          storageKey={`match-article:${article.id}:title`}
          value={article.title}
          aria-label="Editar titular del artículo"
          inputClassName="font-extrabold uppercase leading-tight"
        />
      </h1>
      <p className="mt-3 text-base font-semibold leading-7 text-slate-700">
        <EditableText
          storageKey={`match-article:${article.id}:excerpt`}
          value={article.excerpt}
          multiline
          aria-label="Editar entradilla del artículo"
          inputClassName="text-base font-semibold text-slate-700"
        />
      </p>

      <div className="mt-6 border-t border-slate-100 pt-6">
        {editMode ? (
          <textarea
            value={bodyText}
            onChange={(event) => saveValue(bodyKey, event.target.value)}
            aria-label="Editar cuerpo del artículo"
            className="min-h-[14rem] w-full resize-y rounded-2xl border border-[#214C9B]/25 bg-white px-4 py-3 text-sm leading-7 text-slate-800 outline-none ring-2 ring-transparent focus:border-[#214C9B] focus:ring-[#214C9B]/15"
          />
        ) : (
          <div className="space-y-4 text-sm leading-7 text-slate-700 sm:text-base">
            {paragraphs.map((paragraph, index) => (
              <p key={`${article.id}-paragraph-${index}`}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
