"use client";

import { Plus, Trash2 } from "lucide-react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { MatchSquadPlayerSelect } from "@/components/match-center/MatchSquadPlayerSelect";
import { useMatchTeamSquadOptions } from "@/hooks/useMatchTeamSquadOptions";
import { MatchJsonPasteSection } from "@/components/match-center/MatchJsonPasteSection";
import { useMatchDetailStorageKeys } from "@/components/match-center/useMatchDetailOverrides";
import { parseMatchLineupsJson } from "@/lib/match-center/parse-match-json";
import type { LineupPlayer, MatchLineup, PrimerEquipoGender } from "@/types";
import type { MatchSquadOption } from "@/lib/match-availability-squad";
import type { SquadPlayer } from "@/types/squad";

function isCustomLineupPlayer(player: LineupPlayer, squadOptions: MatchSquadOption[] | null): boolean {
  if (player.custom) return true;
  if (!squadOptions?.length || !player.name.trim()) return false;
  return !squadOptions.some((option) => option.name === player.name.trim());
}

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
  const useFreeText = !squadOptions?.length || isCustomLineupPlayer(player, squadOptions);

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

  if (squadOptions && squadOptions.length > 0 && !useFreeText) {
    return (
      <>
        <span className="flex h-8 w-10 shrink-0 items-center justify-center rounded-lg border border-[#214C9B]/25 text-xs font-extrabold tabular-nums text-[#214C9B]">
          {player.number || "—"}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <MatchSquadPlayerSelect
            options={squadOptions}
            value={player.name}
            onChange={(name) => {
              const option = squadOptions.find((item) => item.name === name);
              onUpdate({ name, custom: false, ...(option ? { number: option.dorsal } : {}) });
            }}
            squadForResolve={ownSquad}
            placeholder="Jugador de la plantilla…"
            aria-label="Nombre del jugador"
            className="w-full rounded-lg border border-[#214C9B]/25 px-2 py-1 text-sm font-semibold outline-none focus:border-[#214C9B]"
          />
          <button
            type="button"
            onClick={() => onUpdate({ custom: true, name: "", number: 0 })}
            className="self-start text-[10px] font-bold uppercase text-[#214C9B] hover:underline"
          >
            Fuera de plantilla
          </button>
        </div>
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
        aria-label={`Dorsal de ${player.name || "jugador"}`}
        className="h-8 w-10 shrink-0 rounded-lg border border-[#214C9B]/25 text-center text-xs font-extrabold text-[#214C9B] outline-none focus:border-[#214C9B]"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <input
          type="text"
          value={player.name}
          onChange={(event) => onUpdate({ name: event.target.value, custom: true })}
          aria-label="Nombre del jugador"
          placeholder="Nombre del jugador"
          className="w-full rounded-lg border border-[#214C9B]/25 px-2 py-1 text-sm font-semibold outline-none focus:border-[#214C9B]"
        />
        {squadOptions && squadOptions.length > 0 ? (
          <button
            type="button"
            onClick={() => onUpdate({ custom: false, name: "", number: 0 })}
            className="self-start text-[10px] font-bold uppercase text-[#214C9B] hover:underline"
          >
            Elegir de plantilla
          </button>
        ) : null}
      </div>
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
  onAddCustomPlayer,
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
  onAddCustomPlayer: (list: "starters" | "bench") => void;
}) {
  const renderList = (list: "starters" | "bench", label: string, highlighted: boolean) => (
    <>
      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
        {editMode && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onAddPlayer(list)}
              className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-[#214C9B] hover:underline"
            >
              <Plus size={12} aria-hidden />
              Añadir
            </button>
            {squadOptions && squadOptions.length > 0 ? (
              <button
                type="button"
                onClick={() => onAddCustomPlayer(list)}
                className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-slate-600 hover:underline"
              >
                <Plus size={12} aria-hidden />
                Fuera plantilla
              </button>
            ) : null}
          </div>
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

  const addPlayer = (side: "home" | "away", list: "starters" | "bench", custom = false) => {
    const options = side === "home" ? homeSquadOptions : awaySquadOptions;
    const first = options?.[0];
    patchLineup(side, (current) => ({
      ...current,
      [list]: [
        ...current[list],
        custom
          ? { number: 0, name: "", custom: true }
          : first
            ? { number: first.dorsal, name: first.name, custom: false }
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
    onAddPlayer: (list: "starters" | "bench") => addPlayer(side, list, false),
    onAddCustomPlayer: (list: "starters" | "bench") => addPlayer(side, list, true),
  });

  return (
    <section>
      <h2 className="text-lg font-extrabold uppercase tracking-normal text-[#214C9B]">Alineaciones</h2>
      {editMode && (
        <div className="mt-4">
          <MatchJsonPasteSection
            title="Importar alineaciones JSON"
            hint='Un equipo: { "formation", "starters", "bench" }. Ambos: { "home"/"local": { … }, "away"/"visitante": { … } }. Jugador: number/dorsal, name/nombre.'
            applyLabel="Aplicar alineaciones"
            placeholder={`{
  "home": {
    "formation": "4-4-2",
    "starters": [{ "number": 1, "name": "Portero" }],
    "bench": [{ "number": 13, "name": "Suplente" }]
  },
  "away": {
    "formation": "4-3-3",
    "starters": [{ "number": 9, "name": "Delantero" }]
  }
}`}
            parse={parseMatchLineupsJson}
            onImport={(data) => {
              if (data.home) updateHome(data.home);
              if (data.away) updateAway(data.away);
            }}
          />
        </div>
      )}
      {editMode && (homeSquadOptions || awaySquadOptions) && (
        <p className="mt-2 text-xs font-semibold text-slate-600">
          Los jugadores del Avilés se eligen desde la plantilla o con «Fuera de plantilla» (canteranos, pruebas, etc.).
        </p>
      )}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <LineupColumn title={homeLabel} {...lineupHandlers("home", currentHome, homeSquadOptions)} />
        <LineupColumn title={awayLabel} {...lineupHandlers("away", currentAway, awaySquadOptions)} />
      </div>
    </section>
  );
}
