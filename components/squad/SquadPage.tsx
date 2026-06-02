"use client";

import { useCallback, useMemo, useState } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { AnimatePresence, motion } from "framer-motion";
import type { SquadPlayer, SquadViewMode } from "@/types/squad";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import { useSeason } from "@/components/season/SeasonProvider";
import { getLeagueMatchdaysForGender } from "@/lib/season/aviles-matches";
import { resolveSquadClubInfo } from "@/lib/season/squad-source";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { splitSquadByAvailability } from "@/lib/squad-utils";
import { SquadHeader } from "@/components/squad/SquadHeader";
import { SquadToolbar } from "@/components/squad/SquadToolbar";
import { SquadAvailability } from "@/components/squad/SquadAvailability";
import { PlayerTable } from "@/components/squad/PlayerTable";
import { PlayerGrid } from "@/components/squad/PlayerGrid";
import { PlayerModal } from "@/components/squad/PlayerModal";
import { StadiumModal } from "@/components/squad/StadiumModal";
import { StadiumEditorModal } from "@/components/squad/StadiumEditorModal";
import { SquadEditToolbar } from "@/components/squad/SquadEditToolbar";
import { StandingsEvolutionChart } from "@/components/squad/StandingsEvolutionChart";
import type { StadiumInfo } from "@/types/squad";

type SquadPageProps = {
  gender: PrimerEquipoGender;
};

export function SquadPage({ gender }: SquadPageProps) {
  const { squad, updatePlayer, addPlayer, removePlayer } = useSquadPlayers(gender);
  const { bundles, viewedSeason, getFixtureSource } = useSeason();
  const { editMode, getValue } = useInlineEditing();
  const [addBusy, setAddBusy] = useState(false);
  const [stadiumOverride, setStadiumOverride] = useState<StadiumInfo | null>(null);
  const leagueMatchdays = useMemo(
    () => getLeagueMatchdaysForGender(getFixtureSource(gender), gender),
    [gender, getFixtureSource],
  );
  const { injured, suspended, available } = useMemo(() => splitSquadByAvailability(squad), [squad]);
  const club = useMemo(() => {
    const base = resolveSquadClubInfo(gender, viewedSeason.label, bundles, squad.length, leagueMatchdays);
    const merged = {
      ...base,
      entrenador: getValue(`squad-club:${gender}:entrenador`, base.entrenador),
    };
    if (stadiumOverride) {
      merged.estadio = stadiumOverride.nombre;
      merged.estadioInfo = stadiumOverride;
    }
    return merged;
  }, [bundles, gender, getValue, leagueMatchdays, squad.length, stadiumOverride, viewedSeason.label]);
  const isFemenino = gender === "femenino";

  const [viewMode, setViewMode] = useState<SquadViewMode>(isFemenino ? "lista" : "fichas");
  const [selected, setSelected] = useState<SquadPlayer | null>(null);
  const [stadiumOpen, setStadiumOpen] = useState(false);

  const selectedPlayer = useMemo(() => {
    if (!selected) return null;
    return squad.find((player) => player.id === selected.id) ?? selected;
  }, [selected, squad]);

  const handleSelect = setSelected;

  const handleStadiumClick = () => setStadiumOpen(true);

  const handleAddPlayer = useCallback(
    async (position: Parameters<typeof addPlayer>[0]) => {
      setAddBusy(true);
      const result = await addPlayer(position);
      setAddBusy(false);
      if (result.ok && result.player) setSelected(result.player);
    },
    [addPlayer],
  );

  const stadiumModalOpen = stadiumOpen && !editMode;
  const stadiumEditorOpen = stadiumOpen && editMode;

  return (
    <div className="space-y-6">
      <SquadHeader
        club={club}
        stats={club.stats}
        gender={gender}
        onStadiumClick={handleStadiumClick}
      />
      <SquadToolbar viewMode={viewMode} onViewModeChange={setViewMode} showViewToggle={!isFemenino} />

      {editMode && <SquadEditToolbar onAddPlayer={(position) => void handleAddPlayer(position)} busy={addBusy} />}

      <SquadAvailability injured={injured} suspended={suspended} onSelect={handleSelect} editMode={editMode} />

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
              players={available}
              onSelect={handleSelect}
              showMarketValue={!isFemenino}
              showAge={!isFemenino}
              showEmptyPositions={editMode}
            />
          ) : (
            <PlayerGrid
              players={available}
              onSelect={setSelected}
              variant="fichas"
              showEmptyPositions={editMode}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <PlayerModal
        player={selectedPlayer}
        onClose={() => setSelected(null)}
        onUpdate={updatePlayer}
        onRemove={editMode ? (playerId) => void removePlayer(playerId).then(() => setSelected(null)) : undefined}
      />
      {!isFemenino && <StandingsEvolutionChart />}
      <StadiumModal stadium={club.estadioInfo} open={stadiumModalOpen} onClose={() => setStadiumOpen(false)} />
      <StadiumEditorModal
        open={stadiumEditorOpen}
        onClose={() => setStadiumOpen(false)}
        gender={gender}
        clubName={club.nombre}
        current={club.estadioInfo}
        onSaved={setStadiumOverride}
      />
    </div>
  );
}
