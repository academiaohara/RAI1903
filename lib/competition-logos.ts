import type { CompetitionId } from "@/types";

/** Public paths for competition badges (see /public/competiciones). */
export const COMPETITION_LOGO_PATHS: Partial<Record<CompetitionId, string>> = {
  "primera-rfef": "/competiciones/primera-rfef.png",
  "liga-raij903": "/competiciones/primera-rfef.png",
  "copa-rey": "/competiciones/copa-rey.png",
};

export function getCompetitionLogo(competition: CompetitionId | string): string | null {
  return COMPETITION_LOGO_PATHS[competition as CompetitionId] ?? null;
}
