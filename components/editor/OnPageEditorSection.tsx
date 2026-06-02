"use client";

import type { ReactNode } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";

type OnPageEditorSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function OnPageEditorSection({ title, description, children }: OnPageEditorSectionProps) {
  const { canEdit, editMode } = useInlineEditing();

  if (!canEdit || !editMode) return null;

  return (
    <section className="rounded-2xl border border-dashed border-[#214C9B]/35 bg-blue-50/40 p-4 sm:p-5">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#214C9B]">{title}</p>
      {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
