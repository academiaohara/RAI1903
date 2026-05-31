"use client";

import { ArrowDownRight, ArrowUpLeft, Footprints, Plus, Trash2 } from "lucide-react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { createMatchEventId, matchEventTypeLabels } from "@/lib/match-events";
import type { MatchEvent, MatchEventType } from "@/types";
import { useMatchDetailStorageKeys } from "@/components/match-center/useMatchDetailOverrides";

const eventTypes: MatchEventType[] = ["goal", "goal_disallowed", "yellow", "red", "substitution"];

function formatMatchMinute(minute: number): string {
  return `${minute}'`;
}

function CardIcon({ type }: { type: "yellow" | "red" }) {
  const color = type === "yellow" ? "#FFEB3B" : "#E53935";
  return <span className="inline-block h-4 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: color }} aria-hidden />;
}

function SubstitutionIcons() {
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5" aria-hidden>
      <ArrowUpLeft size={14} className="text-[#2E7D32]" strokeWidth={2.5} />
      <ArrowDownRight size={14} className="text-[#C62828]" strokeWidth={2.5} />
    </span>
  );
}

function GoalBallIcon() {
  return <span className="shrink-0 text-sm leading-none" aria-hidden>⚽</span>;
}

function EventTimelineRow({ event }: { event: MatchEvent }) {
  const isHome = event.team === "home";
  const minuteLabel = formatMatchMinute(event.minute);
  const playerName = event.player || "Sin nombre";

  const minuteEl = <span className="shrink-0 text-sm font-bold tabular-nums text-[#2E7D32]">{minuteLabel}</span>;

  if (event.type === "goal" || event.type === "goal_disallowed") {
    const content = (
      <>
        {isHome ? (
          <>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-medium text-[#333333]">{playerName}</p>
              {event.detail && event.type === "goal" && (
                <p className="flex items-center gap-1 truncate text-xs text-[#757575]">
                  <Footprints size={12} className="shrink-0 text-[#333333]" aria-hidden />
                  {event.detail}
                </p>
              )}
            </div>
            <GoalBallIcon />
            {minuteEl}
          </>
        ) : (
          <>
            {minuteEl}
            <GoalBallIcon />
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-medium text-[#333333]">{playerName}</p>
              {event.detail && event.type === "goal" && (
                <p className="flex items-center justify-end gap-1 truncate text-xs text-[#757575]">
                  <Footprints size={12} className="shrink-0 text-[#333333]" aria-hidden />
                  {event.detail}
                </p>
              )}
            </div>
          </>
        )}
      </>
    );

    return (
      <li className="flex border-t border-[#eeeeee] first:border-t-0">
        {isHome ? (
          <div className="flex w-1/2 items-center gap-2 px-3 py-3">{content}</div>
        ) : (
          <div className="w-1/2" aria-hidden />
        )}
        {isHome ? (
          <div className="w-1/2" aria-hidden />
        ) : (
          <div className="flex w-1/2 items-center justify-end gap-2 px-3 py-3">{content}</div>
        )}
      </li>
    );
  }

  if (event.type === "yellow" || event.type === "red") {
    const card = <CardIcon type={event.type} />;

    return (
      <li className="flex border-t border-[#eeeeee] first:border-t-0">
        {isHome ? (
          <div className="flex w-1/2 items-center gap-2 px-3 py-3">
            <p className="truncate text-sm font-medium text-[#333333]">{playerName}</p>
            {card}
            {minuteEl}
          </div>
        ) : (
          <div className="w-1/2" aria-hidden />
        )}
        {isHome ? (
          <div className="w-1/2" aria-hidden />
        ) : (
          <div className="flex w-1/2 items-center justify-end gap-2 px-3 py-3">
            {minuteEl}
            {card}
            <p className="truncate text-sm font-medium text-[#333333]">{playerName}</p>
          </div>
        )}
      </li>
    );
  }

  if (event.type === "substitution") {
    const playerOut = event.detail ?? "";

    return (
      <li className="flex border-t border-[#eeeeee] first:border-t-0">
        {isHome ? (
          <div className="flex w-1/2 items-center gap-2 px-3 py-3">
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold text-[#333333]">{playerName}</p>
              {playerOut && <p className="truncate text-xs text-[#888888]">{playerOut}</p>}
            </div>
            <SubstitutionIcons />
            {minuteEl}
          </div>
        ) : (
          <div className="w-1/2" aria-hidden />
        )}
        {isHome ? (
          <div className="w-1/2" aria-hidden />
        ) : (
          <div className="flex w-1/2 items-center justify-end gap-2 px-3 py-3">
            {minuteEl}
            <SubstitutionIcons />
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-semibold text-[#333333]">{playerName}</p>
              {playerOut && <p className="truncate text-xs text-[#888888]">{playerOut}</p>}
            </div>
          </div>
        )}
      </li>
    );
  }

  return null;
}

function EventSection({
  title,
  events,
}: {
  title: string;
  events: MatchEvent[];
}) {
  if (events.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-[#e0e0e0] bg-white">
      <div className="border-b border-[#eeeeee] bg-[#f5f5f5] px-4 py-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-[#333333]">{title}</h3>
      </div>
      <ol>
        {events.map((event) => (
          <EventTimelineRow key={event.id} event={event} />
        ))}
      </ol>
    </div>
  );
}

export function MatchEventsPanel({
  matchId,
  events,
  homeLabel,
  awayLabel,
}: {
  matchId: string;
  events: MatchEvent[];
  homeLabel: string;
  awayLabel: string;
}) {
  const { editMode, getValue, saveValue } = useInlineEditing();
  const keys = useMatchDetailStorageKeys(matchId);
  const currentEvents = getValue(keys.events, events);

  const updateEvents = (next: MatchEvent[]) => {
    saveValue(keys.events, next);
  };

  const addEvent = () => {
    updateEvents([
      ...currentEvents,
      {
        id: createMatchEventId(),
        minute: 1,
        type: "goal",
        team: "home",
        player: "",
      },
    ]);
  };

  const updateEvent = (id: string, patch: Partial<MatchEvent>) => {
    updateEvents(currentEvents.map((event) => (event.id === id ? { ...event, ...patch } : event)));
  };

  const removeEvent = (id: string) => {
    updateEvents(currentEvents.filter((event) => event.id !== id));
  };

  const goals = currentEvents
    .filter((event) => event.type === "goal" || event.type === "goal_disallowed")
    .sort((a, b) => a.minute - b.minute);
  const cards = currentEvents
    .filter((event) => event.type === "yellow" || event.type === "red")
    .sort((a, b) => a.minute - b.minute);
  const substitutions = currentEvents
    .filter((event) => event.type === "substitution")
    .sort((a, b) => a.minute - b.minute);

  const hasViewEvents = goals.length > 0 || cards.length > 0 || substitutions.length > 0;

  return (
    <section className="space-y-6">
      {editMode && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Modo edición de eventos</p>
          <button
            type="button"
            onClick={addEvent}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#214C9B]/25 px-3 py-1.5 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50"
          >
            <Plus size={14} aria-hidden />
            Añadir evento
          </button>
        </div>
      )}

      {currentEvents.length === 0 ? (
        <p className="text-sm text-slate-500">No hay eventos registrados para este partido.</p>
      ) : editMode ? (
        <ol className="space-y-2">
          {currentEvents.map((event) => (
            <li
              key={event.id}
              className="grid gap-2 rounded-2xl border border-[#214C9B]/15 bg-white px-4 py-3 sm:grid-cols-[auto_1fr_auto]"
            >
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={event.minute}
                  onChange={(change) => updateEvent(event.id, { minute: Number(change.target.value) || 0 })}
                  aria-label="Minuto del evento"
                  className="w-14 rounded-lg border border-[#214C9B]/25 px-2 py-1 text-sm font-extrabold tabular-nums text-[#214C9B] outline-none focus:border-[#214C9B]"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <select
                  value={event.type}
                  onChange={(change) => updateEvent(event.id, { type: change.target.value as MatchEventType })}
                  aria-label="Tipo de evento"
                  className="rounded-lg border border-[#214C9B]/25 px-2 py-1.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#214C9B]"
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {matchEventTypeLabels[type]}
                    </option>
                  ))}
                </select>
                <select
                  value={event.team}
                  onChange={(change) => updateEvent(event.id, { team: change.target.value as "home" | "away" })}
                  aria-label="Equipo del evento"
                  className="rounded-lg border border-[#214C9B]/25 px-2 py-1.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#214C9B]"
                >
                  <option value="home">{homeLabel}</option>
                  <option value="away">{awayLabel}</option>
                </select>
                <input
                  value={event.player}
                  onChange={(change) => updateEvent(event.id, { player: change.target.value })}
                  placeholder="Jugador (entra / autor)"
                  aria-label="Jugador del evento"
                  className="rounded-lg border border-[#214C9B]/25 px-2 py-1.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#214C9B] sm:col-span-2"
                />
                <input
                  value={event.detail ?? ""}
                  onChange={(change) => updateEvent(event.id, { detail: change.target.value || undefined })}
                  placeholder="Asistencia o jugador que sale"
                  aria-label="Detalle del evento"
                  className="rounded-lg border border-[#214C9B]/25 px-2 py-1.5 text-sm text-slate-600 outline-none focus:border-[#214C9B] sm:col-span-2 lg:col-span-4"
                />
              </div>

              <button
                type="button"
                onClick={() => removeEvent(event.id)}
                className="inline-flex h-9 w-9 items-center justify-center self-start rounded-full border border-[#981915]/20 text-[#981915] hover:bg-red-50 sm:self-center"
                aria-label="Eliminar evento"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ol>
      ) : !hasViewEvents ? (
        <p className="text-sm text-slate-500">No hay eventos registrados para este partido.</p>
      ) : (
        <div className="space-y-6">
          <EventSection title="Goles" events={goals} />
          <EventSection title="Tarjetas" events={cards} />
          <EventSection title="Sustituciones" events={substitutions} />
        </div>
      )}
    </section>
  );
}
