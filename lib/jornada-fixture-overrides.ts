import { isMatchPlayed } from "@/lib/match-result";
import type { JornadaFixture } from "@/types/jornadas";

/** Aplica un override de edición en línea sobre un partido de jornada. */
export function applyJornadaFixtureOverride(
  fixture: JornadaFixture,
  override: Partial<JornadaFixture> | undefined,
): JornadaFixture {
  if (!override || Object.keys(override).length === 0) return fixture;

  const merged: JornadaFixture = { ...fixture, ...override };

  if (override.homeScore !== undefined && override.awayScore !== undefined) {
    merged.status = "finished";
  }

  if (override.status === "scheduled") {
    merged.homeScore = undefined;
    merged.awayScore = undefined;
  } else if (isMatchPlayed(merged) && merged.status !== "finished") {
    merged.status = "finished";
  }

  if (isMatchPlayed(merged)) {
    merged.kickoffTime = undefined;
  }

  return merged;
}
