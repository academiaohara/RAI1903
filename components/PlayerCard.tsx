"use client";

import { Badge } from "@/components/Badge";
import type { Player } from "@/types";

const statusTone = {
  titular: "green",
  suplente: "slate",
  lesionado: "red",
  sancionado: "amber",
  cantera: "blue",
  "nuevo fichaje": "amber",
} as const;

export function PlayerCard({ player, onSelect }: { player: Player; onSelect: (player: Player) => void }) {
  return (
    <button onClick={() => onSelect(player)} className="group text-left">
      <article className="relative overflow-hidden rounded-[2rem] border border-[#214C9B]/25 bg-white p-4 shadow-[0_18px_45px_rgba(17,24,39,0.08)] transition group-hover:-translate-y-1 group-hover:border-[#214C9B]">
        <div className="absolute right-3 top-3 rounded-full bg-[#214C9B] px-3 py-1 text-xl font-extrabold text-white">{player.number}</div>
        <div className="flex aspect-[4/5] items-center justify-center rounded-[1.5rem] border border-[#214C9B]/15 bg-[radial-gradient(circle_at_top,#ffffff_0%,#dbeafe_28%,#214C9B_62%,#173a78_100%)] text-6xl font-extrabold text-white shadow-inner">
          {player.firstName[0]}{player.lastName[0]}
        </div>
        <div className="mt-4">
          <Badge tone={statusTone[player.status]}>{player.status}</Badge>
          <h3 className="mt-3 text-xl font-extrabold uppercase text-[#214C9B]">{player.displayName}</h3>
          <p className="text-sm font-bold text-[#981915]">{player.position}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-700">
            <span className="rounded-xl border border-slate-200 bg-slate-50 p-2">{player.nationality}</span>
            <span className="rounded-xl border border-slate-200 bg-slate-50 p-2">{player.age} anos</span>
          </div>
        </div>
      </article>
    </button>
  );
}
