/** Días tras el partido en los que se puede votar. */
export const MATCH_RATING_VOTING_DAYS = 3;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Fecha límite de votación (fin del partido + ventana). */
export function getMatchRatingVotingDeadline(matchDate: string): Date {
  const kickoff = new Date(matchDate);
  if (Number.isNaN(kickoff.getTime())) {
    return new Date(Date.now() + MATCH_RATING_VOTING_DAYS * MS_PER_DAY);
  }
  return new Date(kickoff.getTime() + MATCH_RATING_VOTING_DAYS * MS_PER_DAY);
}

export function isMatchRatingVotingOpen(matchDate: string, now = Date.now()): boolean {
  return now < getMatchRatingVotingDeadline(matchDate).getTime();
}

export type VotingCountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
};

/** Tiempo restante hasta el cierre de votación (0 si ya cerró). */
export function getMatchRatingVotingCountdown(
  matchDate: string,
  now = Date.now(),
): VotingCountdownParts {
  const remaining = Math.max(0, getMatchRatingVotingDeadline(matchDate).getTime() - now);
  const totalSeconds = Math.floor(remaining / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalMs: remaining,
  };
}

export function formatVotingCountdown(parts: VotingCountdownParts): string {
  const segments = [
    parts.days > 0 ? `${parts.days}d` : null,
    `${String(parts.hours).padStart(2, "0")}h`,
    `${String(parts.minutes).padStart(2, "0")}m`,
    `${String(parts.seconds).padStart(2, "0")}s`,
  ].filter(Boolean);

  return segments.join(" ");
}
