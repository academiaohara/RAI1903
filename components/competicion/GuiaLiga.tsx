import Link from "next/link";
import { TeamCrest } from "@/components/TeamCrest";
import { Card } from "@/components/Card";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Route } from "next";
import type { Team } from "@/types";

type GuiaLigaProps = {
  gender: PrimerEquipoGender;
  teams: Team[];
  highlightTeamId: string;
};

export function GuiaLiga({ gender, teams, highlightTeamId }: GuiaLigaProps) {
  const rivals = teams.filter((team) => team.id !== highlightTeamId);
  const base = `${primerEquipoBase(gender)}/competicion/equipo`;

  return (
    <Card eyebrow="Competicion" title="Guia de la liga" borderlessHeader>
      <p className="mb-5 text-sm font-bold text-slate-600">
        Pulsa un escudo para ver la ficha del rival con plantilla, bajas y sanciones.
      </p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {rivals.map((team) => (
          <Link
            key={team.id}
            href={`${base}/${team.id}` as Route}
            className="group aspect-square rounded-2xl border border-[#214C9B]/20 bg-white p-2 shadow-[0_10px_28px_rgba(17,24,39,0.06)] transition hover:-translate-y-0.5 hover:border-[#214C9B] hover:shadow-[0_16px_36px_rgba(33,76,155,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#214C9B]"
            aria-label={`Ver ficha de ${team.name}`}
          >
            <span className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 via-white to-blue-100 transition group-hover:scale-105">
              <TeamCrest team={team} size="md" className="h-full w-full max-h-14 max-w-14" />
            </span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
