import { applyMatchResultOverride, type MatchResultOverride } from "@/lib/calendar-match-overrides";
import { readCanteraMatchResultOverride } from "@/lib/fixture-inline-keys";
import type { CanteraCmsScope } from "@/lib/cantera/cantera-cms";
import type { Match } from "@/types";

/** Aplica overrides de edición en línea (cantera-match:*) sobre un partido de liga. */
export function applyCanteraMatchInlineOverride(
  match: Match,
  getOverride: (key: string) => unknown,
  scope: CanteraCmsScope,
): Match {
  const override = readCanteraMatchResultOverride<MatchResultOverride>(getOverride, scope, match.id);
  if (!override || Object.keys(override).length === 0) return match;
  return applyMatchResultOverride(match, override, "masculino");
}

export function applyCanteraMatchOverrides(
  matches: Match[],
  getOverride: (key: string) => unknown,
  scope: CanteraCmsScope,
): Match[] {
  return matches.map((match) => applyCanteraMatchInlineOverride(match, getOverride, scope));
}
