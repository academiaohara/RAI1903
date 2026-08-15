"use client";

import dynamic from "next/dynamic";

const InlineEditingToolbar = dynamic(
  () => import("@/components/inline-editing/InlineEditingProvider").then((m) => m.InlineEditingToolbar),
  { ssr: false },
);

export function InlineEditingToolbarLazy() {
  return <InlineEditingToolbar />;
}
