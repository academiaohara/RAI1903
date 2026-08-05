"use client";

import { useCallback, useMemo, useState } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { AnimatePresence, motion } from "framer-motion";
import type { SquadPlayer, SquadViewMode } from "@/types/squad";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import { useStatsCompetitionFilter } from "@/hooks/useStatsCompetitionFilter";
import { useSeasonPlayerRatings } from "@/hooks/useSeasonPlayerRatings";
import { useSeason } from "@/components/season/SeasonProvider";
import { getAvilesMatchesFromSource } from "@/lib/season/aviles-matches";
import { filterMatchesForStatsCompetition } from "@/lib/competition/stats-filters";
import { computeClubStatsForGenderFromMatches } from "@/lib/season/club-league-stats";
import { resolveSquadClubInfo } from "@/lib/season/squad-source";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { defaultRosterEstado, splitSquadByAvailability } from "@/lib/squad-utils";
import { SquadHeader } from "@/components/squad/SquadHeader";
import { SquadToolbar } from "@/components/squad/SquadToolbar";
import { SquadAvailability } from "@/components/squad/SquadAvailability";
import { PlayerTable } from "@/components/squad/PlayerTable";
import { PlayerGrid } from "@/components/squad/PlayerGrid";
import { PlayerModal } from "@/components/squad/PlayerModal";
import { StadiumModal } from "@/components/squad/StadiumModal";
import { StadiumEditorModal } from "@/components/squad/StadiumEditorModal";
import { SquadEditToolbar } from "@/components/squad/SquadEditToolbar";
import { FixturesJsonPasteSection } from "@/components/editor/FixturesJsonPasteSection";
import { parseCanteraSquadJson } from "@/lib/cms/parse-squad-json";
import { SectionUnderConstructionGate } from "@/components/season/SectionUnderConstructionGate";
import { StandingsEvolutionChart } from "@/components/squad/StandingsEvolutionChart";
import type { StadiumInfo } from "@/types/squad";

type SquadPageProps = {
  gender: PrimerEquipoGender;
};

