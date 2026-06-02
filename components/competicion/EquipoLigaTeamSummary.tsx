import { Card } from "@/components/Card";
import { TeamCrest } from "@/components/TeamCrest";
import type { Team } from "@/types";

type EquipoLigaTeamSummaryProps = {
  team: Team;
};

export function EquipoLigaTeamSummary({ team }: EquipoLigaTeamSummaryProps) {
  return (
    <Card eyebrow="Equipo" title={team.name} borderlessHeader>
      <div className="flex items-center gap-4">
        <TeamCrest team={team} size="lg" className="shrink-0" />
        <dl className="grid gap-1 text-sm font-semibold text-slate-600">
          {team.city ? (
            <div>
              <dt className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Ciudad</dt>
              <dd>{team.city}</dd>
            </div>
          ) : null}
          {team.stadium ? (
            <div>
              <dt className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Estadio</dt>
              <dd>{team.stadium}</dd>
            </div>
          ) : null}
          {team.coach ? (
            <div>
              <dt className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Entrenador</dt>
              <dd>{team.coach}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </Card>
  );
}
