import type { PrimerEquipoGender } from "@/lib/primer-equipo";

const LEGACY_MATCH_RESULT_PREFIX = "match-result:";
const LEGACY_JORNADA_ROUND_PREFIX = "jornada-round:";

export function matchResultOverrideKey(gender: PrimerEquipoGender, matchId: string): string {
  return `${LEGACY_MATCH_RESULT_PREFIX}${gender}:${matchId}`;
}

export function jornadaRoundOverrideKey(
  gender: PrimerEquipoGender,
  roundId: string,
  field: "label" | "short-date",
): string {
  return `${LEGACY_JORNADA_ROUND_PREFIX}${gender}:${roundId}:${field}`;
}

export function readMatchResultOverride<T>(
  getOverride: (key: string) => unknown,
  gender: PrimerEquipoGender,
  matchId: string,
): T | undefined {
  const scoped = getOverride(matchResultOverrideKey(gender, matchId));
  if (scoped !== undefined) return scoped as T;
  if (gender === "masculino") {
    const legacy = getOverride(`${LEGACY_MATCH_RESULT_PREFIX}${matchId}`);
    if (legacy !== undefined) return legacy as T;
  }
  return undefined;
}

export function readJornadaRoundOverride<T>(
  getOverride: (key: string) => unknown,
  getValue: (key: string, fallback: T) => T,
  gender: PrimerEquipoGender,
  roundId: string,
  field: "label" | "short-date",
  fallback: T,
): T {
  const scopedKey = jornadaRoundOverrideKey(gender, roundId, field);
  const scoped = getOverride(scopedKey);
  if (scoped !== undefined) return scoped as T;
  if (gender === "masculino") {
    return getValue(`${LEGACY_JORNADA_ROUND_PREFIX}${roundId}:${field}`, fallback);
  }
  return fallback;
}

export function shouldCopyInlineOverrideKey(key: string): boolean {
  if (key.startsWith(LEGACY_MATCH_RESULT_PREFIX)) {
    const rest = key.slice(LEGACY_MATCH_RESULT_PREFIX.length);
    return rest.startsWith("masculino:") || rest.startsWith("femenino:");
  }
  if (key.startsWith(LEGACY_JORNADA_ROUND_PREFIX)) {
    const rest = key.slice(LEGACY_JORNADA_ROUND_PREFIX.length);
    return rest.startsWith("masculino:") || rest.startsWith("femenino:");
  }
  return true;
}
