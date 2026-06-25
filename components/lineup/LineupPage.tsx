"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Share2 } from "lucide-react";
import { useSeason } from "@/components/season/SeasonProvider";
import { LineupPitch } from "@/components/lineup/LineupPitch";
import { OpponentCrest } from "@/components/OpponentCrest";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import { usePrimerEquipoLeagueSeason } from "@/hooks/usePrimerEquipoLeagueSeason";
import {
  DEFAULT_FORMATION,
  FORMATION_OPTIONS,
  FORMATION_SLOTS,
  type FormationId,
  type FormationSlot,
} from "@/lib/lineup-formations";
import { shareLineupImage } from "@/lib/lineup-share";
import {
  createEmptySlots,
  loadSavedLineup,
  resizeLineupSlots,
  saveLineup,
} from "@/lib/lineup-storage";
import { type PrimerEquipoGender } from "@/lib/primer-equipo";
import { getTeamCrestById } from "@/lib/team-crests";
import { RAI_FEM_TEAM_ID, RAI_TEAM_ID } from "@/data/mock";
import type { SquadPlayer } from "@/types/squad";

type LineupPageProps = {
  gender: PrimerEquipoGender;
};

function initialLineupState(seasonId: string, gender: PrimerEquipoGender) {
  const saved = loadSavedLineup(seasonId, gender);
  const formation = saved?.formation ?? DEFAULT_FORMATION;
  const assignments = saved
    ? resizeLineupSlots(saved.slots, FORMATION_SLOTS[formation].length)
    : createEmptySlots(FORMATION_SLOTS[formation].length);
  return { formation, assignments };
}

type LineupListPanelProps = {
  slots: FormationSlot[];
  assignments: Array<string | null>;
  playersById: Map<string, SquadPlayer>;
};

