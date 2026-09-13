import { getMatchArticlePageHref } from "@/lib/match-article-url";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Route } from "next";

export const MATCH_CENTER_TAB_IDS = [
  "eventos",
  "stats",
  "lineups",
  "previa",
  "valoraciones",
  "prensa",
  "resumen",
] as const;

export type MatchCenterTabId = (typeof MATCH_CENTER_TAB_IDS)[number];

const MATCH_CENTER_TAB_ID_SET = new Set<string>(MATCH_CENTER_TAB_IDS);

export function isMatchCenterTabId(value: string): value is MatchCenterTabId {
  return MATCH_CENTER_TAB_ID_SET.has(value);
}

export function getMatchArticleTabHref(
  matchId: string,
  gender: PrimerEquipoGender,
  tab: MatchCenterTabId,
  articleId?: string,
): Route | null {
  const baseHref = getMatchArticlePageHref(matchId, gender, articleId);
  if (!baseHref) return null;
  return `${baseHref}?tab=${tab}` as Route;
}

export function getMatchRatingsHref(
  matchId: string,
  gender: PrimerEquipoGender,
  articleId?: string,
): Route | null {
  return getMatchArticleTabHref(matchId, gender, "valoraciones", articleId);
}

/** Ruta absoluta para compartir (p. ej. en redes). */
export function getMatchRatingsShareUrl(
  matchId: string,
  gender: PrimerEquipoGender,
  articleId?: string,
  siteOrigin = "https://rai1903.com",
): string | null {
  const href = getMatchRatingsHref(matchId, gender, articleId);
  if (!href) return null;
  return `${siteOrigin.replace(/\/$/, "")}${href}`;
}

export function buildMatchCenterTabQuery(tab: MatchCenterTabId): string {
  return `tab=${tab}`;
}

export function matchCenterTabFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): MatchCenterTabId | undefined {
  const raw = searchParams.tab;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !isMatchCenterTabId(value)) return undefined;
  return value;
}
