"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SquadPlayer, SquadViewMode } from "@/types/squad";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { getSquadClubInfo, getSquadPlayers } from "@/lib/squad-data";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { splitSquadByAvailability } from "@/lib/squad-utils";
import { SquadHeader } from "@/components/squad/SquadHeader";
import { SquadToolbar } from "@/components/squad/SquadToolbar";
import { SquadAvailability } from "@/components/squad/SquadAvailability";
import { PlayerTable } from "@/components/squad/PlayerTable";
import { PlayerGrid } from "@/components/squad/PlayerGrid";
import { PlayerModal } from "@/components/squad/PlayerModal";
import { StadiumModal } from "@/components/squad/StadiumModal";
import { StandingsEvolutionChart } from "@/components/squad/StandingsEvolutionChart";

type SquadPageProps = {
  gender: PrimerEquipoGender;
};

export function SquadPage({ gender }: SquadPageProps) {
  const { getOverride, saveValue } = useInlineEditing();
  const baseSquad = useMemo(() => getSquadPlayers(gender), [gender]);
  const squad = useMemo(
    () =>
      baseSquad.map((player) => ({
        ...player,
        ...(getOverride<Partial<SquadPlayer>>(`squad-player:${player.id}`) ?? {}),
      })),
    [baseSquad, getOverride],
  );
  const { injured, suspended, available } = useMemo(() => splitSquadByAvailability(squad), [squad]);
  const club = useMemo(() => getSquadClubInfo(gender), [gender]);
  const isFemenino = gender === "femenino";

  const [viewMode, setViewMode] = useState<SquadViewMode>(isFemenino ? "lista" : "fichas");
  const [selected, setSelected] = useState<SquadPlayer | null>(null);
  const [stadiumOpen, setStadiumOpen] = useState(false);

  const handleSelect = isFemenino ? undefined : setSelected;
  const handleUpdatePlayer = useCallback(
    (playerId: string, patch: Partial<SquadPlayer>) => {
      const current = getOverride<Partial<SquadPlayer>>(`squad-player:${playerId}`) ?? {};
      const next = { ...current, ...patch };
      saveValue(`squad-player:${playerId}`, next);
      setSelected((player) => (player?.id === playerId ? { ...player, ...patch } : player));
    },
    [getOverride, saveValue],
  );

  return (
    <div className="space-y-6">
      <SquadHeader club={club} stats={club.stats} onStadiumClick={() => setStadiumOpen(true)} />
      <SquadToolbar viewMode={viewMode} onViewModeChange={setViewMode} showViewToggle={!isFemenino} />

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
            <PlayerTable
              players={available}
              onSelect={handleSelect}
              showMarketValue={!isFemenino}
              showAge={!isFemenino}
            />
          ) : (
            <PlayerGrid players={available} onSelect={setSelected} variant="fichas" />
          )}
        </motion.div>
      </AnimatePresence>

      {!isFemenino && <PlayerModal player={selected} onClose={() => setSelected(null)} onUpdate={handleUpdatePlayer} />}
      {!isFemenino && <StandingsEvolutionChart />}
      <StadiumModal stadium={club.estadioInfo} open={stadiumOpen} onClose={() => setStadiumOpen(false)} />
    </div>
  );
}
