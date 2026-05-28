import type { SquadPlayer } from "@/types/squad";

export function PlayerResumenSection({ player }: { player: SquadPlayer }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
      <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#214C9B]">Sobre el jugador</h3>
      <p className="mt-4 text-sm leading-8 text-slate-700">{player.descripcion}</p>
    </div>
  );
}
