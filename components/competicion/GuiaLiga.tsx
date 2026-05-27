"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { Modal } from "@/components/Modal";
import { getRivalAvailability, getRivalSquad, type RivalPlayer } from "@/lib/rival-squads";
import { cn } from "@/lib/utils";
import type { Team } from "@/types";

type GuiaLigaProps = {
  teams: Team[];
  highlightTeamId: string;
};

export function GuiaLiga({ teams, highlightTeamId }: GuiaLigaProps) {
  const [selected, setSelected] = useState<Team | null>(null);
  const rivals = teams.filter((team) => team.id !== highlightTeamId);

  return (
    <>
      <Card eyebrow="Competicion" title="Guia de la liga" borderlessHeader>
        <p className="mb-5 text-sm font-bold text-slate-600">
          Pulsa un escudo para ver la plantilla del rival, bajas y sanciones.
        </p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
          {rivals.map((team) => (
            <button
              key={team.id}
              type="button"
              onClick={() => setSelected(team)}
              className="group aspect-square rounded-3xl border border-[#214C9B]/20 bg-white p-4 shadow-[0_10px_28px_rgba(17,24,39,0.06)] transition hover:-translate-y-0.5 hover:border-[#214C9B] hover:shadow-[0_16px_36px_rgba(33,76,155,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#214C9B]"
              aria-label={`Ver plantilla de ${team.name}`}
            >
              <span className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-100 text-2xl font-extrabold tracking-tight text-[#214C9B] transition group-hover:scale-105 sm:text-3xl">
                {team.crestInitials}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <Modal open={Boolean(selected)} title={selected ? selected.name : "Plantilla rival"} onClose={() => setSelected(null)}>
        {selected && <RivalSquadPanel team={selected} />}
      </Modal>
    </>
  );
}

function RivalSquadPanel({ team }: { team: Team }) {
  const squad = getRivalSquad(team);
  const { injured, suspended } = getRivalAvailability(team);
  const fieldPlayers = squad.filter((player) => player.status === "titular" || player.status === "suplente");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#214C9B]/20 bg-blue-50 text-xl font-extrabold text-[#214C9B]">
          {team.crestInitials}
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#981915]">{team.position}º en liga</p>
          <p className="text-sm font-bold text-slate-500">{team.city} · {team.stadium}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AvailabilityList title="Lesionados" players={injured} empty="Sin lesionados registrados." tone="red" />
        <AvailabilityList title="Sancionados" players={suspended} empty="Sin sancionados activos." tone="amber" />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#214C9B]/20">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-[#214C9B] text-[10px] uppercase tracking-[0.1em] text-white">
            <tr>
              <th className="px-3 py-2.5 font-bold">Jugador</th>
              <th className="px-3 py-2.5 font-bold">Pos.</th>
              <th className="px-3 py-2.5 text-center font-bold">PJ</th>
              <th className="px-3 py-2.5 text-center font-bold">G</th>
              <th className="px-3 py-2.5 text-center font-bold">A</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fieldPlayers.map((player) => (
              <RivalPlayerRow key={player.id} player={player} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RivalPlayerRow({ player }: { player: RivalPlayer }) {
  return (
    <tr className="bg-white">
      <td className="px-3 py-2.5 font-bold text-[#214C9B]">{player.displayName}</td>
      <td className="px-3 py-2.5 font-semibold text-slate-600">{player.position}</td>
      <td className="px-3 py-2.5 text-center tabular-nums">{player.stats.appearances}</td>
      <td className="px-3 py-2.5 text-center tabular-nums">{player.stats.goals}</td>
      <td className="px-3 py-2.5 text-center tabular-nums">{player.stats.assists}</td>
    </tr>
  );
}

function AvailabilityList({
  title,
  players,
  empty,
  tone,
}: {
  title: string;
  players: RivalPlayer[];
  empty: string;
  tone: "red" | "amber";
}) {
  return (
    <div className="rounded-2xl border border-[#214C9B]/15 bg-slate-50/80 p-4">
      <h3 className="text-sm font-extrabold uppercase tracking-tight text-[#214C9B]">{title}</h3>
      <ul className="mt-3 space-y-2">
        {players.length > 0 ? (
          players.map((player) => (
            <li
              key={player.id}
              className={cn(
                "flex items-center justify-between rounded-xl border px-3 py-2",
                tone === "red" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50",
              )}
            >
              <div>
                <p className="font-bold text-slate-800">{player.displayName}</p>
                <p className="text-xs font-semibold text-slate-500">{player.position}</p>
              </div>
              <span
                className={cn(
                  "text-[10px] font-extrabold uppercase",
                  tone === "red" ? "text-red-700" : "text-amber-800",
                )}
              >
                {tone === "red" ? "Lesionado" : "Sancionado"}
              </span>
            </li>
          ))
        ) : (
          <li className="text-sm font-bold text-slate-500">{empty}</li>
        )}
      </ul>
    </div>
  );
}
