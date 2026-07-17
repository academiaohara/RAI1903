"use client";

import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";

export function EditorBottomSpacer() {
  const { editMode } = useInlineEditing();

  if (!editMode) return null;

  return (
    <div
      className="pointer-events-none shrink-0 sm:hidden"
      style={{ height: "calc(5.5rem + env(safe-area-inset-bottom))" }}
      aria-hidden
    />
  );
}
