import Link from "next/link";
import { TeamCrest } from "@/components/TeamCrest";
import { Card } from "@/components/Card";
import { equipoLigaHref } from "@/lib/equipo-liga";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import type { Team } from "@/types";

type GuiaLigaProps = {
  gender: PrimerEquipoGender;
  teams: Team[];
  grupo: RfefGrupoId;
};

export function GuiaLiga({ gender, teams, grupo }: GuiaLigaProps) {
  const sorted = [...teams].sort((a, b) => a.position - b.position);

  return (
    <Card eyebrow="Competición" title="Guia de la liga" borderlessHeader>
      <p className="mb-5 text-sm font-bold text-slate-600">
        {grupo === "1"
          ? "Los 20 equipos del grupo, con el Real Avilés. Pulsa un escudo para ver la ficha del club."
          : "Los 20 equipos del Grupo II. Pulsa un escudo para ver la ficha del club."}
      </p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {sorted.map((team) => (
          <Link
            key={team.id}
            href={equipoLigaHref(gender, team.id)}
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
