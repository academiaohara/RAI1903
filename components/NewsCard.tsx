"use client";

import { ArrowLeftRight, Newspaper, Pencil } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/Badge";
import { NewsEditorForm } from "@/components/editor/NewsEditorForm";
import { EditableText } from "@/components/inline-editing/EditableText";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { NewsMedia } from "@/components/NewsMedia";
import { deleteNewsItem, updateNewsItem } from "@/lib/cms/news";
import { newsCategoryBadge } from "@/lib/noticias";
import { formatNewsPublishedLabel } from "@/lib/utils";
import type { NewsItem } from "@/types";

const categoryIcons: Record<string, LucideIcon> = {
  fichajes: ArrowLeftRight,
  noticia: Newspaper,
};

type NewsCardProps = {
  item: NewsItem;
  onUpdated?: () => void;
};

export function NewsCard({ item, onUpdated }: NewsCardProps) {
  const category = newsCategoryBadge(item);
  const CategoryIcon = categoryIcons[category.key] ?? Newspaper;
  const { editMode, canEdit } = useInlineEditing();
  const [editing, setEditing] = useState(false);

  if (editing && canEdit && editMode) {
    return (
      <NewsEditorForm
        heading="Editar noticia"
        newsId={item.id}
        defaultChannel={item.channel}
        initialItem={item}
        onCancel={() => setEditing(false)}
        onSave={async (updated) => {
          const result = await updateNewsItem(updated);
          if (result.ok) {
            setEditing(false);
            onUpdated?.();
          }
          return result;
        }}
        onDelete={async () => {
          const result = await deleteNewsItem(item.id);
          if (result.ok) {
            setEditing(false);
            onUpdated?.();
          }
          return result;
        }}
      />
    );
  }

  const content = (
    <>
      <NewsMedia item={item} variant="card" />
      <div className="flex min-w-0 flex-1 flex-col justify-center p-2.5 sm:justify-between sm:p-5">
        <div>
          <h3 className="news-card-title line-clamp-2 text-[13px] font-extrabold uppercase leading-snug text-[#214C9B] sm:line-clamp-none sm:text-lg sm:leading-tight">
            <EditableText
              storageKey={`news:${item.id}:title`}
              value={item.title}
              aria-label="Editar titular de noticia"
              inputClassName="font-extrabold uppercase leading-snug"
            />
          </h3>
          <p className="news-card-excerpt mt-2 hidden line-clamp-2 text-sm leading-6 text-slate-800 sm:block sm:line-clamp-3">
            <EditableText
              storageKey={`news:${item.id}:excerpt`}
              value={item.excerpt}
              multiline
              aria-label="Editar extracto de noticia"
              inputClassName="text-sm text-slate-800"
            />
          </p>
        </div>
        <div className="mt-3 hidden flex-wrap items-center justify-between gap-2 sm:flex sm:mt-4">
          <span className="news-card-date text-xs font-medium text-[#214C9B]/65">
            {formatNewsPublishedLabel(item.date, item.time, { day: "numeric", month: "long" })} | {item.source}
          </span>
          <Badge tone={category.tone} className="news-card-badge shrink-0 gap-1.5 px-3 py-1.5">
            <CategoryIcon className="size-3.5 shrink-0" aria-hidden />
            {category.label}
          </Badge>
        </div>
      </div>
    </>
  );

  const editButton =
    canEdit && editMode ? (
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setEditing(true);
        }}
        className="absolute right-2 top-2 z-10 inline-flex size-9 items-center justify-center rounded-xl border border-[#214C9B]/25 bg-white text-[#214C9B] shadow-sm transition hover:border-[#214C9B] hover:bg-blue-50"
        aria-label="Editar noticia"
      >
        <Pencil className="size-4" aria-hidden />
      </button>
    ) : null;

  if (editMode) {
    return (
      <article className="news-card-item group relative flex min-h-[3.75rem] overflow-hidden rounded-xl border border-[#214C9B] bg-white sm:min-h-[8.5rem]">
        {editButton}
        {content}
      </article>
    );
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="news-card-item group relative flex min-h-[3.75rem] overflow-hidden rounded-xl border border-[#214C9B] bg-white sm:min-h-[8.5rem]"
    >
      {content}
    </a>
  );
}
