"use client";

import { Plus, Trash2 } from "lucide-react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useMatchDetailStorageKeys } from "@/components/match-center/useMatchDetailOverrides";
import type { LineupPlayer, MatchLineup } from "@/types";

function LineupColumn({
  title,
  lineup,
  editMode,
  onFormationChange,
  onUpdatePlayer,
  onRemovePlayer,
  onAddPlayer,
}: {
  title: string;
  lineup: MatchLineup;
  editMode: boolean;
  onFormationChange: (formation: string) => void;
  onUpdatePlayer: (list: "starters" | "bench", index: number, patch: Partial<LineupPlayer>) => void;
  onRemovePlayer: (list: "starters" | "bench", index: number) => void;
  onAddPlayer: (list: "starters" | "bench") => void;
}) {
  const renderList = (list: "starters" | "bench", label: string, highlighted: boolean) => (
  <>
      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
        {editMode && (
          <button
            type="button"
            onClick={() => onAddPlayer(list)}
            className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-[#214C9B] hover:underline"
          >
            <Plus size={12} aria-hidden />
            Añadir
          </button>
        )}
      </div>
      <ul className="mt-2 space-y-1">
        {lineup[list].map((player, index) => (
          <li key={`${list}-${player.number}-${player.name}-${index}`} className="flex min-w-0 items-center gap-2 text-sm text-slate-800">
            {editMode ? (
              <>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={player.number}
                  onChange={(event) => onUpdatePlayer(list, index, { number: Number(event.target.value) || 0 })}
                  aria-label={`Dorsal de ${player.name}`}
                  className="h-8 w-10 shrink-0 rounded-lg border border-[#214C9B]/25 text-center text-xs font-extrabold text-[#214C9B] outline-none focus:border-[#214C9B]"
                />
                <input
                  value={player.name}
                  onChange={(event) => onUpdatePlayer(list, index, { name: event.target.value })}
                  aria-label="Nombre del jugador"
                  className="min-w-0 flex-1 rounded-lg border border-[#214C9B]/25 px-2 py-1 text-sm font-semibold outline-none focus:border-[#214C9B]"
                />
                <button
                  type="button"
                  onClick={() => onRemovePlayer(list, index)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#981915] hover:bg-red-50"
                  aria-label="Quitar jugador"
                >
                  <Trash2 size={14} />
                </button>
              </>
            ) : (
              <>
                <span
                  className={
                    highlighted
                      ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#214C9B] text-xs font-extrabold text-white"
                      : "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[#214C9B]/25 text-xs font-bold text-[#214C9B]"
                  }
                >
                  {player.number}
                </span>
                <span className="min-w-0 truncate font-semibold" title={player.name}>
                  {player.name}
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <div className="min-w-0 rounded-2xl border border-[#214C9B]/15 bg-slate-50/80 p-4">
      <div className="flex min-w-0 items-baseline justify-between gap-2">
        <h3 className="min-w-0 truncate text-sm font-extrabold uppercase text-[#214C9B]" title={title}>
          {title}
        </h3>
        {editMode ? (
          <input
            value={lineup.formation}
            onChange={(event) => onFormationChange(event.target.value)}
            aria-label="Formacion tactica"
            className="w-20 shrink-0 rounded-lg border border-[#214C9B]/25 px-2 py-0.5 text-xs font-bold text-slate-600 outline-none focus:border-[#214C9B]"
          />
        ) : (
          <span className="shrink-0 text-xs font-bold text-slate-500">{lineup.formation}</span>
        )}
      </div>
      {renderList("starters", "Titulares", true)}
      {(lineup.bench.length > 0 || editMode) && renderList("bench", "Suplentes", false)}
    </div>
  );
}

export function MatchLineupsPanel({
  matchId,
  homeLabel,
  awayLabel,
  homeLineup,
  awayLineup,
}: {
  matchId: string;
  homeLabel: string;
  awayLabel: string;
  homeLineup: MatchLineup;
  awayLineup: MatchLineup;
}) {
  const { editMode, getValue, saveValue } = useInlineEditing();
  const keys = useMatchDetailStorageKeys(matchId);
  const currentHome = getValue(keys.homeLineup, homeLineup);
  const currentAway = getValue(keys.awayLineup, awayLineup);

  const updateHome = (lineup: MatchLineup) => saveValue(keys.homeLineup, lineup);
  const updateAway = (lineup: MatchLineup) => saveValue(keys.awayLineup, lineup);

  const patchLineup = (
    side: "home" | "away",
    updater: (lineup: MatchLineup) => MatchLineup,
  ) => {
    if (side === "home") updateHome(updater(currentHome));
    else updateAway(updater(currentAway));
  };

  const lineupHandlers = (side: "home" | "away", lineup: MatchLineup) => ({
    lineup,
    editMode,
    onFormationChange: (formation: string) => patchLineup(side, (current) => ({ ...current, formation })),
    onUpdatePlayer: (list: "starters" | "bench", index: number, patch: Partial<LineupPlayer>) =>
      patchLineup(side, (current) => ({
        ...current,
        [list]: current[list].map((player, playerIndex) => (playerIndex === index ? { ...player, ...patch } : player)),
      })),
    onRemovePlayer: (list: "starters" | "bench", index: number) =>
      patchLineup(side, (current) => ({
        ...current,
        [list]: current[list].filter((_, playerIndex) => playerIndex !== index),
      })),
    onAddPlayer: (list: "starters" | "bench") =>
      patchLineup(side, (current) => ({
        ...current,
        [list]: [...current[list], { number: current[list].length + 1, name: "Nuevo jugador" }],
      })),
  });

  return (
    <section>
      <h2 className="text-lg font-extrabold uppercase tracking-normal text-[#214C9B]">Alineaciones</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <LineupColumn title={homeLabel} {...lineupHandlers("home", currentHome)} />
        <LineupColumn title={awayLabel} {...lineupHandlers("away", currentAway)} />
      </div>
    </section>
  );
}
