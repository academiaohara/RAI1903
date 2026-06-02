"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { TeamCrest } from "@/components/TeamCrest";
import { Card } from "@/components/Card";
import { GuiaLigaGroupEditor } from "@/components/competicion/GuiaLigaGroupEditor";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import { canLinkEquipoLiga, equipoLigaHref } from "@/lib/equipo-liga";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import type { Team } from "@/types";

type GuiaLigaProps = {
  gender: PrimerEquipoGender;
  teams: Team[];
  grupo: RfefGrupoId;
};

function isPlaceholderTeam(team: Team): boolean {
  return /^Equipo \d+$/.test(team.name);
}

export function GuiaLiga({ gender, teams, grupo }: GuiaLigaProps) {
  const { editMode } = useInlineEditing();
  const { bundles } = useSeason();
  const [groupEditorOpen, setGroupEditorOpen] = useState(false);

  const displayTeams = useMemo(() => {
    const configured = resolveGroupTeams(bundles, gender, grupo);
    return configured.length ? configured : [...teams].sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [bundles, gender, grupo, teams]);

  return (
    <Card eyebrow="Competición" title="Guia de la liga" borderlessHeader>
      <p className="mb-5 text-sm font-bold text-slate-600">
        {grupo === "1"
          ? "Los 20 equipos del grupo, con el Real Avilés. Pulsa un escudo para ver la ficha del club."
          : "Los 20 equipos del Grupo II. Pulsa un escudo para ver la ficha del club."}
      </p>

      {editMode && !groupEditorOpen && (
        <button
          type="button"
          onClick={() => setGroupEditorOpen(true)}
          className="mb-4 inline-flex items-center gap-2 rounded-xl border border-[#214C9B]/30 bg-[#214C9B]/5 px-4 py-2 text-xs font-extrabold uppercase text-[#214C9B] hover:bg-[#214C9B]/10"
        >
          <Pencil size={14} />
          Editar equipos del grupo
        </button>
      )}

      {editMode && groupEditorOpen ? (
        <GuiaLigaGroupEditor gender={gender} grupo={grupo} onClose={() => setGroupEditorOpen(false)} />
      ) : (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
          {displayTeams.map((team) => {
            const linkable = canLinkEquipoLiga(gender, team.id, bundles) && !isPlaceholderTeam(team);
            const crest = <TeamCrest team={team} size="md" className="h-full w-full max-h-14 max-w-14" />;

            if (!linkable) {
              return (
                <div
                  key={team.id}
                  className="flex aspect-square items-center justify-center p-1 opacity-90"
                  aria-label={team.name}
                  title={team.name}
                >
                  {crest}
                </div>
              );
            }

            return (
              <Link
                key={team.id}
                href={equipoLigaHref(gender, team.id)}
                className="group flex aspect-square items-center justify-center p-1 transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#214C9B]"
                aria-label={`Ver ficha de ${team.name}`}
                title={team.name}
              >
                {crest}
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
