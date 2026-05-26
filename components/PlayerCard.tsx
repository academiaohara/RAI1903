"use client";

import { Badge } from "@/components/Badge";
import type { Player } from "@/types";

const statusTone = {
  titular: "green",
  suplente: "slate",
  lesionado: "red",
  cantera: "blue",
  "nuevo fichaje": "amber",
} as const;

export function PlayerCard({ player, onSelect }: { player: Player; onSelect: (player: Player) => void }) {
  return (
    <button onClick={() => onSelect(player)} className="group text-left">
      <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-[#214C9B]/35 to-slate-950 p-4 shadow-2xl shadow-black/20 transition group-hover:-translate-y-1 group-hover:border-white/30">
        <div className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xl font-black text-[#214C9B]">{player.number}</div>
        <div className="flex aspect-[4/5] items-center justify-center rounded-[1.5rem] border border-white/15 bg-[radial-gradient(circle_at_top,#ffffff_0%,#dbeafe_24%,#214C9B_56%,#07101d_100%)] text-6xl font-black text-white shadow-inner">
          {player.firstName[0]}{player.lastName[0]}
        </div>
        <div className="mt-4">
          <Badge tone={statusTone[player.status]}>{player.status}</Badge>
          <h3 className="mt-3 text-xl font-black text-white">{player.displayName}</h3>
          <p className="text-sm font-bold text-blue-100">{player.position}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
            <span className="rounded-xl bg-slate-950/55 p-2">{player.nationality}</span>
            <span className="rounded-xl bg-slate-950/55 p-2">{player.age} anos</span>
          </div>
        </div>
      </article>
    </button>
  );
}
