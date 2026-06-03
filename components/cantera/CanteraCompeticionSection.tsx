"use client";

import { useMemo } from "react";
import { Card } from "@/components/Card";
import { LeagueTableCard } from "@/components/LeagueTableCard";
import { MatchCard } from "@/components/MatchCard";
import { isMatchPlayed } from "@/lib/match-result";
import { getBalancedStandingsWindow } from "@/lib/standings-window";
import type { StandingsLegendItem } from "@/lib/standings-styles";
import type { Match, Team } from "@/types";

type CanteraCompeticionSectionProps = {
  standings: Team[];
  highlightTeamId: string;
  calendarMatches: Match[];
  zoneLegend?: StandingsLegendItem[];
  isClubHighlight?: (team: Team) => boolean;
};

export function CanteraCompeticionSection({
  standings,
  highlightTeamId,
  calendarMatches,
  zoneLegend,
  isClubHighlight,
}: CanteraCompeticionSectionProps) {
  const tableTeams = useMemo(
    () => getBalancedStandingsWindow(standings, highlightTeamId, 10),
    [standings, highlightTeamId],
  );

  const { latest, upcoming } = useMemo(() => {
    const clubMatches = calendarMatches.filter(
      (match) => match.homeTeamId === highlightTeamId || match.awayTeamId === highlightTeamId,
    );
    const finished = clubMatches.filter((match) => isMatchPlayed(match));
    const scheduled = clubMatches.filter((match) => !isMatchPlayed(match));

    const latestMatches = [...finished]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    const upcomingMatches = [...scheduled]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);

    return { latest: latestMatches, upcoming: upcomingMatches };
  }, [calendarMatches, highlightTeamId]);

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <LeagueTableCard
        eyebrow="Liga"
        title="Clasificacion"
        teams={tableTeams}
        fullTeams={standings}
        highlightTeamId={highlightTeamId}
        compact
        borderlessHeader
        showCrests={false}
        showLegend
        zoneLegend={zoneLegend}
        isClubHighlight={isClubHighlight}
      />

      <div className="grid gap-6">
        <Card eyebrow="Forma reciente" title="Ultimos resultados" borderlessHeader>
          <div className="space-y-2 sm:space-y-3">
            {latest.length > 0 ? (
              latest.map((match) => (
                <MatchCard key={match.id} match={match} compact highlightTeamId={highlightTeamId} />
              ))
            ) : (
              <p className="text-sm font-bold text-slate-500">Sin partidos finalizados.</p>
            )}
          </div>
        </Card>

        <Card eyebrow="Calendario" title="Proximos partidos" borderlessHeader>
          <div className="space-y-2 sm:space-y-3">
            {upcoming.length > 0 ? (
              upcoming.map((match) => (
                <MatchCard key={match.id} match={match} compact highlightTeamId={highlightTeamId} />
              ))
            ) : (
              <p className="text-sm font-bold text-slate-500">Sin partidos programados.</p>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
