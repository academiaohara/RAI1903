"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";
import type { SquadPlayer } from "@/types/squad";
import { SQUAD_POSITIONS, SQUAD_POSITION_LABELS } from "@/types/squad";
import { groupPlayersByPosition } from "@/lib/squad-utils";
import type { FormationId, FormationSlot } from "@/lib/lineup-formations";

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

type DropdownState = {
  slotIndex: number;
  top: number;
  left: number;
};

type LineupPitchProps = {
  formation: FormationId;
  slots: FormationSlot[];
  assignments: Array<string | null>;
  playersById: Map<string, SquadPlayer>;
  squad: SquadPlayer[];
  assignedIds: Set<string>;
  onPlayerAssign: (playerId: string, slotIndex: number) => void;
  onRemovePlayer: (slotIndex: number) => void;
  exportMode?: boolean;
};

export function LineupPitch({
  formation,
  slots,
  assignments,
  playersById,
  squad,
  assignedIds,
  onPlayerAssign,
  onRemovePlayer,
  exportMode = false,
}: LineupPitchProps) {
  const [dropdown, setDropdown] = useState<DropdownState | null>(null);
  const isClient = useIsClient();
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const groupedPlayers = useMemo(() => groupPlayersByPosition(squad), [squad]);

  useEffect(() => {
    if (!dropdown) return;
    const close = () => setDropdown(null);
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
    };
  }, [dropdown]);

  const openDropdown = (slotIndex: number) => {
    const el = slotRefs.current[slotIndex];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dropWidth = 228;
    let top = rect.bottom + 6;
    let left = rect.left + rect.width / 2 - dropWidth / 2;
    left = Math.max(8, Math.min(window.innerWidth - dropWidth - 8, left));
    if (top + 340 > window.innerHeight) {
      top = Math.max(8, rect.top - 340 - 6);
    }
    setDropdown({ slotIndex, top, left });
  };

  const handleSlotClick = (slotIndex: number) => {
    if (exportMode) return;
    openDropdown(slotIndex);
  };

  const handleRemoveClick = (e: React.MouseEvent, slotIndex: number) => {
    if (exportMode) return;
    e.stopPropagation();
    onRemovePlayer(slotIndex);
  };

  const handlePlayerSelect = (playerId: string) => {
    if (!dropdown) return;
    onPlayerAssign(playerId, dropdown.slotIndex);
    setDropdown(null);
  };

  return (
    <div className="lineup-pitch-shell">
      <div className={`lineup-pitch${exportMode ? " lineup-pitch--export" : ""}`}>
        {slots.map((slot, index) => {
          const playerId = assignments[index];
          const player = playerId ? playersById.get(playerId) : undefined;

          return (
            // Using div with role="button" to avoid invalid nested <button> elements
            <div
              key={`${formation}-${index}`}
              ref={(el) => {
                slotRefs.current[index] = el;
              }}
              role={exportMode ? undefined : "button"}
              tabIndex={exportMode ? undefined : 0}
              onClick={exportMode ? undefined : () => handleSlotClick(index)}
              onKeyDown={
                exportMode
                  ? undefined
                  : (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSlotClick(index);
                      }
                    }
              }
              className="lineup-pitch-slot"
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
              aria-label={
                player
                  ? `${player.apellido || player.nombre}, cambiar`
                  : `${slot.label}, seleccionar jugador`
              }
            >
              {player ? (
                <div className="pitch-player-node">
                  <div className="pitch-player-photo">
                    <PlayerAvatar
                      player={player}
                      bare
                      placeholderTone="light"
                      imageClassName="object-cover object-[center_top]"
                      className="h-full w-full"
                    />
                  </div>
                  {!exportMode && (
                    <button
                      type="button"
                      className="pitch-player-remove"
                      onClick={(e) => handleRemoveClick(e, index)}
                      aria-label="Quitar jugador"
                    >
                      ×
                    </button>
                  )}
                  <span className="pitch-player-name">
                    {player.apellido || player.nombre}
                  </span>
                </div>
              ) : (
                <div className="pitch-slot-empty">
                  <span className="pitch-slot-label">{slot.label}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isClient &&
        dropdown !== null &&
        !exportMode &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setDropdown(null)}
            />
            <div
              className="lineup-dropdown"
              style={{ top: dropdown.top, left: dropdown.left }}
            >
              <div className="lineup-dropdown-header">
                <span>Elige jugador — {slots[dropdown.slotIndex]?.label}</span>
                <button
                  type="button"
                  onClick={() => setDropdown(null)}
                  className="lineup-dropdown-close"
                  aria-label="Cerrar"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {assignments[dropdown.slotIndex] &&
                (() => {
                  const currentId = assignments[dropdown.slotIndex];
                  const currentPlayer = currentId
                    ? playersById.get(currentId)
                    : undefined;
                  return currentPlayer ? (
                    <div className="lineup-dropdown-current">
                      <button
                        type="button"
                        className="lineup-dropdown-remove-current"
                        onClick={() => {
                          onRemovePlayer(dropdown.slotIndex);
                          setDropdown(null);
                        }}
                      >
                        <X className="h-3 w-3" />
                        <span>
                          Quitar a {currentPlayer.apellido || currentPlayer.nombre}
                        </span>
                      </button>
                    </div>
                  ) : null;
                })()}
              {SQUAD_POSITIONS.map((position) => {
                const currentSlotPlayerId = assignments[dropdown.slotIndex];
                const list = groupedPlayers[position].filter(
                  (p) =>
                    !assignedIds.has(p.id) || p.id === currentSlotPlayerId,
                );
                if (list.length === 0) return null;
                return (
                  <div key={position}>
                    <p className="lineup-dropdown-group-label">
                      {SQUAD_POSITION_LABELS[position]}
                    </p>
                    {list.map((player) => (
                      <button
                        key={player.id}
                        type="button"
                        className={`lineup-dropdown-player${
                          player.id === currentSlotPlayerId
                            ? " lineup-dropdown-player--current"
                            : ""
                        }`}
                        onClick={() => handlePlayerSelect(player.id)}
                      >
                        <span className="lineup-dropdown-dorsal">
                          {player.dorsal}
                        </span>
                        <div className="lineup-dropdown-avatar">
                          <PlayerAvatar
                            player={player}
                            bare
                            placeholderTone="dark"
                            className="h-full w-full"
                          />
                        </div>
                        <span className="lineup-dropdown-name">
                          {player.apellido
                            ? `${player.nombre} ${player.apellido}`
                            : player.nombre}
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
