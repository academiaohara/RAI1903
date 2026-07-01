"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
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
import { downloadLineupImage, shareLineupImage, shareLineupOnX } from "@/lib/lineup-share";
import { isSchedulableMatchDate } from "@/lib/match-calendar-dates";
import {
  createEmptySlots,
  loadSavedLineup,
  resizeLineupSlots,
  resizeLineupSubstitutes,
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
  const slotCount = FORMATION_SLOTS[formation].length;
  const assignments = saved
    ? resizeLineupSlots(saved.slots, slotCount)
    : createEmptySlots(slotCount);
  const substitutes = saved
    ? resizeLineupSubstitutes(saved.substitutes ?? [], slotCount)
    : createEmptySlots(slotCount);
  const showRival = saved?.showRival !== false;
  const showSubstitutes = saved?.showSubstitutes === true;
  return { formation, assignments, substitutes, showRival, showSubstitutes };
}

type LineupListPanelProps = {
  slots: FormationSlot[];
  assignments: Array<string | null>;
  substitutes: Array<string | null>;
  showSubstitutes: boolean;
  playersById: Map<string, SquadPlayer>;
};

function playerListName(player: SquadPlayer): string {
  return player.apellido || player.nombre;
}

function LineupListPanel({
  slots,
  assignments,
  substitutes,
  showSubstitutes,
  playersById,
}: LineupListPanelProps) {
  const substitutePlayers = showSubstitutes
    ? substitutes
        .map((subId) => (subId ? playersById.get(subId) : null))
        .filter((player): player is SquadPlayer => Boolean(player))
    : [];

  return (
    <div className="lineup-list-panel">
      <h3 className="lineup-list-title">Once titular</h3>
      <ol className="lineup-list">
        {slots.map((slot, index) => {
          const playerId = assignments[index];
          const player = playerId ? playersById.get(playerId) : null;
          const name = player ? playerListName(player) : "—";
          return (
            <li key={index} className="lineup-list-row">
              <span className="lineup-list-label">{slot.label}</span>
              <span
                className={`lineup-list-dorsal${!player ? " lineup-list-dorsal--empty" : ""}`}
              >
                {player ? player.dorsal : "—"}
              </span>
              <span className={`lineup-list-player${!player ? " lineup-list-player--empty" : ""}`}>
                {name}
              </span>
            </li>
          );
        })}
      </ol>
      {showSubstitutes && (
        <>
          <h3 className="lineup-list-title lineup-list-title--subs">Suplentes</h3>
          {substitutePlayers.length > 0 ? (
            <ol className="lineup-list lineup-list--subs">
              {substitutePlayers.map((player) => (
                <li key={player.id} className="lineup-list-row">
                  <span className="lineup-list-dorsal lineup-list-dorsal--sub">{player.dorsal}</span>
                  <span className="lineup-list-player lineup-list-player--sub">
                    {playerListName(player)}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="lineup-list-empty-subs">Sin suplentes asignados</p>
          )}
        </>
      )}
    </div>
  );
}

type RivalPreview = {
  teamId: string;
  name: string;
  crest: string;
};

type LineupPizarraCardProps = {
  formation: FormationId;
  slots: FormationSlot[];
  assignments: Array<string | null>;
  substitutes: Array<string | null>;
  showSubstitutes: boolean;
  playersById: Map<string, SquadPlayer>;
  squad: SquadPlayer[];
  assignedIds: Set<string>;
  rival: RivalPreview | null;
  showRival: boolean;
  exportMode?: boolean;
  exportRef?: RefObject<HTMLDivElement | null>;
  onPlayerAssign?: (playerId: string, slotIndex: number) => void;
  onRemovePlayer?: (slotIndex: number) => void;
  onSubstituteAssign?: (playerId: string, slotIndex: number) => void;
  onRemoveSubstitute?: (slotIndex: number) => void;
};

function LineupPizarraCard({
  formation,
  slots,
  assignments,
  substitutes,
  showSubstitutes,
  playersById,
  squad,
  assignedIds,
  rival,
  showRival,
  exportMode = false,
  exportRef,
  onPlayerAssign,
  onRemovePlayer,
  onSubstituteAssign,
  onRemoveSubstitute,
}: LineupPizarraCardProps) {
  return (
    <div
      ref={exportRef}
      className={`lineup-export-card${exportMode ? " lineup-export-card--capture" : ""}`}
    >
      <div className="lineup-card-header">
        <div className="lineup-card-header-left">
          <span className="lineup-card-xi">XI RAI</span>
          <span className="lineup-card-formation-badge">{formation}</span>
        </div>
        {rival && showRival && (
          <div className="lineup-card-header-right">
            <span className="lineup-card-vs">VS</span>
            <OpponentCrest
              logo={rival.crest}
              opponent={rival.name}
              size="lg"
              className="lineup-card-rival-crest"
            />
          </div>
        )}
      </div>
      <LineupPitch
        formation={formation}
        slots={slots}
        assignments={assignments}
        substitutes={substitutes}
        showSubstitutes={showSubstitutes}
        playersById={playersById}
        squad={squad}
        assignedIds={assignedIds}
        onPlayerAssign={onPlayerAssign ?? (() => {})}
        onRemovePlayer={onRemovePlayer ?? (() => {})}
        onSubstituteAssign={onSubstituteAssign ?? (() => {})}
        onRemoveSubstitute={onRemoveSubstitute ?? (() => {})}
        exportMode={exportMode}
      />
      {exportMode && (
        <span className="lineup-export-watermark" aria-hidden="true">
          @Rai1903fan
        </span>
      )}
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
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const [{ formation, assignments, substitutes, showRival, showSubstitutes }, setLineupState] =
    useState(() => initialLineupState(seasonId, gender));
  const [sharing, setSharing] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const { nextMatch, teams, leagueMatchdays, avilesMatches } = usePrimerEquipoLeagueSeason(gender);
  const highlightTeamId = gender === "femenino" ? RAI_FEM_TEAM_ID : RAI_TEAM_ID;

  const hasCalendar = useMemo(() => {
    if (leagueMatchdays.length === 0) return false;
    return avilesMatches.some((match) => isSchedulableMatchDate(match.date));
  }, [avilesMatches, leagueMatchdays]);

  const rival = useMemo(() => {
    if (!hasCalendar || !nextMatch || !isSchedulableMatchDate(nextMatch.date)) return null;
    const isHome = nextMatch.homeTeamId === highlightTeamId;
    const rivalTeamId = isHome ? nextMatch.awayTeamId : nextMatch.homeTeamId;
    const rivalName = isHome ? nextMatch.awayTeam : nextMatch.homeTeam;
    const rivalTeam = teams.find((t) => t.id === rivalTeamId);
    const rivalCrest = getTeamCrestById(rivalTeamId, rivalTeam?.crestInitials);
    return { teamId: rivalTeamId, name: rivalName, crest: rivalCrest };
  }, [hasCalendar, nextMatch, teams, highlightTeamId]);

  const playersById = useMemo(
    () => new Map(squad.map((player) => [player.id, player])),
    [squad],
  );
  const starterCount = useMemo(
    () => assignments.filter((entry): entry is string => Boolean(entry)).length,
    [assignments],
  );
  const assignedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const entry of assignments) {
      if (entry) ids.add(entry);
    }
    for (const entry of substitutes) {
      if (entry) ids.add(entry);
    }
    return ids;
  }, [assignments, substitutes]);
  const slots = FORMATION_SLOTS[formation];

  useEffect(() => {
    saveLineup(seasonId, gender, {
      formation,
      slots: assignments,
      substitutes,
      showRival,
      showSubstitutes,
    });
  }, [assignments, substitutes, formation, gender, seasonId, showRival, showSubstitutes]);

  useEffect(() => {
    if (!shareMenuOpen) return;
    const close = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShareMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [shareMenuOpen]);

  const handleFormationChange = useCallback((nextFormation: FormationId) => {
    setLineupState((current) => {
      const nextCount = FORMATION_SLOTS[nextFormation].length;
      return {
        formation: nextFormation,
        assignments: resizeLineupSlots(current.assignments, nextCount),
        substitutes: resizeLineupSubstitutes(current.substitutes, nextCount),
        showRival: current.showRival,
        showSubstitutes: current.showSubstitutes,
      };
    });
  }, []);

  const assignPlayerToSlot = useCallback((playerId: string, slotIndex: number) => {
    setLineupState((current) => {
      const nextAssignments = [...current.assignments];
      const nextSubstitutes = [...current.substitutes];
      const existingStarterIndex = nextAssignments.findIndex((entry) => entry === playerId);
      if (existingStarterIndex >= 0) nextAssignments[existingStarterIndex] = null;
      const existingSubIndex = nextSubstitutes.findIndex((entry) => entry === playerId);
      if (existingSubIndex >= 0) nextSubstitutes[existingSubIndex] = null;
      nextAssignments[slotIndex] = playerId;
      return { ...current, assignments: nextAssignments, substitutes: nextSubstitutes };
    });
  }, []);

  const removeFromSlot = useCallback((slotIndex: number) => {
    setLineupState((current) => {
      const nextAssignments = [...current.assignments];
      const nextSubstitutes = [...current.substitutes];
      nextAssignments[slotIndex] = null;
      nextSubstitutes[slotIndex] = null;
      return { ...current, assignments: nextAssignments, substitutes: nextSubstitutes };
    });
  }, []);

  const assignSubstituteToSlot = useCallback((playerId: string, slotIndex: number) => {
    setLineupState((current) => {
      const nextSubstitutes = [...current.substitutes];
      const nextAssignments = [...current.assignments];
      const existingStarterIndex = nextAssignments.findIndex((entry) => entry === playerId);
      if (existingStarterIndex >= 0) nextAssignments[existingStarterIndex] = null;
      const existingSubIndex = nextSubstitutes.findIndex((entry) => entry === playerId);
      if (existingSubIndex >= 0) nextSubstitutes[existingSubIndex] = null;
      nextSubstitutes[slotIndex] = playerId;
      return { ...current, assignments: nextAssignments, substitutes: nextSubstitutes };
    });
  }, []);

  const removeSubstituteFromSlot = useCallback((slotIndex: number) => {
    setLineupState((current) => {
      const nextSubstitutes = [...current.substitutes];
      nextSubstitutes[slotIndex] = null;
      return { ...current, substitutes: nextSubstitutes };
    });
  }, []);

  const runShareAction = useCallback(
    async (action: "native" | "x" | "download") => {
      if (!exportRef.current || sharing) return;
      setSharing(true);
      setShareMenuOpen(false);
      setIsCapturing(true);
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      try {
        const options = {
          node: exportRef.current,
          fileName: `lineup-${gender}-${seasonLabel.replace("/", "-")}.png`,
          shareText: `Mi XI del Avilés (${formation}) #RealAviles`,
        };
        if (action === "native") {
          await shareLineupImage(options);
        } else if (action === "x") {
          await shareLineupOnX(options);
        } else {
          await downloadLineupImage(options);
        }
      } finally {
        setIsCapturing(false);
        setSharing(false);
      }
    },
    [formation, gender, sharing, seasonLabel],
  );

  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

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
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#214C9B]/15 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">
            <input
              type="checkbox"
              checked={showSubstitutes}
              onChange={(e) =>
                setLineupState((current) => ({ ...current, showSubstitutes: e.target.checked }))
              }
              className="h-4 w-4 rounded border-[#214C9B]/30 text-[#214C9B] focus:ring-[#214C9B]/30"
            />
            <span>Suplentes</span>
          </label>
          {rival && (
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#214C9B]/15 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">
              <input
                type="checkbox"
                checked={showRival}
                onChange={(e) =>
                  setLineupState((current) => ({ ...current, showRival: e.target.checked }))
                }
                className="h-4 w-4 rounded border-[#214C9B]/30 text-[#214C9B] focus:ring-[#214C9B]/30"
              />
              <span>Mostrar rival</span>
            </label>
          )}
          <div className="relative" ref={shareMenuRef}>
            <button
              type="button"
              onClick={() => setShareMenuOpen((open) => !open)}
              disabled={sharing || starterCount === 0}
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#214C9B] px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-[#214C9B] transition hover:bg-[#214C9B] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Share2 className="h-4 w-4" aria-hidden />
              {sharing ? "Generando…" : "Compartir"}
            </button>
            {shareMenuOpen && !sharing && (
              <div className="lineup-share-menu">
                {canNativeShare && (
                  <button
                    type="button"
                    className="lineup-share-menu-item"
                    onClick={() => void runShareAction("native")}
                  >
                    Compartir…
                  </button>
                )}
                <button
                  type="button"
                  className="lineup-share-menu-item"
                  onClick={() => void runShareAction("x")}
                >
                  Compartir en X
                </button>
                <button
                  type="button"
                  className="lineup-share-menu-item"
                  onClick={() => void runShareAction("download")}
                >
                  Descargar imagen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main layout: pizarra + list */}
      <div className="lineup-main-grid">
        <div>
          <section className="lineup-pizarra-section lineup-export-wrapper">
            <LineupPizarraCard
              exportRef={exportRef}
              formation={formation}
              slots={slots}
              assignments={assignments}
              substitutes={substitutes}
              showSubstitutes={showSubstitutes}
              playersById={playersById}
              squad={squad}
              assignedIds={assignedIds}
              rival={rival}
              showRival={showRival}
              exportMode={isCapturing}
              onPlayerAssign={assignPlayerToSlot}
              onRemovePlayer={removeFromSlot}
              onSubstituteAssign={assignSubstituteToSlot}
              onRemoveSubstitute={removeSubstituteFromSlot}
            />
          </section>
          <p className="mt-2 text-center text-xs font-semibold text-slate-500">
            {starterCount < 11
              ? `Pulsa una posición para elegir jugador · ${starterCount}/11 colocados`
              : showSubstitutes
                ? "Once completo · Pulsa el cartel granate para añadir suplente"
                : "Once completo · Pulsa ✕ sobre un jugador para quitarlo"}
          </p>
        </div>

        <aside className="lineup-list-section">
          <LineupListPanel
            slots={slots}
            assignments={assignments}
            substitutes={substitutes}
            showSubstitutes={showSubstitutes}
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
