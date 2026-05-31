"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { NewsEditorForm } from "@/components/editor/NewsEditorForm";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { createNewsId, insertNewsItem } from "@/lib/cms/news";
import type { NewsChannel, NewsItem } from "@/types";

type AddNewsPanelProps = {
  defaultChannel: NewsChannel;
  onCreated?: () => void;
};

export function AddNewsPanel({ defaultChannel, onCreated }: AddNewsPanelProps) {
  const { editMode, canEdit } = useInlineEditing();
  const [open, setOpen] = useState(false);
  const [newsId, setNewsId] = useState(createNewsId);

  if (!canEdit || !editMode) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setNewsId(createNewsId());
          setOpen(true);
        }}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#214C9B]/40 bg-blue-50/50 px-4 py-4 text-sm font-extrabold uppercase text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
      >
        <Plus className="size-4" aria-hidden />
        Añadir noticia
      </button>
    );
  }

  return (
    <NewsEditorForm
      heading="Nueva noticia"
      newsId={newsId}
      defaultChannel={defaultChannel}
      onCancel={() => setOpen(false)}
      onSave={async (item: NewsItem) => {
        const result = await insertNewsItem(item);
        if (result.ok) {
          setOpen(false);
          onCreated?.();
        }
        return result;
      }}
    />
  );
}
