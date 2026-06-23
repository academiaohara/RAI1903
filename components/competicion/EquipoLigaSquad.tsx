"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RivalSquadOnPageEditor } from "@/components/editor/RivalSquadOnPageEditor";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import type { SquadPlayer, SquadViewMode, StadiumInfo } from "@/types/squad";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { useRivalSquadAvailability } from "@/hooks/useRivalSquadAvailability";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import { getRivalSquadsBundle } from "@/lib/cms/rival-squads-bundle";
import { saveRivalStadiumForSeason } from "@/lib/cms/stadium-catalog";
import { getCompeticionSquadData } from "@/lib/competicion-squad";
import { buildDefaultRivalSquadImport } from "@/lib/rival-squad-defaults";
import { defaultRosterEstado, splitSquadByAvailability } from "@/lib/squad-utils";
import { SquadHeader } from "@/components/squad/SquadHeader";
import { SquadToolbar } from "@/components/squad/SquadToolbar";
import { SquadAvailability } from "@/components/squad/SquadAvailability";
import { SquadEditToolbar } from "@/components/squad/SquadEditToolbar";
import { PlayerTable } from "@/components/squad/PlayerTable";
import { PlayerGrid } from "@/components/squad/PlayerGrid";
import { PlayerModal } from "@/components/squad/PlayerModal";
import { StadiumModal } from "@/components/squad/StadiumModal";
import { StadiumEditorModal } from "@/components/squad/StadiumEditorModal";
import type { Team } from "@/types";

type EquipoLigaSquadProps = {
  gender: PrimerEquipoGender;
  team: Team;
};

export function EquipoLigaSquad({ gender, team }: EquipoLigaSquadProps) {
  const { bundles, viewedSeason, viewedSeasonId } = useSeason();
  const { club: baseClub, squad: baseSquad, isOwnClub } = useMemo(
    () => getCompeticionSquadData(gender, team, bundles, viewedSeason.label),
    [bundles, gender, team, viewedSeason.label],
  );
  const { squad: ownSquad, updatePlayer, addPlayer, removePlayer } = useSquadPlayers(gender);
  const {
    squad: rivalSquad,
    entrenador: rivalEntrenador,
    setPlayerEstado: setRivalPlayerEstado,
    setEntrenador: setRivalEntrenador,
  } = useRivalSquadAvailability(gender, team);
  const { editMode, getValue } = useInlineEditing();
  const squad = isOwnClub ? ownSquad : rivalSquad.length > 0 ? rivalSquad : baseSquad;
  const [stadiumOverride, setStadiumOverride] = useState<StadiumInfo | null>(null);
  const club = useMemo(() => {
    const withStadium = stadiumOverride
      ? {
          ...baseClub,
          estadio: stadiumOverride.nombre,
          estadioInfo: stadiumOverride,
        }
      : baseClub;

    if (isOwnClub) {
      return {
        ...withStadium,
        entrenador: getValue(`squad-club:${gender}:entrenador`, withStadium.entrenador),
      };
    }

    return {
      ...withStadium,
      temporada: viewedSeason.label,
      entrenador: rivalEntrenador,
    };
  }, [baseClub, gender, getValue, isOwnClub, rivalEntrenador, stadiumOverride, viewedSeason.label]);
  const { injured, suspended, available } = useMemo(() => splitSquadByAvailability(squad), [squad]);

  const handleMarkUnavailable = useCallback(
    (playerId: string, estado: "lesionado" | "sancionado") => {
      if (isOwnClub) {
        updatePlayer(playerId, { estado });
        return;
      }
      setRivalPlayerEstado(playerId, estado);
    },
    [isOwnClub, setRivalPlayerEstado, updatePlayer],
  );

  const handleMarkAvailable = useCallback(
    (playerId: string) => {
      const player = squad.find((entry) => entry.id === playerId);
      if (!player) return;
      const estado = defaultRosterEstado(player);
      if (isOwnClub) {
        updatePlayer(playerId, { estado });
        return;
      }
      setRivalPlayerEstado(playerId, estado);
    },
    [isOwnClub, setRivalPlayerEstado, squad, updatePlayer],
  );

  const isFemenino = gender === "femenino";
  const showPlayerModal = isOwnClub && !isFemenino;
  const listOnlyView = !isOwnClub || isFemenino;

  const [viewMode, setViewMode] = useState<SquadViewMode>(listOnlyView ? "lista" : "fichas");
  const [selected, setSelected] = useState<SquadPlayer | null>(null);
  const [stadiumOpen, setStadiumOpen] = useState(false);
  const [addBusy, setAddBusy] = useState(false);

  const handleSelect = showPlayerModal ? setSelected : undefined;

  const handleAddPlayer = useCallback(
    async (position: Parameters<typeof addPlayer>[0]) => {
      if (!isOwnClub) return;
      setAddBusy(true);
      const result = await addPlayer(position);
      setAddBusy(false);
      if (result.ok && result.player) setSelected(result.player);
    },
    [addPlayer, isOwnClub],
  );

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
    <div className="space-y-6">
      {!isOwnClub && <RivalSquadOnPageEditor gender={gender} team={team} />}
      <SquadHeader
        club={club}
        stats={club.stats}
        gender={gender}
        onStadiumClick={() => setStadiumOpen(true)}
        perTeamEntrenador={!isOwnClub}
        onEntrenadorChange={!isOwnClub ? setRivalEntrenador : undefined}
      />
      <SquadToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={isOwnClub && !isFemenino}
      />

      {editMode && isOwnClub && (
        <SquadEditToolbar onAddPlayer={(position) => void handleAddPlayer(position)} busy={addBusy} />
      )}

      <SquadAvailability
        injured={injured}
        suspended={suspended}
        available={available}
        onSelect={handleSelect}
        editMode={editMode}
        onMarkUnavailable={editMode ? handleMarkUnavailable : undefined}
        onMarkAvailable={editMode ? handleMarkAvailable : undefined}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {viewMode === "lista" ? (
            <PlayerTable
              players={squad}
              onSelect={handleSelect}
              showMarketValue={!isFemenino}
              showAge={!isFemenino}
              showEmptyPositions={editMode && isOwnClub}
            />
          ) : (
            <PlayerGrid
              players={squad}
              onSelect={showPlayerModal ? setSelected : () => {}}
              variant="fichas"
              showEmptyPositions={editMode && isOwnClub}
              seasonLabel={viewedSeason.label}
              crestUrl={club.escudo}
              crestAlt={club.nombre}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {showPlayerModal && (
        <PlayerModal
          player={selected ? squad.find((entry) => entry.id === selected.id) ?? selected : null}
          onClose={() => setSelected(null)}
          onUpdate={updatePlayer}
          onRemove={
            editMode
              ? (playerId) => void removePlayer(playerId).then(() => setSelected(null))
              : undefined
          }
        />
      )}
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
    </div>
  );
}
