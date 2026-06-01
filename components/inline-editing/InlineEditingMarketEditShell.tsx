"use client";

import type { ReactNode } from "react";
import { TransferMarketEditProvider } from "@/components/editor/TransferMarketEditProvider";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";

export function InlineEditingMarketEditShell({ children }: { children: ReactNode }) {
  const { canEdit, editMode } = useInlineEditing();
  return (
    <TransferMarketEditProvider enabled={canEdit && editMode}>{children}</TransferMarketEditProvider>
  );
}