export function SquadPage({ gender }: SquadPageProps) {
  const { viewedSeasonId, bundles, viewedSeason, getFixtureSource } = useSeason();
  const { filter: statsCompetitionFilter, setFilter: setStatsCompetitionFilter } = useStatsCompetitionFilter(
    gender,
    viewedSeasonId,
  );
  const { squad, updatePlayer, addPlayer, removePlayer, importSquad } = useSquadPlayers(gender, statsCompetitionFilter);
  const { averages: fanRatings } = useSeasonPlayerRatings();
  const { editMode, getValue } = useInlineEditing();
  const [addBusy, setAddBusy] = useState(false);
  const [stadiumOverride, setStadiumOverride] = useState<StadiumInfo | null>(null);
  const avilesMatches = useMemo(
    () => getAvilesMatchesFromSource(getFixtureSource(gender), gender),
    [gender, getFixtureSource],
  );
  const filteredClubMatches = useMemo(
    () => filterMatchesForStatsCompetition(avilesMatches, statsCompetitionFilter),
    [avilesMatches, statsCompetitionFilter],
  );
  const clubStats = useMemo(
    () => computeClubStatsForGenderFromMatches(gender, filteredClubMatches),
    [filteredClubMatches, gender],
  );
  const { injured, suspended, available } = useMemo(() => splitSquadByAvailability(squad), [squad]);

  const handleMarkUnavailable = useCallback(
    (playerId: string, estado: "lesionado" | "sancionado") => {
      updatePlayer(playerId, { estado });
    },
    [updatePlayer],
  );

  const handleMarkAvailable = useCallback(
    (playerId: string) => {
      const player = squad.find((entry) => entry.id === playerId);
      if (!player) return;
      updatePlayer(playerId, { estado: defaultRosterEstado(player) });
    },
    [squad, updatePlayer],
  );

  const club = useMemo(() => {
    const base = resolveSquadClubInfo(gender, viewedSeason.label, bundles, squad.length, []);
    const merged = {
      ...base,
      entrenador: getValue(`squad-club:${gender}:entrenador`, base.entrenador),
      stats: clubStats,
    };
    if (stadiumOverride) {
      merged.estadio = stadiumOverride.nombre;
      merged.estadioInfo = stadiumOverride;
    }
    return merged;
  }, [bundles, clubStats, gender, getValue, squad.length, stadiumOverride, viewedSeason.label]);
  const isFemenino = gender === "femenino";
  const showPlayerProfile = !isFemenino;

  const [viewMode, setViewMode] = useState<SquadViewMode>(isFemenino ? "lista" : "fichas");
  const [selected, setSelected] = useState<SquadPlayer | null>(null);
  const [stadiumOpen, setStadiumOpen] = useState(false);

  const selectedPlayer = useMemo(() => {
    if (!selected) return null;
    return squad.find((player) => player.id === selected.id) ?? selected;
  }, [selected, squad]);

  const handleSelect = showPlayerProfile ? setSelected : undefined;

  const handleStadiumClick = () => setStadiumOpen(true);

  const handleQuickUpdate = useCallback(
    (playerId: string, patch: Partial<SquadPlayer>) => {
      updatePlayer(playerId, patch);
    },
    [updatePlayer],
  );

  const handleAddPlayer = useCallback(
    async (position: Parameters<typeof addPlayer>[0]) => {
      setAddBusy(true);
      const result = await addPlayer(position);
      setAddBusy(false);
      if (result.ok && result.player && showPlayerProfile) setSelected(result.player);
    },
    [addPlayer, showPlayerProfile],
  );

  const handleImportSquad = useCallback(
    (data: Parameters<typeof importSquad>[0]) => {
      void importSquad(data);
    },
    [importSquad],
  );

  const stadiumModalOpen = stadiumOpen && !editMode;
  const stadiumEditorOpen = stadiumOpen && editMode;

  return (
    <SectionUnderConstructionGate scope={gender} section="plantilla">
    <div className="space-y-6">
      <SquadHeader
        club={club}
        stats={club.stats}
        gender={gender}
        onStadiumClick={handleStadiumClick}
        competitionFilter={statsCompetitionFilter}
        onCompetitionFilterChange={setStatsCompetitionFilter}
      />
      <SquadToolbar viewMode={viewMode} onViewModeChange={setViewMode} showViewToggle={!isFemenino} />

      {editMode && isFemenino ? (
        <FixturesJsonPasteSection
          title="Importar plantilla JSON"
          applyLabel="Aplicar plantilla"
          accent="femenino"
          placeholder='{ "entrenador": "Nombre", "plantilla": [ { "dorsal": 1, "jugador": "Nombre Apellido", "pos": "Portero", "edad": 24, "pj": 0, "goles": 0, "ta": 0, "tr": 0 } ] }'
          hint='Pega un JSON con entrenador y plantilla (dorsal, jugador, pos, edad, pj, min, goles, ta, tr). También vale un array de jugadores. Sustituye toda la plantilla actual.'
          parse={parseCanteraSquadJson}
          onImport={handleImportSquad}
        />
      ) : null}

      {editMode && <SquadEditToolbar onAddPlayer={(position) => void handleAddPlayer(position)} busy={addBusy} variant={isFemenino ? "femenino" : "default"} />}

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
              showFanRating
              fanRatings={fanRatings}
              showEmptyPositions={editMode}
              editMode={editMode}
              inlineStatsEdit={isFemenino}
              onQuickUpdate={editMode ? handleQuickUpdate : undefined}
            />
          ) : (
            <PlayerGrid
              players={squad}
              onSelect={showPlayerProfile ? setSelected : () => {}}
              variant="fichas"
              fanRatings={fanRatings}
              showEmptyPositions={editMode}
              editMode={editMode}
              onQuickUpdate={editMode ? handleQuickUpdate : undefined}
              seasonLabel={viewedSeason.label}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {showPlayerProfile ? (
        <PlayerModal
          player={selectedPlayer}
          onClose={() => setSelected(null)}
          onUpdate={updatePlayer}
          onRemove={editMode ? (playerId) => void removePlayer(playerId).then(() => setSelected(null)) : undefined}
        />
      ) : null}
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
    </SectionUnderConstructionGate>
  );
}
