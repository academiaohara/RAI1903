import { Badge } from "@/components/Badge";
import { resultTone } from "@/lib/utils";
import type { Team } from "@/types";

export function RivalCard({ team }: { team: Team }) {
  return (
    <article className="rounded-3xl border border-[#214C9B]/25 bg-white p-5 shadow-[0_14px_34px_rgba(17,24,39,0.07)] transition hover:-translate-y-1 hover:border-[#214C9B]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#214C9B]/20 bg-blue-50 text-sm font-extrabold text-[#214C9B]">{team.crestInitials}</span>
          <div>
            <h3 className="text-2xl font-extrabold uppercase leading-none text-[#214C9B]">{team.shortName}</h3>
            <p className="mt-1 text-sm font-bold text-slate-500">{team.city}</p>
          </div>
        </div>
        <Badge tone="blue">{team.position}º</Badge>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <dt className="text-xs font-bold uppercase tracking-normal text-slate-500">Estadio</dt>
          <dd className="mt-1 font-bold text-slate-800">{team.stadium}</dd>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <dt className="text-xs font-bold uppercase tracking-normal text-slate-500">Entrenador</dt>
          <dd className="mt-1 font-bold text-slate-800">{team.coach}</dd>
        </div>
      </dl>
      <div className="mt-4 flex gap-1">
        {team.form.map((result, index) => (
          <span key={`${team.id}-${result}-${index}`} className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-extrabold ${resultTone(result)}`}>
            {result}
          </span>
        ))}
      </div>
    </article>
  );
}
