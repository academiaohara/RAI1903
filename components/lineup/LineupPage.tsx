"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Share2 } from "lucide-react";
import { OpponentCrest } from "@/components/OpponentCrest";
import { useSeason } from "@/components/season/SeasonProvider";
import { LineupPitch } from "@/components/lineup/LineupPitch";
import { LineupPlayerChip } from "@/components/lineup/LineupPlayerChip";
import { usePrimerEquipoLeagueSeason } from "@/hooks/usePrimerEquipoLeagueSeason";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import {
  DEFAULT_FORMATION,
  FORMATION_OPTIONS,
  FORMATION_SLOTS,
  type FormationId,
} from "@/lib/lineup-formations";
import { shareLineupImage } from "@/lib/lineup-share";
import {
  createEmptySlots,
  loadSavedLineup,
  resizeLineupSlots,
  saveLineup,
} from "@/lib/lineup-storage";
import { genderLabels, type PrimerEquipoGender } from "@/lib/primer-equipo";
import { getTeamCrestById } from "@/lib/team-crests";
import { formatMatchWeekdayLetterDate } from "@/lib/utils";
import { groupPlayersByPosition } from "@/lib/squad-utils";
import { SQUAD_POSITIONS } from "@/types/squad";
import type { Match } from "@/types";

type LineupPageProps = {
  gender: PrimerEquipoGender;
};

function opponentFromMatch(match: Match, clubTeamId: string) {
  const isHome = match.homeTeamId === clubTeamId;
  return {
    name: isHome ? match.awayTeam : match.homeTeam,
    teamId: isHome ? match.awayTeamId : match.homeTeamId,
  };
}

function initialLineupState(seasonId: string, gender: PrimerEquipoGender) {
  const saved = loadSavedLineup(seasonId, gender);
  const formation = saved?.formation ?? DEFAULT_FORMATION;
  const assignments = saved
    ? resizeLineupSlots(saved.slots, FORMATION_SLOTS[formation].length)
    : createEmptySlots(FORMATION_SLOTS[formation].length);
  return { formation, assignments };
}

type LineupBoardProps = {
  gender: PrimerEquipoGender;
  seasonId: string;
  seasonLabel: string;
  squad: ReturnType<typeof useSquadPlayers>["squad"];
  nextMatch: Match | undefined;
  highlightTeamId: string;
};

