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
            className="group flex aspect-square items-center justify-center p-1 transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#214C9B]"
            aria-label={`Ver ficha de ${team.name}`}
          >
            <TeamCrest team={team} size="md" className="h-full w-full max-h-14 max-w-14" />
          </Link>
        ))}
      </div>
    </Card>
  );
}
