"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SquadPlayer, SquadViewMode } from "@/types/squad";
import { getSquadClubInfo, getSquadPlayers } from "@/lib/squad-data";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { SquadHeader } from "@/components/squad/SquadHeader";
import { SquadToolbar } from "@/components/squad/SquadToolbar";
import { PlayerTable } from "@/components/squad/PlayerTable";
import { PlayerGrid } from "@/components/squad/PlayerGrid";
import { PlayerModal } from "@/components/squad/PlayerModal";
import { StadiumModal } from "@/components/squad/StadiumModal";

type SquadPageProps = {
  gender: PrimerEquipoGender;
};

export function SquadPage({ gender }: SquadPageProps) {
  const squad = useMemo(() => getSquadPlayers(gender), [gender]);
  const club = useMemo(() => getSquadClubInfo(gender), [gender]);

  const [viewMode, setViewMode] = useState<SquadViewMode>("fichas");
  const [selected, setSelected] = useState<SquadPlayer | null>(null);
  const [stadiumOpen, setStadiumOpen] = useState(false);

  return (
    <div className="space-y-6">
      <SquadHeader club={club} stats={club.stats} onStadiumClick={() => setStadiumOpen(true)} />
      <SquadToolbar viewMode={viewMode} onViewModeChange={setViewMode} />

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {viewMode === "lista" ? (
            <PlayerTable players={squad} onSelect={setSelected} />
          ) : (
            <PlayerGrid players={squad} onSelect={setSelected} variant="fichas" />
          )}
        </motion.div>
      </AnimatePresence>

      <PlayerModal player={selected} onClose={() => setSelected(null)} />
      <StadiumModal stadium={club.estadioInfo} open={stadiumOpen} onClose={() => setStadiumOpen(false)} />
    </div>
  );
}
