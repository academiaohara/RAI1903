"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";

type EditableTextProps = {
  storageKey: string;
  value: string;
  className?: string;
  inputClassName?: string;
  multiline?: boolean;
  placeholder?: string;
  "aria-label"?: string;
};

export function EditableText({
  storageKey,
  value,
  className,
  inputClassName,
  multiline = false,
  placeholder,
  "aria-label": ariaLabel,
}: EditableTextProps) {
  const { editMode, getValue, saveValue } = useInlineEditing();
  const current = getValue(storageKey, value);
  const [draft, setDraft] = useState(current);

  useEffect(() => {
    setDraft(current);
  }, [current]);

  const save = (next: string) => {
    setDraft(next);
    saveValue(storageKey, next);
  };

  if (!editMode) {
    return <span className={className}>{current}</span>;
  }

  const editableClassName = cn(
    "w-full rounded-xl border border-[#214C9B]/25 bg-white px-3 py-2 text-inherit outline-none ring-2 ring-transparent transition focus:border-[#214C9B] focus:ring-[#214C9B]/15",
    inputClassName,
  );

  if (multiline) {
    return (
      <textarea
        value={draft}
        onChange={(event) => save(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(editableClassName, "min-h-[6rem] resize-y leading-6")}
      />
    );
  }

  return (
    <input
      value={draft}
      onChange={(event) => save(event.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={editableClassName}
    />
  );
}

export function useEditableTextValue(storageKey: string, value: string) {
  const { getValue } = useInlineEditing();
  return getValue(storageKey, value);
}
