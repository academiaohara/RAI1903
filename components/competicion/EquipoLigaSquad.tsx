"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RivalSquadOnPageEditor } from "@/components/editor/RivalSquadOnPageEditor";
import { RivalSquadTable } from "@/components/squad/RivalSquadTable";
import { applyMatchdayGoalsToSquad } from "@/lib/rival-squad-goals";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import type { SquadPlayer, SquadViewMode } from "@/types/squad";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { useRivalSquadAvailability } from "@/hooks/useRivalSquadAvailability";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import { getCompeticionSquadData } from "@/lib/competicion-squad";
import { defaultRosterEstado, splitSquadByAvailability } from "@/lib/squad-utils";
import { SquadToolbar } from "@/components/squad/SquadToolbar";
import { SquadAvailability } from "@/components/squad/SquadAvailability";
import { SquadEditToolbar } from "@/components/squad/SquadEditToolbar";
import { PlayerTable } from "@/components/squad/PlayerTable";
import { PlayerGrid } from "@/components/squad/PlayerGrid";
import { PlayerModal } from "@/components/squad/PlayerModal";
import type { Matchday, Team } from "@/types";
import type { RfefGrupoId } from "@/lib/rfef-grupos";

type EquipoLigaSquadProps = {
  gender: PrimerEquipoGender;
  team: Team;
  grupo?: RfefGrupoId;
  leagueMatchdays?: Matchday[];
};

export function EquipoLigaSquad({ gender, team, grupo = "1", leagueMatchdays = [] }: EquipoLigaSquadProps) {
  const { bundles, viewedSeason } = useSeason();
  const { getOverride, editMode } = useInlineEditing();
  const { squad: baseSquad, isOwnClub } = useMemo(
    () => getCompeticionSquadData(gender, team, bundles, viewedSeason.label),
    [bundles, gender, team, viewedSeason.label],
  );
  const { squad: ownSquad, updatePlayer, addPlayer, removePlayer } = useSquadPlayers(gender);
  const { squad: rivalSquad, setPlayerEstado: setRivalPlayerEstado } = useRivalSquadAvailability(gender, team);
  const squad = useMemo(() => {
    const base = isOwnClub ? ownSquad : rivalSquad.length > 0 ? rivalSquad : baseSquad;
    if (!isOwnClub && gender === "masculino" && grupo === "1" && leagueMatchdays.length > 0) {
      return applyMatchdayGoalsToSquad(base, team.id, leagueMatchdays, gender, getOverride);
    }
    return base;
  }, [
    baseSquad,
    gender,
    getOverride,
    grupo,
    isOwnClub,
    leagueMatchdays,
    ownSquad,
    rivalSquad,
    team.id,
  ]);
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

  return (
    <div className="space-y-6">
      {!isOwnClub && <RivalSquadOnPageEditor gender={gender} team={team} />}
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
            !isOwnClub && gender === "masculino" ? (
              <RivalSquadTable players={squad} />
            ) : (
              <PlayerTable
                players={squad}
                onSelect={handleSelect}
                showMarketValue={!isFemenino}
                showAge={!isFemenino}
                showEmptyPositions={editMode && isOwnClub}
              />
            )
          ) : (
            <PlayerGrid
              players={squad}
              onSelect={showPlayerModal ? setSelected : () => {}}
              variant="fichas"
              showEmptyPositions={editMode && isOwnClub}
              seasonLabel={viewedSeason.label}
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
    </div>
  );
}
