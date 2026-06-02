import type { CompetitionZoneRule } from "@/lib/cms/competition-config-bundle";
import type { StandingsZone, Team } from "@/types";

export type ResolvedZoneAtPosition = {
  rule: CompetitionZoneRule;
  legacyZone: StandingsZone;
};

/** Asigna regla de zona por posición (1-based). */
export function zoneRuleAtPosition(
  position: number,
  teamCount: number,
  rules: CompetitionZoneRule[],
): ResolvedZoneAtPosition | null {
  const topRules = rules.filter((r) => r.from === "top");
  const bottomRules = rules.filter((r) => r.from === "bottom");

  let cursor = 1;
  for (const rule of topRules) {
    const end = cursor + rule.count - 1;
    if (position >= cursor && position <= end) {
      return { rule, legacyZone: legacyZoneFromRuleId(rule.id) };
    }
    cursor = end + 1;
  }

  let bottomCursor = teamCount;
  for (const rule of bottomRules) {
    const start = bottomCursor - rule.count + 1;
    if (position >= start && position <= bottomCursor) {
      return { rule, legacyZone: legacyZoneFromRuleId(rule.id) };
    }
    bottomCursor = start - 1;
  }

  return null;
}

function legacyZoneFromRuleId(id: string): StandingsZone {
  if (id === "promotion") return "promotion";
  if (id === "playoff") return "playoff";
  if (id === "relegation") return "relegation";
  if (id === "playout") return "playout";
  return "mid";
}

export function zoneColorClassAtPosition(
  position: number,
  teamCount: number,
  rules: CompetitionZoneRule[],
): string | undefined {
  return zoneRuleAtPosition(position, teamCount, rules)?.rule.colorClass;
}

export function buildZoneLegend(rules: CompetitionZoneRule[]) {
  return rules.map((rule) => ({
    zone: legacyZoneFromRuleId(rule.id),
    label: rule.label,
    className: rule.colorClass,
    id: rule.id,
  }));
}

export function applyCustomZoneColors(teams: Team[], rules: CompetitionZoneRule[]): Team[] {
  const count = teams.length;
  return teams.map((team) => {
    const resolved = zoneRuleAtPosition(team.position, count, rules);
    if (!resolved) return team;
    return {
      ...team,
      zone: resolved.legacyZone,
      zoneColorClass: resolved.rule.colorClass,
    };
  });
}
