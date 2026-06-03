"use client";

import { useMemo, useState } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import { getCompeticionSquadData } from "@/lib/competicion-squad";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { SquadHeader } from "@/components/squad/SquadHeader";
import { StadiumModal } from "@/components/squad/StadiumModal";
import type { Team } from "@/types";

type EquipoLigaTeamInfoProps = {
  gender: PrimerEquipoGender;
  team: Team;
};

/** Datos básicos del club (escudo, entrenador, estadio, estadísticas de temporada). Sin plantilla. */
export function EquipoLigaTeamInfo({ gender, team }: EquipoLigaTeamInfoProps) {
  const { bundles, viewedSeason } = useSeason();
  const { club: baseClub } = useMemo(
    () => getCompeticionSquadData(gender, team, bundles, viewedSeason.label),
    [bundles, gender, team, viewedSeason.label],
  );
  const club = useMemo(
    () => ({ ...baseClub, temporada: viewedSeason.label }),
    [baseClub, viewedSeason.label],
  );
  const [stadiumOpen, setStadiumOpen] = useState(false);

  return (
    <>
      <SquadHeader club={club} stats={club.stats} gender={gender} onStadiumClick={() => setStadiumOpen(true)} />
      <StadiumModal stadium={club.estadioInfo} open={stadiumOpen} onClose={() => setStadiumOpen(false)} />
    </>
  );
}