function LineupListPanel({ slots, assignments, playersById }: LineupListPanelProps) {
  return (
    <div className="lineup-list-panel">
      <h3 className="lineup-list-title">Once titular</h3>
      <ol className="lineup-list">
        {slots.map((slot, index) => {
          const playerId = assignments[index];
          const player = playerId ? playersById.get(playerId) : null;
          const name = player ? (player.apellido || player.nombre) : "—";
          return (
            <li key={index} className="lineup-list-row">
              <span className="lineup-list-label">{slot.label}</span>
              <span className={`lineup-list-player${!player ? " lineup-list-player--empty" : ""}`}>
                {name}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

type LineupBoardProps = {
  gender: PrimerEquipoGender;
  seasonId: string;
  seasonLabel: string;
  squad: SquadPlayer[];
};

function LineupBoard({ gender, seasonId, seasonLabel, squad }: LineupBoardProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [{ formation, assignments }, setLineupState] = useState(() =>
    initialLineupState(seasonId, gender),
  );
  const [sharing, setSharing] = useState(false);

  const { nextMatch, teams } = usePrimerEquipoLeagueSeason(gender);
  const highlightTeamId = gender === "femenino" ? RAI_FEM_TEAM_ID : RAI_TEAM_ID;

  const rival = useMemo(() => {
    if (!nextMatch) return null;
    const isHome = nextMatch.homeTeamId === highlightTeamId;
    const rivalTeamId = isHome ? nextMatch.awayTeamId : nextMatch.homeTeamId;
    const rivalName = isHome ? nextMatch.awayTeam : nextMatch.homeTeam;
    const rivalTeam = teams.find((t) => t.id === rivalTeamId);
    const rivalCrest = getTeamCrestById(rivalTeamId, rivalTeam?.crestInitials);
    return { teamId: rivalTeamId, name: rivalName, crest: rivalCrest };
  }, [nextMatch, teams, highlightTeamId]);

  const playersById = useMemo(
    () => new Map(squad.map((player) => [player.id, player])),
    [squad],
  );
  const assignedIds = useMemo(
    () => new Set(assignments.filter((entry): entry is string => Boolean(entry))),
    [assignments],
  );
  const slots = FORMATION_SLOTS[formation];

  useEffect(() => {
    saveLineup(seasonId, gender, { formation, slots: assignments });
  }, [assignments, formation, gender, seasonId]);

  const handleFormationChange = useCallback((nextFormation: FormationId) => {
    setLineupState((current) => ({
      formation: nextFormation,
      assignments: resizeLineupSlots(current.assignments, FORMATION_SLOTS[nextFormation].length),
    }));
  }, []);

  const assignPlayerToSlot = useCallback((playerId: string, slotIndex: number) => {
    setLineupState((current) => {
      const next = [...current.assignments];
      const existingIndex = next.findIndex((entry) => entry === playerId);
      if (existingIndex >= 0) next[existingIndex] = null;
      next[slotIndex] = playerId;
      return { ...current, assignments: next };
    });
  }, []);

  const removeFromSlot = useCallback((slotIndex: number) => {
    setLineupState((current) => {
      const next = [...current.assignments];
      next[slotIndex] = null;
      return { ...current, assignments: next };
    });
  }, []);

  const handleShare = useCallback(async () => {
    if (!exportRef.current || sharing) return;
    setSharing(true);
    try {
      await shareLineupImage({
        node: exportRef.current,
        fileName: `lineup-${gender}-${seasonLabel.replace("/", "-")}.png`,
        shareText: `Mi XI del Avilés (${formation}) #RealAviles`,
      });
    } finally {
      setSharing(false);
    }
  }, [formation, gender, sharing, seasonLabel]);

  return (
    <div className="lineup-page space-y-4">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#214C9B]/70">
            Lineup
          </p>
          <h1 className="mt-0.5 text-2xl font-extrabold uppercase tracking-tight text-slate-900 sm:text-3xl">
            Arma tu once
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#214C9B]/80 hidden sm:inline">
              Formación
            </span>
            <select
              value={formation}
              onChange={(e) => handleFormationChange(e.target.value as FormationId)}
              className="rounded-xl border border-[#214C9B]/20 bg-white px-3 py-2 text-sm font-bold text-slate-800 shadow-sm outline-none focus:border-[#214C9B] focus:ring-2 focus:ring-[#214C9B]/20"
            >
              {FORMATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
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
      </div>

      {/* Main layout: pizarra + list */}
      <div className="lineup-main-grid">
        <section className="lineup-pizarra-section">
          {/* Standalone header: XI RAI + formation + rival — above the pitch */}
          <div className="lineup-card-header-standalone">
            <div className="lineup-card-header-left">
              <span className="lineup-card-xi">XI RAI</span>
              <span className="lineup-card-formation-badge">{formation}</span>
            </div>
            {rival && (
              <div className="lineup-card-header-right">
                <span className="lineup-card-vs">vs</span>
                <OpponentCrest
                  logo={rival.crest}
                  opponent={rival.name}
                  size="lg"
                  className="lineup-card-rival-crest"
                />
                <span className="lineup-card-rival-name">{rival.name}</span>
              </div>
            )}
          </div>

          <div ref={exportRef} className="lineup-export-card">
            <LineupPitch
              formation={formation}
              slots={slots}
              assignments={assignments}
              playersById={playersById}
              squad={squad}
              assignedIds={assignedIds}
              onPlayerAssign={assignPlayerToSlot}
              onRemovePlayer={removeFromSlot}
            />
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-slate-500">
            {assignedIds.size < 11
              ? `Pulsa una posición para elegir jugador · ${assignedIds.size}/11 colocados`
              : "Once completo · Pulsa ✕ sobre un jugador para quitarlo"}
          </p>
        </section>

        <aside className="lineup-list-section">
          <LineupListPanel
            slots={slots}
            assignments={assignments}
            playersById={playersById}
          />
        </aside>
      </div>
    </div>
  );
}

export function LineupPage({ gender }: LineupPageProps) {
  const { squad } = useSquadPlayers(gender);
  const { viewedSeasonId, viewedSeason } = useSeason();

  return (
    <LineupBoard
      key={`${viewedSeasonId}-${gender}`}
      gender={gender}
      seasonId={viewedSeasonId}
      seasonLabel={viewedSeason.label}
      squad={squad}
    />
  );
}
