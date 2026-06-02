"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { EquipoLigaView } from "@/components/competicion/EquipoLigaView";
import { useSeason } from "@/components/season/SeasonProvider";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import { canLinkEquipoLiga, findGrupoForTeamId, resolveEquipoLigaTeam } from "@/lib/equipo-liga-resolve";
import { getAllTeamsForGender } from "@/lib/fixtures";
import { getTeamsForRfefGrupo, isTeamInRfefGrupo1 } from "@/lib/rfef-grupos";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Route } from "next";

type EquipoLigaPageClientProps = {
  gender: PrimerEquipoGender;
  teamId: string;
};

export function EquipoLigaPageClient({ gender, teamId }: EquipoLigaPageClientProps) {
  const { bundles, bundlesLoading } = useSeason();
  const router = useRouter();
  const backHref = `${primerEquipoBase(gender)}/competicion` as Route;

  const team = useMemo(
    () => resolveEquipoLigaTeam(teamId, gender, bundles),
    [teamId, gender, bundles],
  );

  const allTeams = useMemo(() => {
    if (gender === "femenino") {
      return getAllTeamsForGender(gender);
    }
    const grupo = findGrupoForTeamId(teamId, gender, bundles);
    if (grupo) {
      return resolveGroupTeams(bundles, gender, grupo);
    }
    if (isTeamInRfefGrupo1(teamId)) {
      return getTeamsForRfefGrupo("1");
    }
    return getTeamsForRfefGrupo("2");
  }, [bundles, gender, teamId]);

  useEffect(() => {
    if (bundlesLoading) return;
    if (!team || !canLinkEquipoLiga(gender, teamId, bundles)) {
      router.replace(backHref);
    }
  }, [backHref, bundles, bundlesLoading, gender, router, team, teamId]);

  if (bundlesLoading || !team) {
    return <p className="text-sm font-bold text-slate-500">Cargando ficha del equipo…</p>;
  }

  return <EquipoLigaView gender={gender} team={team} allTeams={allTeams} />;
}
