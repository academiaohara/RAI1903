"use client";

import { useMemo } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { applyCanteraMatchOverrides } from "@/lib/cantera/cantera-fixture-overrides";
import type { CanteraCmsScope } from "@/lib/cantera/cantera-cms";
import type { Match } from "@/types";

/** Partidos de liga cantera (filial/juvenil) con overrides de edición en línea. */
export function useEditedCanteraMatches(matches: Match[], scope: CanteraCmsScope): Match[] {
  const { getOverride } = useInlineEditing();

  return useMemo(
    () => applyCanteraMatchOverrides(matches, getOverride, scope),
    [matches, getOverride, scope],
  );
}
