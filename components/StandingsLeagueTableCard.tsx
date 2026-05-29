"use client";

import { useMemo, useState } from "react";
import { JornadaSelector } from "@/components/JornadaSelector";
import { LeagueTableCard } from "@/components/LeagueTableCard";
import { QuinielaViewToggle } from "@/components/QuinielaViewToggle";
import { PRIMERA_RFEF_RULES } from "@/lib/rfef-rules";
import { getBalancedStandingsWindow } from "@/lib/standings-window";
import {
  STANDINGS_VENUE_LABELS,
  getPlayedLeagueRounds,
  getTeamsAtRound,
  qualifyingRoundAfterJornada,
  type StandingsVenue,
} from "@/lib/standings";
import type { StandingsZonesConfig } from "@/lib/standings";
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
};

export function StandingsLeagueTableCard({
  eyebrow,
  title = "Clasificacion",
  sourceTeams,
  matchdays,
  highlightTeamId,
  centerOnHighlight = true,
  compact = false,
  className,
  borderlessHeader = false,
  zones = PRIMERA_RFEF_RULES.zones,
  tiebreak = PRIMERA_RFEF_RULES.tiebreak,
}: StandingsLeagueTableCardProps) {
  const playedRounds = useMemo(() => getPlayedLeagueRounds(matchdays), [matchdays]);
  const lastPlayedRound = playedRounds[playedRounds.length - 1] ?? 1;

  const [jornada, setJornada] = useState(lastPlayedRound);
  const [venue, setVenue] = useState<StandingsVenue>("all");

  const effectiveJornada = Math.min(jornada, lastPlayedRound);
  const qualifyingRound = qualifyingRoundAfterJornada(effectiveJornada);

  const fullTeams = useMemo(
    () => getTeamsAtRound(sourceTeams, matchdays, qualifyingRound, zones, tiebreak, venue),
    [sourceTeams, matchdays, qualifyingRound, zones, tiebreak, venue],
  );

  const tableTeams = useMemo(() => {
    if (centerOnHighlight && highlightTeamId) {
      return getBalancedStandingsWindow(fullTeams, highlightTeamId, 10);
    }
    return fullTeams.slice(0, 10);
  }, [centerOnHighlight, fullTeams, highlightTeamId]);

  const dynamicTitle =
    venue === "all" && effectiveJornada === lastPlayedRound
      ? title
      : `${title} · J${effectiveJornada} · ${STANDINGS_VENUE_LABELS[venue]}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <QuinielaViewToggle
          value={venue}
          onChange={setVenue}
          options={VENUE_OPTIONS}
          layoutId="standings-venue-toggle"
        />
        {playedRounds.length > 1 && (
          <JornadaSelector
            value={effectiveJornada}
            total={lastPlayedRound}
            currentRound={lastPlayedRound}
            onChange={setJornada}
          />
        )}
      </div>

      <LeagueTableCard
        eyebrow={eyebrow}
        title={dynamicTitle}
        teams={tableTeams}
        fullTeams={fullTeams}
        highlightTeamId={highlightTeamId}
        compact={compact}
        className={className}
        borderlessHeader={borderlessHeader}
      />
    </div>
  );
}
