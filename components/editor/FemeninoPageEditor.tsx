"use client";

import { FemeninoEditorPanel } from "@/components/editor/FemeninoEditorPanel";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";

/** Editor inline del calendario femenino (visible en páginas del primer equipo femenino). */
export function FemeninoPageEditor() {
  const { canEdit } = useInlineEditing();
  if (!canEdit) return null;

  return (
    <div className="mb-6">
      <FemeninoEditorPanel variant="inline" defaultTab="calendario" />
    </div>
  );
}
