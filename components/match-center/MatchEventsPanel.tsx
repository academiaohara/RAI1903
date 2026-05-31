"use client";

import { CircleDot, Plus, Trash2 } from "lucide-react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { createMatchEventId, matchEventTypeLabels } from "@/lib/match-events";
import type { MatchEvent, MatchEventType } from "@/types";
import { useMatchDetailStorageKeys } from "@/components/match-center/useMatchDetailOverrides";

const eventTypes: MatchEventType[] = ["goal", "goal_disallowed", "yellow", "red", "substitution"];

function EventBadge({ type }: { type: MatchEventType }) {
  if (type === "yellow") {
    return <span className="inline-block h-4 w-3 rounded-sm bg-amber-400" aria-hidden />;
  }
  if (type === "red") {
    return <span className="inline-block h-4 w-3 rounded-sm bg-[#981915]" aria-hidden />;
  }
  if (type === "goal_disallowed") {
    return <CircleDot size={16} className="text-slate-400" aria-hidden />;
  }
  if (type === "substitution") {
    return <span className="text-xs font-extrabold text-[#214C9B]" aria-hidden>↔</span>;
  }
  return <span className="text-sm" aria-hidden>⚽</span>;
}

function EventRow({ event }: { event: MatchEvent }) {
  return (
    <li className="grid grid-cols-[1rem_2.25rem_minmax(0,1fr)] items-center gap-x-2 text-left">
      <span className="flex items-center justify-center">
        <EventBadge type={event.type} />
      </span>
      <span className="text-sm font-extrabold tabular-nums text-[#214C9B]">{event.minute}&apos;</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800">{event.player || "Sin nombre"}</p>
        {event.detail && <p className="truncate text-xs font-medium text-slate-500">{event.detail}</p>}
      </div>
    </li>
  );
}

function TeamEventsColumn({
  label,
  events,
}: {
  label: string;
  events: MatchEvent[];
}) {
  return (
    <div className="min-w-0">
      <h3 className="truncate text-sm font-extrabold uppercase text-[#214C9B]" title={label}>
        {label}
      </h3>
      {events.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Sin eventos</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {events.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </ol>
      )}
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

  const homeEvents = currentEvents.filter((event) => event.team === "home");
  const awayEvents = currentEvents.filter((event) => event.team === "away");

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg font-extrabold uppercase tracking-normal text-[#214C9B]">Eventos del partido</h2>
        {editMode && (
          <button
            type="button"
            onClick={addEvent}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#214C9B]/25 px-3 py-1.5 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-blue-50"
          >
            <Plus size={14} aria-hidden />
            Añadir evento
          </button>
        )}
      </div>

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
                <EventBadge type={event.type} />
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
                  placeholder="Jugador"
                  aria-label="Jugador del evento"
                  className="rounded-lg border border-[#214C9B]/25 px-2 py-1.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#214C9B] sm:col-span-2"
                />
                <input
                  value={event.detail ?? ""}
                  onChange={(change) => updateEvent(event.id, { detail: change.target.value || undefined })}
                  placeholder="Detalle (VAR, penalti…)"
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
      ) : (
        <div className="grid gap-8 sm:grid-cols-2">
          <TeamEventsColumn label={homeLabel} events={homeEvents} />
          <TeamEventsColumn label={awayLabel} events={awayEvents} />
        </div>
      )}
    </section>
  );
}
