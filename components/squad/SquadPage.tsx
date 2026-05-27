"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SquadPlayer, SquadPosition, SquadViewMode } from "@/types/squad";
import { getSquadClubInfo, getSquadPlayers } from "@/lib/squad-data";
import { filterSquadPlayers } from "@/lib/squad-utils";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { SquadHeader } from "@/components/squad/SquadHeader";
import { FiltersBar } from "@/components/squad/FiltersBar";
import { PlayerTable } from "@/components/squad/PlayerTable";
import { PlayerGrid } from "@/components/squad/PlayerGrid";
import { PlayerModal } from "@/components/squad/PlayerModal";

type SquadPageProps = {
  gender: PrimerEquipoGender;
};

export function SquadPage({ gender }: SquadPageProps) {
  const squad = useMemo(() => getSquadPlayers(gender), [gender]);
  const club = useMemo(() => getSquadClubInfo(gender), [gender]);

  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<SquadPosition | "Todas">("Todas");
  const [viewMode, setViewMode] = useState<SquadViewMode>("fichas");
  const [selected, setSelected] = useState<SquadPlayer | null>(null);

  const filteredPlayers = useMemo(
    () => filterSquadPlayers(squad, query, position),
    [squad, query, position],
  );

  return (
    <div className="space-y-6 pb-8">
      <SquadHeader club={club} />

      <FiltersBar
        query={query}
        onQueryChange={setQuery}
        position={position}
        onPositionChange={setPosition}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        resultsCount={filteredPlayers.length}
      />

      {filteredPlayers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-[1.75rem] border border-dashed border-[#214C9B]/25 bg-white p-10 text-center"
        >
          <p className="text-lg font-extrabold uppercase text-[#214C9B]">Sin resultados</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">Prueba con otro nombre, dorsal o posicion.</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {viewMode === "lista" ? (
              <PlayerTable players={filteredPlayers} onSelect={setSelected} />
            ) : (
              <PlayerGrid players={filteredPlayers} onSelect={setSelected} />
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <PlayerModal player={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
