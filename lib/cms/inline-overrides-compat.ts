export function isMissingSeasonIdColumnError(message: string | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return lower.includes("season_id") && (lower.includes("does not exist") || lower.includes("column"));
}
