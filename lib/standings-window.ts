import type { Team } from "@/types";

/** Up to `windowAbove` + self + `windowBelow` teams; missing slots filled from the other side. */
export function getStandingsWindow(
  teams: Team[],
  highlightTeamId: string,
  windowAbove = 3,
  windowBelow = 3,
): Team[] {
  const sorted = [...teams].sort((a, b) => a.position - b.position);
  const index = sorted.findIndex((team) => team.id === highlightTeamId);
  if (index === -1) return sorted.slice(0, windowAbove + windowBelow + 1);

  let above = Math.min(windowAbove, index);
  let below = Math.min(windowBelow, sorted.length - 1 - index);

  below = Math.min(sorted.length - 1 - index, below + (windowAbove - above));
  above = Math.min(index, above + (windowBelow - below));

  return sorted.slice(index - above, index + below + 1);
}