function LineupBoard({
  gender,
  seasonId,
  seasonLabel,
  squad,
  nextMatch,
  highlightTeamId,
}: LineupBoardProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [{ formation, assignments }, setLineupState] = useState(() => initialLineupState(seasonId, gender));
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [sharing, setSharing] = useState(false);

  const setFormation = useCallback((nextFormation: FormationId) => {
    setLineupState((current) => ({
      formation: nextFormation,
      assignments: resizeLineupSlots(current.assignments, FORMATION_SLOTS[nextFormation].length),
    }));
  }, []);

  const playersById = useMemo(() => new Map(squad.map((player) => [player.id, player])), [squad]);
  const assignedIds = useMemo(
    () => new Set(assignments.filter((entry): entry is string => Boolean(entry))),
    [assignments],
  );
  const groupedPlayers = useMemo(() => groupPlayersByPosition(squad), [squad]);
  const slots = FORMATION_SLOTS[formation];

  const opponent = nextMatch ? opponentFromMatch(nextMatch, highlightTeamId) : null;
  const opponentCrest = opponent ? getTeamCrestById(opponent.teamId) : null;
  const clubLabel = genderLabels[gender].club;

  useEffect(() => {
    saveLineup(seasonId, gender, { formation, slots: assignments });
  }, [assignments, formation, gender, seasonId]);

  const handleFormationChange = useCallback(
    (nextFormation: FormationId) => {
      setFormation(nextFormation);
      setSelectedSlotIndex(null);
    },
    [setFormation],
  );

  const assignPlayerToSlot = useCallback((playerId: string, slotIndex: number) => {
    setLineupState((current) => {
      const next = [...current.assignments];
      const existingIndex = next.findIndex((entry) => entry === playerId);
      if (existingIndex >= 0) next[existingIndex] = null;
      next[slotIndex] = playerId;
      return { ...current, assignments: next };
    });
    setSelectedPlayerId(null);
    setSelectedSlotIndex(null);
  }, []);

  const removeFromSlot = useCallback((slotIndex: number) => {
    setLineupState((current) => {
      const next = [...current.assignments];
      next[slotIndex] = null;
      return { ...current, assignments: next };
    });
    setSelectedSlotIndex(null);
  }, []);

  const handleSlotClick = useCallback(
    (slotIndex: number) => {
      const currentPlayerId = assignments[slotIndex];

      if (selectedPlayerId) {
        assignPlayerToSlot(selectedPlayerId, slotIndex);
        return;
      }

      if (currentPlayerId) {
        removeFromSlot(slotIndex);
        return;
      }

      setSelectedSlotIndex(slotIndex);
    },
    [assignPlayerToSlot, assignments, removeFromSlot, selectedPlayerId],
  );

  const handlePlayerSelect = useCallback(
    (playerId: string) => {
      if (selectedPlayerId === playerId) {
        setSelectedPlayerId(null);
        return;
      }

      setSelectedPlayerId(playerId);

      if (selectedSlotIndex !== null) {
        assignPlayerToSlot(playerId, selectedSlotIndex);
      }
    },
    [assignPlayerToSlot, selectedPlayerId, selectedSlotIndex],
  );

  const handleShare = useCallback(async () => {
    if (!exportRef.current || sharing) return;
    setSharing(true);
    try {
      const rivalLabel = opponent?.name ?? "el próximo rival";
      await shareLineupImage({
        node: exportRef.current,
        fileName: `lineup-${gender}-${seasonLabel.replace("/", "-")}.png`,
        shareText: `Mi XI del ${clubLabel} (${formation}) vs ${rivalLabel} #RealAviles`,
      });
    } finally {
      setSharing(false);
    }
  }, [clubLabel, formation, gender, opponent?.name, sharing, seasonLabel]);

  return (
    <div className="lineup-page space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#214C9B]/70">Lineup</p>
          <h1 className="mt-1 text-2xl font-extrabold uppercase tracking-tight text-slate-900 sm:text-3xl">
            Arma tu once
          </h1>
          <p className="mt-1 max-w-xl text-sm font-semibold text-slate-600">
            Elige la formación, coloca jugadores en la pizarra y comparte tu alineación.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleShare()}
          disabled={sharing || assignedIds.size === 0}
          className="inline-flex items-center gap-2 rounded-full border-2 border-[#214C9B] px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-[#214C9B] transition hover:bg-[#214C9B] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Share2 className="h-4 w-4" aria-hidden />
          {sharing ? "Generando…" : "Compartir"}
        </button>
      </div>

      {opponent ? (
        <section className="lineup-opponent-banner" aria-label="Próximo rival">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#214C9B]/70">
              Próximo rival
            </p>
            <p className="mt-1 text-lg font-extrabold text-slate-900">{opponent.name}</p>
            {nextMatch ? (
              <p className="text-xs font-semibold text-slate-500">
                {formatMatchWeekdayLetterDate(nextMatch.date)}
              </p>
            ) : null}
          </div>
          {opponentCrest ? (
            <OpponentCrest logo={opponentCrest} opponent={opponent.name} size="md" />
          ) : null}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-[#214C9B]/20 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-600">
          No hay partido programado todavía para esta temporada.
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-start">
        <section className="lineup-board">
          <div ref={exportRef} className="lineup-export-card">
            <div className="lineup-board-header">
              <div>
                <h2 className="lineup-board-title">El XI del RAI</h2>
                <p className="text-xs font-semibold text-slate-500">{clubLabel}</p>
              </div>
              <span className="lineup-formation-badge">{formation}</span>
            </div>

            {opponent ? (
              <p className="lineup-board-rival">
                vs <span>{opponent.name}</span>
              </p>
            ) : null}

            <LineupPitch
              formation={formation}
              slots={slots}
              assignments={assignments}
              playersById={playersById}
              selectedPlayerId={selectedPlayerId}
              selectedSlotIndex={selectedSlotIndex}
              onSlotClick={handleSlotClick}
            />
          </div>

          <p className="mt-3 text-center text-xs font-semibold text-slate-500">
            {selectedPlayerId
              ? "Pulsa una posición vacía para colocar al jugador seleccionado."
              : "Selecciona un jugador a la derecha y colócalo en la pizarra."}
          </p>
        </section>

        <aside className="lineup-sidebar space-y-4">
          <label className="block space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#214C9B]/80">
              Formación
            </span>
            <select
              value={formation}
              onChange={(event) => handleFormationChange(event.target.value as FormationId)}
              className="w-full rounded-xl border border-[#214C9B]/20 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 shadow-sm outline-none focus:border-[#214C9B] focus:ring-2 focus:ring-[#214C9B]/20"
            >
              {FORMATION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#214C9B]/80">
                Plantilla
              </h3>
              <span className="text-[11px] font-bold tabular-nums text-slate-500">
                {assignedIds.size}/11
              </span>
            </div>

            <div className="lineup-sidebar-scroll space-y-4">
              {SQUAD_POSITIONS.map((position) => {
                const list = groupedPlayers[position];
                if (list.length === 0) return null;

                return (
                  <div key={position} className="space-y-2">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                      {position}
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                      {list.map((player, index) => (
                        <LineupPlayerChip
                          key={player.id}
                          player={player}
                          index={index}
                          selected={selectedPlayerId === player.id}
                          assigned={assignedIds.has(player.id)}
                          onSelect={(entry) => handlePlayerSelect(entry.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function LineupPage({ gender }: LineupPageProps) {
  const { squad } = useSquadPlayers(gender);
  const { nextMatch, highlightTeamId } = usePrimerEquipoLeagueSeason(gender);
  const { viewedSeasonId, viewedSeason } = useSeason();

  return (
    <LineupBoard
      key={`${viewedSeasonId}-${gender}`}
      gender={gender}
      seasonId={viewedSeasonId}
      seasonLabel={viewedSeason.label}
      squad={squad}
      nextMatch={nextMatch}
      highlightTeamId={highlightTeamId}
    />
  );
}
