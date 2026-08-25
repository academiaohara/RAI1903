"use client";

import { useMemo, useState } from "react";
import { Pencil, X } from "lucide-react";
import { OpponentCrest } from "@/components/OpponentCrest";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import { getCompeticionSquadData } from "@/lib/competicion-squad";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import {
  formatMatchGoalsSummary,
  findLastFinishedMatchForTeam,
  readMatchGoalsOverride,
} from "@/lib/match-goals";
import { formatMatchScore } from "@/lib/match-result";
import { getTeamById } from "@/lib/quiniela";
import { getTeamCrestById } from "@/lib/team-crests";
import { resolveTeamColorsFromSources, teamDiagonalStripeBackgroundStyle, DEFAULT_TEAM_COLORS } from "@/lib/team-stripes";
import { cn, formatMatchDate } from "@/lib/utils";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { JornadaFixture } from "@/types/jornadas";
import type { Matchday } from "@/types";

type MatchGoalsSummaryProps = {
  fixture: JornadaFixture;
  gender?: PrimerEquipoGender;
};

export function MatchGoalsSummary({ fixture, gender = "masculino" }: MatchGoalsSummaryProps) {
  const { getOverride } = useInlineEditing();
  const { bundles, viewedSeason } = useSeason();
  const teams = useMemo(() => resolveGroupTeams(bundles, gender, "1"), [bundles, gender]);

  const goals = readMatchGoalsOverride(getOverride, gender, fixture.id)?.goals ?? [];
  if (goals.length === 0 || fixture.status !== "finished") return null;

  const homeTeam = teams.find((team) => team.id === fixture.homeTeamId);
  const awayTeam = teams.find((team) => team.id === fixture.awayTeamId);
  const homeSquad = homeTeam
    ? getCompeticionSquadData(gender, homeTeam, bundles, viewedSeason.label).squad
    : [];
  const awaySquad = awayTeam
    ? getCompeticionSquadData(gender, awayTeam, bundles, viewedSeason.label).squad
    : [];

  const summary = formatMatchGoalsSummary(
    goals,
    fixture.homeTeamName,
    fixture.awayTeamName,
    homeSquad,
    awaySquad,
  );

  return (
    <p className="rounded-xl border border-[#214C9B]/10 bg-white/70 px-3 py-2 text-center text-[10px] font-semibold text-slate-600 sm:text-xs">
      {summary}
    </p>
  );
}

type SupportedTeamPickerProps = {
  teams: Array<{ id: string; name: string; shortName?: string; crestInitials?: string; colors?: string[] }>;
  value: string;
  onChange: (teamId: string) => void;
  disabled?: boolean;
};

