"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { EquipoLigaView } from "@/components/competicion/EquipoLigaView";
import { useSeason } from "@/components/season/SeasonProvider";
import { zonesToLegacyConfig } from "@/lib/cms/competition-config-bundle";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import { canLinkEquipoLiga, findGrupoForTeamId, resolveEquipoLigaTeam } from "@/lib/equipo-liga-resolve";
import { getAllTeamsForGender } from "@/lib/fixtures";
import { getTeamsForRfefGrupo, isTeamInRfefGrupo1, type RfefGrupoId } from "@/lib/rfef-grupos";
import { PRIMERA_RFEF_RULES } from "@/lib/rfef-rules";
import {
  getGrupo2Matchdays,
  getLeagueMatchdaysForGender,
} from "@/lib/season/aviles-matches";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Route } from "next";

type EquipoLigaPageClientProps = {
  gender: PrimerEquipoGender;
  teamId: string;
};

function evolutionSubtitleFor(
  gender: PrimerEquipoGender,
  grupo: RfefGrupoId | undefined,
  ligaLabel: string | undefined,
): string {
  if (gender === "femenino") {
    return ligaLabel ? `Liga · ${ligaLabel}` : "Liga";
  }
  const base = ligaLabel ?? "1ª RFEF";
  if (grupo === "2") return `Liga · ${base} Grupo II`;
  return `Liga · ${base} Grupo I`;
}

export function EquipoLigaPageClient({ gender, teamId }: EquipoLigaPageClientProps) {
  const { bundles, bundlesLoading, getFixtureSource, getCompetitionConfig } = useSeason();
  const router = useRouter();
  const backHref = `${primerEquipoBase(gender)}/competicion` as Route;

  const team = useMemo(
    () => resolveEquipoLigaTeam(teamId, gender, bundles),
    [teamId, gender, bundles],
  );

  const grupo = useMemo(
    () => (gender === "masculino" ? findGrupoForTeamId(teamId, gender, bundles) : undefined),
    [bundles, gender, teamId],
  );

  const allTeams = useMemo(() => {
    if (gender === "femenino") {
      return getAllTeamsForGender(gender);
    }
    if (grupo) {
      return resolveGroupTeams(bundles, gender, grupo);
    }
    if (isTeamInRfefGrupo1(teamId)) {
      return getTeamsForRfefGrupo("1");
    }
    return getTeamsForRfefGrupo("2");
  }, [bundles, gender, teamId, grupo]);

  const competitionConfig = useMemo(() => getCompetitionConfig(gender), [gender, getCompetitionConfig]);
  const standingsZones = useMemo(
    () => zonesToLegacyConfig(competitionConfig.zones),
    [competitionConfig.zones],
  );

  const leagueMatchdays = useMemo(() => {
    const fixtureSource = getFixtureSource(gender);
    if (gender === "masculino" && grupo === "2") {
      return getGrupo2Matchdays(fixtureSource);
    }
    return getLeagueMatchdaysForGender(fixtureSource, gender);
  }, [gender, getFixtureSource, grupo]);

  const evolutionSubtitle = useMemo(
    () => evolutionSubtitleFor(gender, grupo, competitionConfig.ligaLabel),
    [competitionConfig.ligaLabel, gender, grupo],
  );

  useEffect(() => {
    if (bundlesLoading) return;
    if (!team || !canLinkEquipoLiga(gender, teamId, bundles)) {
      router.replace(backHref);
    }
  }, [backHref, bundles, bundlesLoading, gender, router, team, teamId]);

  if (bundlesLoading || !team) {
    return <p className="text-sm font-bold text-slate-500">Cargando ficha del equipo…</p>;
  }

  return (
    <EquipoLigaView
      gender={gender}
      team={team}
      allTeams={allTeams}
      leagueMatchdays={leagueMatchdays}
      standingsZones={standingsZones}
      tiebreak={PRIMERA_RFEF_RULES.tiebreak}
      evolutionSubtitle={evolutionSubtitle}
    />
  );
}
