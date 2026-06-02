"use client";

import { useMemo, useState } from "react";
import { JornadaSelector } from "@/components/JornadaSelector";
import { LeagueTableCard } from "@/components/LeagueTableCard";
import { QuinielaViewToggle } from "@/components/QuinielaViewToggle";
import { PRIMERA_RFEF_RULES } from "@/lib/rfef-rules";
import { getBalancedStandingsWindow } from "@/lib/standings-window";
import {
  STANDINGS_VENUE_LABELS,
  getLastPlayedLeagueRound,
  getPlayedLeagueRounds,
  getTeamsAtRound,
  qualifyingRoundAfterJornada,
  type StandingsVenue,
} from "@/lib/standings";
import type { CompetitionZoneRule } from "@/lib/cms/competition-config-bundle";
import { applyCustomZoneColors, buildZoneLegend } from "@/lib/competition/standings-zones";
import type { StandingsZonesConfig } from "@/lib/standings";
import type { StandingsLegendItem } from "@/lib/standings-styles";
import { cn } from "@/lib/utils";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Matchday } from "@/types";
import type { LeagueTiebreakContext } from "@/lib/rfef-rules/types";
import type { Team } from "@/types";

const VENUE_OPTIONS: { id: StandingsVenue; label: string }[] = [
  { id: "all", label: STANDINGS_VENUE_LABELS.all },
  { id: "home", label: STANDINGS_VENUE_LABELS.home },
  { id: "away", label: STANDINGS_VENUE_LABELS.away },
];

type StandingsLeagueTableCardProps = {
  eyebrow?: string;
  title?: string;
  sourceTeams: Team[];
  matchdays: Matchday[];
  highlightTeamId: string;
  /** Centra la tabla en el equipo destacado (10 filas). Si es falso, muestra el top 10. */
  centerOnHighlight?: boolean;
  compact?: boolean;
  className?: string;
  borderlessHeader?: boolean;
  zones?: StandingsZonesConfig;
  tiebreak?: LeagueTiebreakContext;
  gender?: PrimerEquipoGender;
  zoneRules?: CompetitionZoneRule[];
};

export function StandingsLeagueTableCard({
  eyebrow,
  title = "Clasificacion y jornada",
  sourceTeams,
  matchdays,
  highlightTeamId,
  centerOnHighlight = true,
  compact = false,
  className,
  borderlessHeader = false,
  zones = PRIMERA_RFEF_RULES.zones,
  tiebreak = PRIMERA_RFEF_RULES.tiebreak,
  gender = "masculino",
  zoneRules,
}: StandingsLeagueTableCardProps) {
  const zoneLegend: StandingsLegendItem[] | undefined = zoneRules ? buildZoneLegend(zoneRules) : undefined;
  const playedRounds = useMemo(() => getPlayedLeagueRounds(matchdays), [matchdays]);
  const lastPlayedRound = useMemo(() => getLastPlayedLeagueRound(matchdays), [matchdays]);

  const [jornadaOverride, setJornadaOverride] = useState<number | null>(null);
  const [venue, setVenue] = useState<StandingsVenue>("all");

  const effectiveJornada = Math.min(jornadaOverride ?? lastPlayedRound, lastPlayedRound);
  const qualifyingRound = qualifyingRoundAfterJornada(effectiveJornada);

  const fullTeams = useMemo(() => {
    let base = getTeamsAtRound(sourceTeams, matchdays, qualifyingRound, zones, tiebreak, venue);
    if (zoneRules) base = applyCustomZoneColors(base, zoneRules);
    if (base.length > 0 && base.every((team) => team.stats.played === 0)) {
      return [...base]
        .sort((a, b) => a.name.localeCompare(b.name, "es"))
        .map((team, index) => ({ ...team, position: index + 1 }));
    }
    return base;
  }, [sourceTeams, matchdays, qualifyingRound, zones, tiebreak, venue, zoneRules]);

  const tableTeams = useMemo(() => {
    if (centerOnHighlight && highlightTeamId) {
      return getBalancedStandingsWindow(fullTeams, highlightTeamId, 10);
    }
    return fullTeams.slice(0, 10);
  }, [centerOnHighlight, fullTeams, highlightTeamId]);

  const modalTitle =
    venue === "all" && effectiveJornada === lastPlayedRound
      ? title
      : `${title} · J${effectiveJornada} · ${STANDINGS_VENUE_LABELS[venue]}`;

  const toolbar = (
    <>
      <QuinielaViewToggle
        value={venue}
        onChange={setVenue}
        options={VENUE_OPTIONS}
        layoutId="standings-venue-toggle"
      />
      {playedRounds.length > 1 && (
        <JornadaSelector
          compact
          value={effectiveJornada}
          total={lastPlayedRound}
          currentRound={lastPlayedRound}
          onChange={setJornadaOverride}
        />
      )}
    </>
  );

  return (
    <LeagueTableCard
      eyebrow={eyebrow}
      title={title}
      modalTitle={modalTitle}
      teams={tableTeams}
      fullTeams={fullTeams}
      highlightTeamId={highlightTeamId}
      compact={compact}
      className={cn("min-w-0", className)}
      borderlessHeader={borderlessHeader}
      toolbar={toolbar}
      gender={gender}
      zoneLegend={zoneLegend}
    />
  );
}