export function SupportedTeamPicker({ teams, value, onChange, disabled }: SupportedTeamPickerProps) {
  const [editing, setEditing] = useState(false);
  const selectedTeam = teams.find((team) => team.id === value);
  const displayName = selectedTeam?.name ?? selectedTeam?.shortName ?? "Elige tu equipo";
  const selectedColors = selectedTeam
    ? resolveTeamColorsFromSources(selectedTeam.id, selectedTeam.colors)
    : DEFAULT_TEAM_COLORS;
  const [primaryColor] = selectedColors;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#214C9B]/15 bg-white">
      <div
        aria-hidden
        className="absolute inset-y-0 left-1/2 right-0"
        style={teamDiagonalStripeBackgroundStyle(selectedColors, { stripeWidth: 18, angle: -52 })}
      />

      {!disabled ? (
        <div className="absolute right-3 top-3 z-30 sm:right-4 sm:top-4">
          {editing ? (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/95 text-slate-500 shadow-sm transition hover:bg-white"
              aria-label="Cerrar selector de equipo"
            >
              <X size={14} aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/95 text-slate-700 shadow-sm transition hover:bg-white"
              aria-label="Cambiar equipo"
            >
              <Pencil size={14} aria-hidden />
            </button>
          )}
        </div>
      ) : null}

      <div className="relative flex min-h-[6.5rem] items-stretch sm:min-h-[7.5rem]">
        <div className="relative z-10 flex w-1/2 min-w-0 flex-col justify-center px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Tu equipo</p>
          <p
            className="mt-1.5 text-[clamp(1.1rem,4.8vw,1.85rem)] font-extrabold uppercase leading-[0.9] tracking-tight"
            style={{ color: primaryColor }}
          >
            {displayName}
          </p>
        </div>

        {selectedTeam && !editing ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-[62%] items-center justify-end overflow-hidden"
          >
            <OpponentCrest
              logo={getTeamCrestById(
                selectedTeam.id,
                selectedTeam.crestInitials ?? selectedTeam.shortName ?? selectedTeam.name,
              )}
              opponent={selectedTeam.name}
              teamId={selectedTeam.id}
              size="lg"
              className="h-[10.5rem] w-[10.5rem] max-w-none translate-x-[24%] drop-shadow-[0_16px_24px_rgba(0,0,0,0.28)] sm:h-[12.5rem] sm:w-[12.5rem] sm:translate-x-[20%]"
            />
          </div>
        ) : null}
      </div>

      {editing && !disabled ? (
        <div className="absolute inset-y-0 left-1/2 right-0 z-20 overflow-y-auto p-2 sm:p-3">
          <div className="flex h-full flex-wrap content-center justify-center gap-1.5 sm:gap-2">
            {teams.map((team) => {
              const selected = team.id === value;
              const crest = getTeamCrestById(team.id, team.crestInitials ?? team.shortName ?? team.name);
              const colors = resolveTeamColorsFromSources(team.id, team.colors);

              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => {
                    onChange(team.id);
                    setEditing(false);
                  }}
                  className={cn(
                    "flex aspect-square w-[calc(25%-0.375rem)] min-w-[2.65rem] max-w-[3.35rem] items-center justify-center rounded-xl p-1 shadow-sm ring-1 ring-black/10 transition sm:w-[calc(20%-0.5rem)] sm:max-w-[3.75rem]",
                    selected
                      ? "z-10 scale-105 ring-2 ring-white ring-offset-2 ring-offset-transparent"
                      : "hover:scale-105 hover:ring-white/80",
                  )}
                  style={teamDiagonalStripeBackgroundStyle(colors, { stripeWidth: 10, angle: -52 })}
                  aria-pressed={selected}
                  aria-label={team.name}
                  title={team.name}
                >
                  <OpponentCrest
                    logo={crest}
                    opponent={team.name}
                    teamId={team.id}
                    size="sm"
                    className="relative z-10 h-[68%] w-[68%] max-w-none drop-shadow-[0_3px_8px_rgba(0,0,0,0.4)]"
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SupportedTeamLastMatch({
  supportedTeamId,
  matchdays,
  gender = "masculino",
}: {
  supportedTeamId: string;
  matchdays: Matchday[];
  gender?: PrimerEquipoGender;
}) {
  const { getOverride } = useInlineEditing();
  const { bundles, viewedSeason } = useSeason();
  const teams = useMemo(() => resolveGroupTeams(bundles, gender, "1"), [bundles, gender]);
  const team = getTeamById(supportedTeamId, teams);

  const lastMatch = useMemo(
    () => findLastFinishedMatchForTeam(matchdays, supportedTeamId),
    [matchdays, supportedTeamId],
  );

  if (!lastMatch || !team) return null;

  const goals = readMatchGoalsOverride(getOverride, gender, lastMatch.id)?.goals ?? [];
  const homeTeam = teams.find((entry) => entry.id === lastMatch.homeTeamId);
  const awayTeam = teams.find((entry) => entry.id === lastMatch.awayTeamId);
  const homeSquad = homeTeam
    ? getCompeticionSquadData(gender, homeTeam, bundles, viewedSeason.label).squad
    : [];
  const awaySquad = awayTeam
    ? getCompeticionSquadData(gender, awayTeam, bundles, viewedSeason.label).squad
    : [];
  const summary = formatMatchGoalsSummary(
    goals,
    lastMatch.homeTeam,
    lastMatch.awayTeam,
    homeSquad,
    awaySquad,
  );

  const isHome = lastMatch.homeTeamId === supportedTeamId;
  const opponentName = isHome ? lastMatch.awayTeam : lastMatch.homeTeam;
  const teamScore = isHome ? lastMatch.homeScore : lastMatch.awayScore;
  const opponentScore = isHome ? lastMatch.awayScore : lastMatch.homeScore;

  return (
    <div className="rounded-2xl border border-[#214C9B]/12 bg-white p-4 sm:p-5">
      <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Último partido</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <OpponentCrest
          logo={getTeamCrestById(team.id, team.crestInitials)}
          opponent={team.name}
          size="md"
          className="h-10 w-10"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-[#214C9B]">
            {team.shortName ?? team.name} {formatMatchScore(teamScore ?? 0, opponentScore ?? 0)} {opponentName}
          </p>
          <p className="text-xs text-slate-600">{formatMatchDate(lastMatch.date)}</p>
          {summary ? <p className="mt-1 text-xs font-semibold text-slate-700">{summary}</p> : null}
        </div>
      </div>
    </div>
  );
}
