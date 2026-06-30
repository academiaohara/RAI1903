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

type PickerMode = "starter" | "substitute";

type DropdownState = {
  slotIndex: number;
  top: number;
  left: number;
  mode: PickerMode;
};

type LineupPitchProps = {
  formation: FormationId;
  slots: FormationSlot[];
  assignments: Array<string | null>;
  substitutes: Array<string | null>;
  showSubstitutes: boolean;
  playersById: Map<string, SquadPlayer>;
  squad: SquadPlayer[];
  assignedIds: Set<string>;
  onPlayerAssign: (playerId: string, slotIndex: number) => void;
  onRemovePlayer: (slotIndex: number) => void;
  onSubstituteAssign: (playerId: string, slotIndex: number) => void;
  onRemoveSubstitute: (slotIndex: number) => void;
  exportMode?: boolean;
};

export function LineupPitch({
  formation,
  slots,
  assignments,
  substitutes,
  showSubstitutes,
  playersById,
  squad,
  assignedIds,
  onPlayerAssign,
  onRemovePlayer,
  onSubstituteAssign,
  onRemoveSubstitute,
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

  const openDropdown = (slotIndex: number, mode: PickerMode) => {
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
    setDropdown({ slotIndex, top, left, mode });
  };

  const handleSlotClick = (slotIndex: number) => {
    if (exportMode) return;
    openDropdown(slotIndex, "starter");
  };

  const handleSubClick = (e: React.MouseEvent, slotIndex: number) => {
    if (exportMode) return;
    e.stopPropagation();
    openDropdown(slotIndex, "substitute");
  };

  const handleRemoveClick = (e: React.MouseEvent, slotIndex: number) => {
    if (exportMode) return;
    e.stopPropagation();
    onRemovePlayer(slotIndex);
  };

  const handlePlayerSelect = (playerId: string) => {
    if (!dropdown) return;
    if (dropdown.mode === "substitute") {
      onSubstituteAssign(playerId, dropdown.slotIndex);
    } else {
      onPlayerAssign(playerId, dropdown.slotIndex);
    }
    setDropdown(null);
  };

  const dropdownMode = dropdown?.mode ?? "starter";
  const dropdownSlotIndex = dropdown?.slotIndex ?? 0;
  const currentStarterId = assignments[dropdownSlotIndex];
  const currentSubId = substitutes[dropdownSlotIndex];

  return (
    <div className="lineup-pitch-shell">
      <div className={`lineup-pitch${exportMode ? " lineup-pitch--export" : ""}`}>
        {slots.map((slot, index) => {
          const playerId = assignments[index];
          const player = playerId ? playersById.get(playerId) : undefined;
          const subId = substitutes[index];
          const sub = subId ? playersById.get(subId) : undefined;

          return (
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
                  {showSubstitutes &&
                    (sub ? (
                      <button
                        type="button"
                        className="pitch-player-sub-name"
                        onClick={(e) => handleSubClick(e, index)}
                        aria-label={`Suplente: ${sub.apellido || sub.nombre}, cambiar`}
                      >
                        {sub.apellido || sub.nombre}
                      </button>
                    ) : (
                      !exportMode && (
                        <button
                          type="button"
                          className="pitch-player-sub-add"
                          onClick={(e) => handleSubClick(e, index)}
                          aria-label="Añadir suplente"
                        >
                          +
                        </button>
                      )
                    ))}
                </div>
              ) : (
                <div className="pitch-slot-empty">
                  <span className="pitch-slot-add" aria-hidden="true">
                    +
                  </span>
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
                <span>
                  {dropdownMode === "substitute"
                    ? `Elige suplente — ${slots[dropdownSlotIndex]?.label}`
                    : `Elige jugador — ${slots[dropdownSlotIndex]?.label}`}
                </span>
                <button
                  type="button"
                  onClick={() => setDropdown(null)}
                  className="lineup-dropdown-close"
                  aria-label="Cerrar"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {dropdownMode === "starter" &&
                currentStarterId &&
                (() => {
                  const currentPlayer = playersById.get(currentStarterId);
                  return currentPlayer ? (
                    <div className="lineup-dropdown-current">
                      <button
                        type="button"
                        className="lineup-dropdown-remove-current"
                        onClick={() => {
                          onRemovePlayer(dropdownSlotIndex);
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
              {dropdownMode === "substitute" &&
                currentSubId &&
                (() => {
                  const currentSub = playersById.get(currentSubId);
                  return currentSub ? (
                    <div className="lineup-dropdown-current">
                      <button
                        type="button"
                        className="lineup-dropdown-remove-current"
                        onClick={() => {
                          onRemoveSubstitute(dropdownSlotIndex);
                          setDropdown(null);
                        }}
                      >
                        <X className="h-3 w-3" />
                        <span>
                          Quitar suplente {currentSub.apellido || currentSub.nombre}
                        </span>
                      </button>
                    </div>
                  ) : null;
                })()}
              {SQUAD_POSITIONS.map((position) => {
                const currentSlotPlayerId =
                  dropdownMode === "substitute" ? currentSubId : currentStarterId;
                const starterInSlot = assignments[dropdownSlotIndex];
                const list = groupedPlayers[position].filter((p) => {
                  if (p.id === currentSlotPlayerId) return true;
                  if (dropdownMode === "substitute" && p.id === starterInSlot) return false;
                  return !assignedIds.has(p.id);
                });
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
