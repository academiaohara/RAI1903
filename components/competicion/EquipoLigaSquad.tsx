"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SquadPlayer, SquadViewMode } from "@/types/squad";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { getCompeticionSquadData } from "@/lib/competicion-squad";
import { splitSquadByAvailability } from "@/lib/squad-utils";
import { SquadHeader } from "@/components/squad/SquadHeader";
import { SquadToolbar } from "@/components/squad/SquadToolbar";
import { SquadAvailability } from "@/components/squad/SquadAvailability";
import { PlayerTable } from "@/components/squad/PlayerTable";
import { PlayerGrid } from "@/components/squad/PlayerGrid";
import { PlayerModal } from "@/components/squad/PlayerModal";
import { StadiumModal } from "@/components/squad/StadiumModal";
import type { Team } from "@/types";

type EquipoLigaSquadProps = {
  gender: PrimerEquipoGender;
  team: Team;
};

export function EquipoLigaSquad({ gender, team }: EquipoLigaSquadProps) {
  const { club, squad, isOwnClub } = useMemo(() => getCompeticionSquadData(gender, team), [gender, team]);
  const { injured, suspended, available } = useMemo(() => splitSquadByAvailability(squad), [squad]);
  const isFemenino = gender === "femenino";
  const showPlayerModal = isOwnClub && !isFemenino;
  const listOnlyView = !isOwnClub || isFemenino;

  const [viewMode, setViewMode] = useState<SquadViewMode>(listOnlyView ? "lista" : "fichas");
  const [selected, setSelected] = useState<SquadPlayer | null>(null);
  const [stadiumOpen, setStadiumOpen] = useState(false);

  const handleSelect = showPlayerModal ? setSelected : undefined;

  return (
    <div className="space-y-6">
      <SquadHeader club={club} stats={club.stats} onStadiumClick={() => setStadiumOpen(true)} />
      <SquadToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={isOwnClub && !isFemenino}
      />

      <SquadAvailability injured={injured} suspended={suspended} onSelect={handleSelect} />

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {viewMode === "lista" ? (
            <PlayerTable players={available} onSelect={handleSelect} showMarketValue={!isFemenino} />
          ) : (
            <PlayerGrid
              players={available}
              onSelect={showPlayerModal ? setSelected : () => {}}
              variant="fichas"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {showPlayerModal && <PlayerModal player={selected} onClose={() => setSelected(null)} />}
      <StadiumModal stadium={club.estadioInfo} open={stadiumOpen} onClose={() => setStadiumOpen(false)} />
    </div>
  );
}
