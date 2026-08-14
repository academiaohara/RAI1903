"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Modal } from "@/components/Modal";
import { useSeason } from "@/components/season/SeasonProvider";
import { canLinkEquipoLiga, equipoLigaHref } from "@/lib/equipo-liga";
import { useMasculinoLeagueSeason } from "@/hooks/useMasculinoLeagueSeason";
import { groupSlotToTeam, resolveGroupTeams } from "@/lib/cms/group-teams";
import { getTeamsBundle, resolveFixtureTeamDisplayName } from "@/lib/cms/teams-bundle";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import {
  getTeamHomeAwayRecordBeforeRound,
  getTeamsBeforeRound,
  isAvilesMatch,
} from "@/lib/quiniela";
import type { HomeAwayRecord } from "@/lib/standings";
import type { FormCode, Match, Team } from "@/types";

const formLabel: Record<FormCode, string> = { G: "G", E: "E", P: "P" };

function resolvePreviewTeam(
  teamId: string,
  matchName: string,
  teamsBeforeRound: Team[],
  allTeams: Team[],
  bundles: SeasonBundlesMap,
): Team {
  const fromStandings =
    teamsBeforeRound.find((team) => team.id === teamId) ?? allTeams.find((team) => team.id === teamId);
  if (fromStandings) return fromStandings;

  const name = resolveFixtureTeamDisplayName(teamId, matchName, getTeamsBundle(bundles, "masculino")?.teams ?? [], bundles, "masculino");
  return groupSlotToTeam({ id: teamId, name }, 0);
}

function TeamPreviewBlock({
  team,
  sideRecord,
  side,
  teamId,
}: {
  team: Team;
  sideRecord: HomeAwayRecord;
  side: "home" | "away";
  teamId: string;
}) {
  const sideLabel = side === "home" ? "Como local" : "Como visitante";

  const teamNameClass =
    "text-lg font-extrabold text-[#1c3f6e]" +
    (canLinkEquipoLiga("masculino", teamId)
      ? " underline decoration-[#d43b2f]/35 underline-offset-2 transition hover:text-[#b5281f] hover:decoration-[#d43b2f]"
      : "");

  return (
    <div className="rounded-[3px] border-[1.5px] border-[#d43b2f] bg-[#fffdf9] p-3 sm:p-4">
      {canLinkEquipoLiga("masculino", teamId) ? (
        <Link href={equipoLigaHref("masculino", teamId)} className={teamNameClass}>
          {team.name}
        </Link>
      ) : (
        <p className={teamNameClass}>{team.name}</p>
      )}
      <div className="mt-3 grid gap-2 text-sm text-[#222] sm:grid-cols-2">
        <p>
          <span className="font-bold text-[#1c3f6e]/70">Posicion:</span>{" "}
          {team.stats.played > 0 ? `${team.position}º` : "—"}
        </p>
        <p><span className="font-bold text-[#1c3f6e]/70">Puntos:</span> {team.stats.points}</p>
        <p><span className="font-bold text-[#1c3f6e]/70">GF / GC:</span> {team.stats.goalsFor} / {team.stats.goalsAgainst}</p>
        <p>
          <span className="font-bold text-[#1c3f6e]/70">Racha:</span>{" "}
          {team.form.length > 0 ? team.form.map((code) => formLabel[code]).join(" · ") : "Sin datos"}
        </p>
      </div>
      <div className="mt-3 rounded-[3px] border border-dashed border-[#1c3f6e]/35 bg-transparent p-3 text-sm">
        <p className="text-xs font-bold uppercase tracking-normal text-[#1c3f6e]">{sideLabel}</p>
        <p className="mt-1 text-[#222]">
          {sideRecord.played > 0
            ? `${sideRecord.wins}V · ${sideRecord.draws}E · ${sideRecord.losses}D en ${sideRecord.played} partidos`
            : "Sin partidos previos en esta condicion"}
        </p>
      </div>
      {teamId !== "real-aviles-industrial" && (
        <p className="mt-3 text-xs text-[#777]">Bajas del rival: consulta convocatoria oficial.</p>
      )}
    </div>
  );
}

export function MatchPreviewModal({ match, open, onClose }: { match: Match; open: boolean; onClose: () => void }) {
  const { bundles } = useSeason();
  const { leagueMatchdays } = useMasculinoLeagueSeason();
  const teams = useMemo(() => resolveGroupTeams(bundles, "masculino", "1"), [bundles]);
  const beforeRound = match.matchday;
  const teamsBeforeRound = useMemo(
    () => getTeamsBeforeRound(leagueMatchdays, teams, beforeRound),
    [beforeRound, leagueMatchdays, teams],
  );
  const homeTeam = useMemo(
    () => resolvePreviewTeam(match.homeTeamId, match.homeTeam, teamsBeforeRound, teams, bundles),
    [match.homeTeamId, match.homeTeam, teamsBeforeRound, teams, bundles],
  );
  const awayTeam = useMemo(
    () => resolvePreviewTeam(match.awayTeamId, match.awayTeam, teamsBeforeRound, teams, bundles),
    [match.awayTeamId, match.awayTeam, teamsBeforeRound, teams, bundles],
  );
  const homeSideRecord = useMemo(
    () => getTeamHomeAwayRecordBeforeRound(match.homeTeamId, "home", beforeRound, leagueMatchdays),
    [match.homeTeamId, beforeRound, leagueMatchdays],
  );
  const awaySideRecord = useMemo(
    () => getTeamHomeAwayRecordBeforeRound(match.awayTeamId, "away", beforeRound, leagueMatchdays),
    [match.awayTeamId, beforeRound, leagueMatchdays],
  );

  if (isAvilesMatch(match)) return null;

  return (
    <Modal open={open} title={`Previa · ${homeTeam.name} vs ${awayTeam.name}`} onClose={onClose} variant="ticket">
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        <TeamPreviewBlock team={homeTeam} sideRecord={homeSideRecord} side="home" teamId={match.homeTeamId} />
        <TeamPreviewBlock team={awayTeam} sideRecord={awaySideRecord} side="away" teamId={match.awayTeamId} />
      </div>
    </Modal>
  );
}
