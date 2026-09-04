"use client";

import { RotateCcw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { JornadaSelector } from "@/components/JornadaSelector";
import { LeagueCalculatorMatchRow } from "@/components/competicion/LeagueCalculatorMatchRow";
import { LeagueTable } from "@/components/LeagueTable";
import { SectionUnderConstructionGate } from "@/components/season/SectionUnderConstructionGate";
import { RAI_TEAM_ID } from "@/data/mock";
import { useLeagueCalculatorSeason } from "@/hooks/useLeagueCalculatorSeason";
import { applyCustomZoneColors, buildZoneLegend } from "@/lib/competition/standings-zones";
import {
  computeCalculatorStandings,
  countPendingMatches,
  countSimulatedMatches,
  type SimulatedScores,
} from "@/lib/league-calculator";
import { cn } from "@/lib/utils";

export function LeagueCalculatorView() {
  const {
    matchdays,
    teams,
    currentRound,
    defaultRound,
    totalRounds,
    standingsZones,
    zoneRules,
    tiebreak,
    highlightTeamId,
    seasonLabel,
    competitionLabel,
    bundlesLoading,
  } = useLeagueCalculatorSeason();

  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [simulations, setSimulations] = useState<SimulatedScores>({});

  const effectiveRound = selectedRound ?? defaultRound;
  const teamsById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const zoneLegend = useMemo(() => buildZoneLegend(zoneRules), [zoneRules]);

  const selectedMatchday = useMemo(
    () => matchdays.find((matchday) => matchday.round === effectiveRound),
    [effectiveRound, matchdays],
  );

  const standingsTeams = useMemo(() => {
    const base = computeCalculatorStandings(teams, matchdays, simulations, standingsZones, tiebreak);
    return applyCustomZoneColors(base, zoneRules);
  }, [teams, matchdays, simulations, standingsZones, tiebreak, zoneRules]);

  const pendingCount = useMemo(() => countPendingMatches(matchdays), [matchdays]);
  const simulatedCount = useMemo(
    () => countSimulatedMatches(matchdays, simulations),
    [matchdays, simulations],
  );

  const handleScoreChange = useCallback((matchId: string, homeScore: number | null, awayScore: number | null) => {
    setSimulations((previous) => {
      const next = { ...previous };
      if (homeScore === null || awayScore === null) {
        delete next[matchId];
        return next;
      }
      next[matchId] = { homeScore, awayScore };
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setSimulations({});
    setSelectedRound(null);
  }, []);

  const tournamentLabel = `${competitionLabel} · ${seasonLabel}`;

  return (
    <SectionUnderConstructionGate scope="masculino" section="competicion">
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <h2 className="text-3xl font-extrabold uppercase tracking-tight text-[#981915] sm:text-4xl">
              Calculadora
            </h2>
            <p className="max-w-2xl text-sm font-medium text-slate-600 sm:text-base">
              Pon los marcadores de cada jornada y mira como queda la clasificacion final del Grupo I.
            </p>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#214C9B]">{tournamentLabel}</p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            disabled={simulatedCount === 0}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border-2 border-[#214C9B]/20 bg-white px-4 py-2.5 text-sm font-bold text-[#214C9B] transition hover:bg-[#214C9B]/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw size={16} aria-hidden />
            Reiniciar
          </button>
        </header>

        {bundlesLoading ? (
          <p className="text-sm font-bold text-slate-500">Cargando calendario...</p>
        ) : matchdays.length === 0 ? (
          <p className="text-sm font-bold text-slate-500">
            No hay jornadas disponibles para esta temporada.
          </p>
        ) : (
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
            <section className="min-w-0 space-y-4">
              <div className="rounded-2xl border border-[#214C9B]/15 bg-white p-4 shadow-[0_12px_30px_rgba(17,24,39,0.05)] sm:rounded-3xl sm:p-5">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#981915] sm:text-xs">
                      Jornadas
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-600">
                      {simulatedCount > 0 ? (
                        <>
                          <span className="text-[#214C9B]">{simulatedCount}</span> de{" "}
                          <span className="text-[#214C9B]">{pendingCount}</span> pendientes simulados
                        </>
                      ) : (
                        <>
                          <span className="text-[#214C9B]">{pendingCount}</span> partidos pendientes
                        </>
                      )}
                    </p>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 sm:text-xs">
                    Actual: J{currentRound}
                  </p>
                </div>

                <JornadaSelector
                  value={effectiveRound}
                  total={totalRounds}
                  currentRound={currentRound}
                  onChange={setSelectedRound}
                  compact
                />
              </div>

              <div className="space-y-3">
                {selectedMatchday && selectedMatchday.matches.length > 0 ? (
                  selectedMatchday.matches.map((match) => (
                    <LeagueCalculatorMatchRow
                      key={match.id}
                      match={match}
                      teamsById={teamsById}
                      simulatedScore={simulations[match.id]}
                      onScoreChange={handleScoreChange}
                    />
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm font-bold text-slate-500">
                    No hay partidos en esta jornada.
                  </p>
                )}
              </div>
            </section>

            <section
              className={cn(
                "min-w-0 rounded-2xl border border-[#214C9B]/15 bg-white p-4 shadow-[0_12px_30px_rgba(17,24,39,0.05)] sm:rounded-3xl sm:p-5",
                simulatedCount > 0 && "ring-2 ring-[#981915]/15 ring-offset-2",
              )}
            >
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#981915] sm:text-xs">
                    Clasificacion
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-600">
                    {simulatedCount > 0 ? "Proyeccion con tus marcadores" : "Clasificacion actual"}
                  </p>
                </div>
                {simulatedCount > 0 ? (
                  <span className="rounded-full bg-[#981915]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#981915]">
                    Simulacion
                  </span>
                ) : null}
              </div>

              <LeagueTable
                teams={standingsTeams}
                highlightTeamId={highlightTeamId}
                clubHighlightTeamId={RAI_TEAM_ID}
                gender="masculino"
                zoneLegend={zoneLegend}
                showLegend
              />
            </section>
          </div>
        )}
      </div>
    </SectionUnderConstructionGate>
  );
}
