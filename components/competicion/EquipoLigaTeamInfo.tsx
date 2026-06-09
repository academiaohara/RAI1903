"use client";

import { useCallback, useMemo, useState } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import { useRivalSquadAvailability } from "@/hooks/useRivalSquadAvailability";
import { getCompeticionSquadData } from "@/lib/competicion-squad";
import { getRivalSquadsBundle } from "@/lib/cms/rival-squads-bundle";
import { saveRivalStadiumForSeason } from "@/lib/cms/stadium-catalog";
import { buildDefaultRivalSquadImport } from "@/lib/rival-squad-defaults";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { SquadHeader } from "@/components/squad/SquadHeader";
import { StadiumEditorModal } from "@/components/squad/StadiumEditorModal";
import { StadiumModal } from "@/components/squad/StadiumModal";
import type { Team } from "@/types";
import type { StadiumInfo } from "@/types/squad";

type EquipoLigaTeamInfoProps = {
  gender: PrimerEquipoGender;
  team: Team;
};

/** Datos básicos del club (escudo, entrenador, estadio, estadísticas de temporada). Sin plantilla. */
export function EquipoLigaTeamInfo({ gender, team }: EquipoLigaTeamInfoProps) {
  const { bundles, viewedSeason, viewedSeasonId } = useSeason();
  const { editMode, getValue } = useInlineEditing();
  const { club: baseClub, isOwnClub } = useMemo(
    () => getCompeticionSquadData(gender, team, bundles, viewedSeason.label),
    [bundles, gender, team, viewedSeason.label],
  );
  const { entrenador: rivalEntrenador, setEntrenador: setRivalEntrenador } = useRivalSquadAvailability(
    gender,
    team,
  );
  const [stadiumOverride, setStadiumOverride] = useState<StadiumInfo | null>(null);
  const club = useMemo(
    () => ({
      ...baseClub,
      temporada: viewedSeason.label,
      entrenador: isOwnClub
        ? getValue(`squad-club:${gender}:entrenador`, baseClub.entrenador)
        : rivalEntrenador,
      ...(stadiumOverride
        ? {
            estadio: stadiumOverride.nombre,
            estadioInfo: stadiumOverride,
          }
        : {}),
    }),
    [baseClub, getValue, gender, isOwnClub, rivalEntrenador, stadiumOverride, viewedSeason.label],
  );
  const [stadiumOpen, setStadiumOpen] = useState(false);
  const stadiumModalOpen = stadiumOpen && !editMode;
  const stadiumEditorOpen = stadiumOpen && editMode;

  const rivalImportFallback = useMemo(() => {
    if (isOwnClub) return undefined;
    return getRivalSquadsBundle(bundles, gender).squads[team.id] ?? buildDefaultRivalSquadImport(team);
  }, [bundles, gender, isOwnClub, team]);

  const handleSaveRivalStadium = useCallback(
    (stadium: StadiumInfo) =>
      saveRivalStadiumForSeason(viewedSeasonId, gender, bundles, team.id, stadium, rivalImportFallback),
    [bundles, gender, rivalImportFallback, team.id, viewedSeasonId],
  );

  return (
    <>
      <SquadHeader
        club={club}
        stats={club.stats}
        gender={gender}
        onStadiumClick={() => setStadiumOpen(true)}
        perTeamEntrenador={!isOwnClub}
        onEntrenadorChange={!isOwnClub ? setRivalEntrenador : undefined}
      />
      <StadiumModal stadium={club.estadioInfo} open={stadiumModalOpen} onClose={() => setStadiumOpen(false)} />
      <StadiumEditorModal
        open={stadiumEditorOpen}
        onClose={() => setStadiumOpen(false)}
        gender={gender}
        clubName={club.nombre}
        current={club.estadioInfo}
        onSaved={setStadiumOverride}
        onSave={!isOwnClub ? handleSaveRivalStadium : undefined}
      />
    </>
  );
}
