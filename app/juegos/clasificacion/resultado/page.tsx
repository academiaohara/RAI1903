"use client";

import { useMemo } from "react";
import { PageHero } from "@/components/PageHero";
import { StandingsLeagueTableCard } from "@/components/StandingsLeagueTableCard";
import { useSeason } from "@/components/season/SeasonProvider";
import { useQuinielaSeason } from "@/hooks/useQuinielaSeason";
import { zonesToLegacyConfig } from "@/lib/cms/competition-config-bundle";
import { PRIMERA_RFEF_RULES } from "@/lib/rfef-rules";

export default function ClasificacionResultadoPage() {
  const { getCompetitionConfig } = useSeason();
  const { teams, leagueMatchdays, highlightTeamId, bundlesLoading } = useQuinielaSeason();
  const competitionConfig = useMemo(() => getCompetitionConfig("masculino"), [getCompetitionConfig]);
  const standingsZones = useMemo(
    () => zonesToLegacyConfig(competitionConfig.zones),
    [competitionConfig.zones],
  );

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Clasificación"
        title="Resultado"
        description="Clasificación actual del Grupo I con puntos, goles, forma y zonas de ascenso y descenso."
      />

      {bundlesLoading ? (
        <p className="text-sm font-bold text-slate-500">Cargando clasificación…</p>
      ) : (
        <StandingsLeagueTableCard
          eyebrow="Grupo I"
          title="Clasificación"
          sourceTeams={teams}
          matchdays={leagueMatchdays}
          highlightTeamId={highlightTeamId}
          centerOnHighlight={false}
          gender="masculino"
          zones={standingsZones}
          zoneRules={competitionConfig.zones}
          tiebreak={PRIMERA_RFEF_RULES.tiebreak}
        />
      )}
    </div>
  );
}
