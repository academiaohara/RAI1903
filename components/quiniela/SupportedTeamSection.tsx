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
import { formatMatchDate } from "@/lib/utils";
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
  teams: Array<{ id: string; name: string; shortName?: string; crestInitials?: string }>;
  value: string;
  onChange: (teamId: string) => void;
  disabled?: boolean;
};

export function SupportedTeamPicker({ teams, value, onChange, disabled }: SupportedTeamPickerProps) {
  const [editing, setEditing] = useState(false);
  const selectedTeam = teams.find((team) => team.id === value);

  return (
    <div className="rounded-2xl border border-[#214C9B]/15 bg-gradient-to-br from-blue-50/80 to-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="shrink-0 text-sm font-extrabold leading-none text-[#214C9B]">Tu equipo:</span>
          <span className="truncate text-sm font-bold leading-none text-slate-700">
            {selectedTeam?.shortName ?? selectedTeam?.name ?? "—"}
          </span>
          {selectedTeam ? (
            <OpponentCrest
              logo={getTeamCrestById(
                selectedTeam.id,
                selectedTeam.crestInitials ?? selectedTeam.shortName ?? selectedTeam.name,
              )}
              opponent={selectedTeam.name}
              size="md"
              className="h-10 w-10 shrink-0"
            />
          ) : null}
        </div>
        {!disabled ? (
          editing ? (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              aria-label="Cerrar selector de equipo"
            >
              <X size={14} aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#214C9B]/20 text-[#214C9B] transition hover:bg-[#214C9B]/5"
              aria-label="Cambiar equipo"
            >
              <Pencil size={14} aria-hidden />
            </button>
          )
        ) : null}
      </div>

      {editing && !disabled ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-[#214C9B]/10 pt-3">
          {teams.map((team) => {
            const selected = team.id === value;
            const crest = getTeamCrestById(team.id, team.crestInitials ?? team.shortName ?? team.name);
            return (
              <button
                key={team.id}
                type="button"
                onClick={() => {
                  onChange(team.id);
                  setEditing(false);
                }}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  selected
                    ? "border-[#214C9B] bg-[#214C9B] text-white shadow-sm"
                    : "border-[#214C9B]/15 bg-white text-slate-700 hover:border-[#214C9B]/35"
                }`}
                aria-pressed={selected}
              >
                <OpponentCrest logo={crest} opponent={team.name} size="sm" className="h-6 w-6" />
                <span>{team.shortName ?? team.name}</span>
              </button>
            );
          })}
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
