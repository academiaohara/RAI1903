"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import {
  newsExcerptOverrideKey,
  newsTitleOverrideKey,
  updateNewsItem,
} from "@/lib/cms/news";
import { cn } from "@/lib/utils";
import type { NewsItem } from "@/types";

const SAVE_DEBOUNCE_MS = 450;

type NewsInlineFieldProps = {
  item: NewsItem;
  field: "title" | "excerpt";
  className?: string;
  inputClassName?: string;
  multiline?: boolean;
  "aria-label"?: string;
  onUpdated?: () => void;
};

function NewsInlineFieldEditor({
  item,
  field,
  inputClassName,
  multiline = false,
  "aria-label": ariaLabel,
  onUpdated,
}: Omit<NewsInlineFieldProps, "className">) {
  const { clearValue } = useInlineEditing();
  const [draft, setDraft] = useState(item[field]);
  const saveTimerRef = useRef<number | null>(null);
  const latestItemRef = useRef(item);

  useEffect(() => {
    latestItemRef.current = item;
  }, [item]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, []);

  const persist = useCallback(
    async (next: string) => {
      const current = latestItemRef.current;
      if (next === current[field]) return;

      const updated: NewsItem = { ...current, [field]: next };
      const result = await updateNewsItem(updated);
      if (!result.ok) return;

      clearValue(newsTitleOverrideKey(current.id));
      clearValue(newsExcerptOverrideKey(current.id));
      onUpdated?.();
    },
    [clearValue, field, onUpdated],
  );

  const scheduleSave = useCallback(
    (next: string) => {
      setDraft(next);
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = window.setTimeout(() => {
        saveTimerRef.current = null;
        void persist(next);
      }, SAVE_DEBOUNCE_MS);
    },
    [persist],
  );

  const flushSave = useCallback(() => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    void persist(draft);
  }, [draft, persist]);

  const editableClassName = cn(
    "w-full rounded-xl border border-[#214C9B]/25 bg-white px-3 py-2 text-inherit outline-none ring-2 ring-transparent transition focus:border-[#214C9B] focus:ring-[#214C9B]/15",
    inputClassName,
  );

  if (multiline) {
    return (
      <textarea
        value={draft}
        onChange={(event) => scheduleSave(event.target.value)}
        onBlur={flushSave}
        aria-label={ariaLabel}
        className={cn(editableClassName, "min-h-[6rem] resize-y leading-6")}
      />
    );
  }

  return (
    <input
      value={draft}
      onChange={(event) => scheduleSave(event.target.value)}
      onBlur={flushSave}
      aria-label={ariaLabel}
      className={editableClassName}
    />
  );
}

export function NewsInlineField({
  item,
  field,
  className,
  inputClassName,
  multiline = false,
  "aria-label": ariaLabel,
  onUpdated,
}: NewsInlineFieldProps) {
  const { editMode, canEdit } = useInlineEditing();
  const value = item[field];

  if (!editMode || !canEdit) {
    return <span className={className}>{value}</span>;
  }

  return (
    <NewsInlineFieldEditor
      key={`${item.id}:${field}:${value}`}
      item={item}
      field={field}
      inputClassName={inputClassName}
      multiline={multiline}
      aria-label={ariaLabel}
      onUpdated={onUpdated}
    />
  );
}
