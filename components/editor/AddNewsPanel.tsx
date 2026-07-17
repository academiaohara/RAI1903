"use client";

import { Plus } from "lucide-react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { dispatchOpenNewsAdd } from "@/lib/cms/news-events";
import type { NewsChannel } from "@/types";

type AddNewsPanelProps = {
  defaultChannel: NewsChannel;
  onCreated?: () => void;
};

export function AddNewsPanel({ defaultChannel }: AddNewsPanelProps) {
  const { editMode, canEdit } = useInlineEditing();

  if (!canEdit || !editMode) return null;

  return (
    <button
      type="button"
      onClick={() => dispatchOpenNewsAdd(defaultChannel)}
      className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#214C9B]/40 bg-blue-50/50 px-4 py-4 text-sm font-extrabold uppercase text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50 active:bg-blue-100"
    >
      <Plus className="size-5" aria-hidden />
      Añadir noticia
    </button>
  );
}
