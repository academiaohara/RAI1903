import { getTeam } from "@/lib/fixtures";
import type { CSSProperties } from "react";

export const DEFAULT_TEAM_COLORS: [string, string] = ["#214C9B", "#FFFFFF"];

/** Franjas verticales uniformes (mismo ángulo y ancho en todos los equipos). */
const STRIPE_CYCLE_PERCENT = 22;
const STRIPE_PRIMARY_SHARE = 11;

export function resolveTeamColors(colors?: string[]): [string, string] {
  const primary = colors?.[0]?.trim();
  const secondary = colors?.[1]?.trim();
  if (primary && secondary) return [primary, secondary];
  if (primary) return [primary, DEFAULT_TEAM_COLORS[1]];
  return DEFAULT_TEAM_COLORS;
}

/** CMS bundle → mock por id → fallback club. */
export function resolveTeamColorsFromSources(teamId: string, cmsColors?: string[]): [string, string] {
  if (cmsColors?.some((color) => color?.trim())) {
    return resolveTeamColors(cmsColors);
  }
  const mock = getTeam(teamId);
  if (mock?.colors?.some((color) => color?.trim())) {
    return resolveTeamColors(mock.colors);
  }
  return DEFAULT_TEAM_COLORS;
}

export function teamStripeBackgroundStyle(colors?: string[]): CSSProperties {
  const [primary, secondary] = resolveTeamColors(colors);

  return {
    background: `repeating-linear-gradient(90deg, ${primary} 0, ${primary} ${STRIPE_PRIMARY_SHARE}%, ${secondary} ${STRIPE_PRIMARY_SHARE}%, ${secondary} ${STRIPE_CYCLE_PERCENT}%)`,
  };
}
