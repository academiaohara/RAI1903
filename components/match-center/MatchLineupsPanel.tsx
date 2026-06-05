"use client";

import { Plus, Trash2 } from "lucide-react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { MatchSquadPlayerSelect } from "@/components/match-center/MatchSquadPlayerSelect";
import { useMatchTeamSquadOptions } from "@/hooks/useMatchTeamSquadOptions";
import { useMatchDetailStorageKeys } from "@/components/match-center/useMatchDetailOverrides";
import type { LineupPlayer, MatchLineup, PrimerEquipoGender } from "@/types";
import type { MatchSquadOption } from "@/lib/match-availability-squad";
import type { SquadPlayer } from "@/types/squad";

function LineupPlayerRow({
  player,
  editMode,
  highlighted,
  squadOptions,
  ownSquad,
  onUpdate,
  onRemove,
}: {
  player: LineupPlayer;
  editMode: boolean;
  highlighted: boolean;
  squadOptions: MatchSquadOption[] | null;
  ownSquad: SquadPlayer[];
  onUpdate: (patch: Partial<LineupPlayer>) => void;
  onRemove: () => void;
}) {
  if (!editMode) {
    return (
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
    );
  }

  if (squadOptions && squadOptions.length > 0) {
    return (
      <>
        <span className="flex h-8 w-10 shrink-0 items-center justify-center rounded-lg border border-[#214C9B]/25 text-xs font-extrabold tabular-nums text-[#214C9B]">
          {player.number || "—"}
        </span>
        <MatchSquadPlayerSelect
          options={squadOptions}
          value={player.name}
          onChange={(name) => {
            const option = squadOptions.find((item) => item.name === name);
            onUpdate({ name, ...(option ? { number: option.dorsal } : {}) });
          }}
          squadForResolve={ownSquad}
          placeholder="Jugador de la plantilla…"
          aria-label="Nombre del jugador"
          className="min-w-0 flex-1 rounded-lg border border-[#214C9B]/25 px-2 py-1 text-sm font-semibold outline-none focus:border-[#214C9B]"
        />
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#981915] hover:bg-red-50"
          aria-label="Quitar jugador"
        >
          <Trash2 size={14} />
        </button>
      </>
    );
  }

  return (
    <>
      <input
        type="number"
        min={0}
        max={99}
        value={player.number}
        onChange={(event) => onUpdate({ number: Number(event.target.value) || 0 })}
        aria-label={`Dorsal de ${player.name}`}
        className="h-8 w-10 shrink-0 rounded-lg border border-[#214C9B]/25 text-center text-xs font-extrabold text-[#214C9B] outline-none focus:border-[#214C9B]"
      />
      <input
        type="text"
        value={player.name}
        onChange={(event) => onUpdate({ name: event.target.value })}
        aria-label="Nombre del jugador"
        className="min-w-0 flex-1 rounded-lg border border-[#214C9B]/25 px-2 py-1 text-sm font-semibold outline-none focus:border-[#214C9B]"
      />
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#981915] hover:bg-red-50"
        aria-label="Quitar jugador"
      >
        <Trash2 size={14} />
      </button>
    </>
  );
}

function LineupColumn({
  title,
  lineup,
  editMode,
  squadOptions,
  ownSquad,
  onFormationChange,
  onUpdatePlayer,
  onRemovePlayer,
  onAddPlayer,
}: {
  title: string;
  lineup: MatchLineup;
  editMode: boolean;
  squadOptions: MatchSquadOption[] | null;
  ownSquad: SquadPlayer[];
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
          <li
            key={`${list}-${index}`}
            className="flex min-w-0 items-center gap-2 text-sm text-slate-800"
          >
            <LineupPlayerRow
              player={player}
              editMode={editMode}
              highlighted={highlighted}
              squadOptions={squadOptions}
              ownSquad={ownSquad}
              onUpdate={(patch) => onUpdatePlayer(list, index, patch)}
              onRemove={() => onRemovePlayer(list, index)}
            />
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
  homeTeamId,
  awayTeamId,
  gender,
}: {
  matchId: string;
  homeLabel: string;
  awayLabel: string;
  homeLineup: MatchLineup;
  awayLineup: MatchLineup;
  homeTeamId: string;
  awayTeamId: string;
  gender: PrimerEquipoGender;
}) {
  const { editMode, getValue, saveValue } = useInlineEditing();
  const keys = useMatchDetailStorageKeys(matchId);
  const currentHome = getValue(keys.homeLineup, homeLineup);
  const currentAway = getValue(keys.awayLineup, awayLineup);
  const { getOptions, isOwnClub, ownSquad } = useMatchTeamSquadOptions(gender);

  const homeSquadOptions = isOwnClub(homeTeamId) ? getOptions(homeTeamId) : null;
  const awaySquadOptions = isOwnClub(awayTeamId) ? getOptions(awayTeamId) : null;

  const updateHome = (lineup: MatchLineup) => saveValue(keys.homeLineup, lineup);
  const updateAway = (lineup: MatchLineup) => saveValue(keys.awayLineup, lineup);

  const patchLineup = (
    side: "home" | "away",
    updater: (lineup: MatchLineup) => MatchLineup,
  ) => {
    if (side === "home") updateHome(updater(currentHome));
    else updateAway(updater(currentAway));
  };

  const addPlayer = (side: "home" | "away", list: "starters" | "bench") => {
    const options = side === "home" ? homeSquadOptions : awaySquadOptions;
    const first = options?.[0];
    patchLineup(side, (current) => ({
      ...current,
      [list]: [
        ...current[list],
        first
          ? { number: first.dorsal, name: first.name }
          : { number: current[list].length + 1, name: "Nuevo jugador" },
      ],
    }));
  };

  const lineupHandlers = (
    side: "home" | "away",
    lineup: MatchLineup,
    squadOptions: MatchSquadOption[] | null,
  ) => ({
    lineup,
    editMode,
    squadOptions,
    ownSquad,
    onFormationChange: (formation: string) => patchLineup(side, (current) => ({ ...current, formation })),
    onUpdatePlayer: (list: "starters" | "bench", index: number, patch: Partial<LineupPlayer>) =>
      patchLineup(side, (current) => ({
        ...current,
        [list]: current[list].map((player, playerIndex) =>
          playerIndex === index ? { ...player, ...patch } : player,
        ),
      })),
    onRemovePlayer: (list: "starters" | "bench", index: number) =>
      patchLineup(side, (current) => ({
        ...current,
        [list]: current[list].filter((_, playerIndex) => playerIndex !== index),
      })),
    onAddPlayer: (list: "starters" | "bench") => addPlayer(side, list),
  });

  return (
    <section>
      <h2 className="text-lg font-extrabold uppercase tracking-normal text-[#214C9B]">Alineaciones</h2>
      {editMode && (homeSquadOptions || awaySquadOptions) && (
        <p className="mt-2 text-xs font-semibold text-slate-600">
          Los jugadores del Avilés se eligen desde la plantilla de la temporada.
        </p>
      )}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <LineupColumn title={homeLabel} {...lineupHandlers("home", currentHome, homeSquadOptions)} />
        <LineupColumn title={awayLabel} {...lineupHandlers("away", currentAway, awaySquadOptions)} />
      </div>
    </section>
  );
}
