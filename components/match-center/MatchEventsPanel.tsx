"use client";

import { CircleDot, Plus, Trash2 } from "lucide-react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { createMatchEventId, matchEventTypeLabels } from "@/lib/match-events";
import { cn } from "@/lib/utils";
import type { MatchEvent, MatchEventType } from "@/types";
import { useMatchDetailStorageKeys } from "@/components/match-center/useMatchDetailOverrides";

const eventTypes: MatchEventType[] = ["goal", "goal_disallowed", "yellow", "red", "substitution"];

function eventAccent(type: MatchEventType): string {
  switch (type) {
    case "goal":
      return "text-emerald-700";
    case "goal_disallowed":
      return "text-slate-500 line-through";
    case "yellow":
      return "text-amber-600";
    case "red":
      return "text-[#981915]";
    case "substitution":
      return "text-[#214C9B]";
    default:
      return "text-slate-700";
  }
}

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

  const goals = currentEvents.filter((event) => event.type === "goal");

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

      {goals.length > 0 && (
        <div className="rounded-2xl border border-[#214C9B]/15 bg-slate-50/80 p-4">
          <p className="text-xs font-extrabold uppercase tracking-normal text-slate-500">Goleadores</p>
          <ul className="mt-2 space-y-1.5 text-sm font-semibold text-slate-800">
            {goals.map((event) => (
              <li key={`scorer-${event.id}`}>
                <span className="tabular-nums text-[#214C9B]">{event.minute}&apos;</span>{" "}
                {event.player || "Sin nombre"} · {event.team === "home" ? homeLabel : awayLabel}
              </li>
            ))}
          </ul>
        </div>
      )}

      {currentEvents.length === 0 ? (
        <p className="text-sm text-slate-500">No hay eventos registrados para este partido.</p>
      ) : (
        <ol className="space-y-2">
          {currentEvents.map((event) => (
            <li
              key={event.id}
              className={cn(
                "grid gap-2 rounded-2xl border border-[#214C9B]/15 bg-white px-4 py-3",
                editMode ? "sm:grid-cols-[auto_1fr_auto]" : "grid-cols-[auto_1fr]",
              )}
            >
              <div className="flex items-center gap-2">
                <EventBadge type={event.type} />
                {editMode ? (
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={event.minute}
                    onChange={(change) => updateEvent(event.id, { minute: Number(change.target.value) || 0 })}
                    aria-label="Minuto del evento"
                    className="w-14 rounded-lg border border-[#214C9B]/25 px-2 py-1 text-sm font-extrabold tabular-nums text-[#214C9B] outline-none focus:border-[#214C9B]"
                  />
                ) : (
                  <span className="text-sm font-extrabold tabular-nums text-[#214C9B]">{event.minute}&apos;</span>
                )}
              </div>

              {editMode ? (
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
              ) : (
                <div className="min-w-0">
                  <p className={cn("text-sm font-extrabold", eventAccent(event.type))}>{matchEventTypeLabels[event.type]}</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {event.player || "Sin nombre"} · {event.team === "home" ? homeLabel : awayLabel}
                  </p>
                  {event.detail && <p className="text-xs font-medium text-slate-500">{event.detail}</p>}
                </div>
              )}

              {editMode && (
                <button
                  type="button"
                  onClick={() => removeEvent(event.id)}
                  className="inline-flex h-9 w-9 items-center justify-center self-start rounded-full border border-[#981915]/20 text-[#981915] hover:bg-red-50 sm:self-center"
                  aria-label="Eliminar evento"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
