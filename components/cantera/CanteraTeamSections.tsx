"use client";

import { useMemo, useState } from "react";
import { CanteraJornadasView } from "@/components/cantera/CanteraJornadasView";
import { CanteraSquadTable } from "@/components/cantera/CanteraSquadTable";
import { useCanteraSeasonOptional } from "@/components/cantera/CanteraSeasonContext";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { SubsectionFilterNav } from "@/components/SubsectionFilterNav";
import { CanteraCompeticionSection } from "@/components/cantera/CanteraCompeticionSection";
import { SectionUnderConstructionGate } from "@/components/season/SectionUnderConstructionGate";
import { TeamCalendar } from "@/components/TeamCalendar";
import {
  canteraTeamIdToCmsScope,
  cmsScopeToCanteraTeamId,
  type CanteraCmsScope,
} from "@/lib/cantera/cantera-cms";
import {
  getCanteraCalendar,
  getCanteraPrimaryAvilesTeamId,
  getCanteraStandings,
  isCanteraClubTeam,
  matchesToCanteraCalendarMatches,
  resolveCanteraClubTeamIdFromConfig,
  type CanteraTeamId,
} from "@/lib/cantera-data";
import { getCanteraSquadImport } from "@/lib/cantera-squad";
import { useCanteraSquadStatUpdate } from "@/hooks/useCanteraSquadStatUpdate";
import { academyTeams } from "@/data/mock";

const baseSections = [
  { id: "plantilla", label: "Plantilla" },
  { id: "calendario", label: "Calendario" },
  { id: "clasificacion", label: "Clasificacion" },
] as const;

const jornadasSection = { id: "jornadas", label: "Jornadas" } as const;

type BaseSectionId = (typeof baseSections)[number]["id"];
type SectionId = BaseSectionId | typeof jornadasSection.id;

type CanteraTeamSectionsProps = {
  teamId: CanteraTeamId;
  cmsScope?: CanteraCmsScope;
};

function CanteraSquadTableWithEditing({
  teamId,
  cmsScope,
}: {
  teamId: CanteraTeamId;
  cmsScope: CanteraCmsScope;
}) {
  const canteraSeason = useCanteraSeasonOptional();
  const { editMode, canEdit } = useInlineEditing();
  const { updatePlayerStat } = useCanteraSquadStatUpdate(cmsScope);

  if (!canteraSeason) return null;

  return (
    <CanteraSquadTable
      teamId={teamId}
      squadImport={canteraSeason.squad}
      seasonLabel={canteraSeason.seasonLabel}
      editMode={editMode && canEdit}
      onStatUpdate={editMode && canEdit ? updatePlayerStat : undefined}
    />
  );
}

export function CanteraTeamSections({ teamId, cmsScope: cmsScopeProp }: CanteraTeamSectionsProps) {
  const cmsScope = cmsScopeProp ?? (teamId === "filial" || teamId === "juvenil-a" ? canteraTeamIdToCmsScope(teamId) : null);
  const isCmsBacked = cmsScope !== null;
  const canteraSeason = useCanteraSeasonOptional();
  const staticTeam = academyTeams.find((item) => item.id === teamId);

  const avilesTeamId =
    isCmsBacked && canteraSeason
      ? resolveCanteraClubTeamIdFromConfig(teamId, canteraSeason.config)
      : getCanteraPrimaryAvilesTeamId(teamId);
  const sections = useMemo(() => [...baseSections, jornadasSection] as const, []);

  const [activeSection, setActiveSection] = useState<SectionId>("plantilla");

  const coach = isCmsBacked && canteraSeason ? canteraSeason.squad.entrenador : staticTeam?.coach ?? "—";
  const category =
    isCmsBacked && canteraSeason
      ? canteraSeason.summary.category
      : staticTeam?.category ?? "";
  const seasonLabel = isCmsBacked && canteraSeason ? canteraSeason.seasonLabel : "2025/26";

  const standings = useMemo(() => {
    if (isCmsBacked && canteraSeason) return canteraSeason.standings;
    return getCanteraStandings(teamId);
  }, [canteraSeason, isCmsBacked, teamId]);

  const calendarMatches = useMemo(() => {
    const source =
      isCmsBacked && canteraSeason ? canteraSeason.calendar : staticTeam?.calendar ?? [];
    return matchesToCanteraCalendarMatches(source, avilesTeamId);
  }, [avilesTeamId, canteraSeason, isCmsBacked, staticTeam?.calendar]);

  const clasificacionCalendar = useMemo(() => {
    if (isCmsBacked && canteraSeason) {
      return canteraSeason.calendar;
    }
    return getCanteraCalendar(teamId);
  }, [canteraSeason, isCmsBacked, teamId]);

  if (!isCmsBacked && !staticTeam) return null;
  if (isCmsBacked && !canteraSeason) return null;

  const cmsMatches = isCmsBacked && canteraSeason ? canteraSeason.allMatches : undefined;

  return (
    <div className="space-y-5">
      <SubsectionFilterNav
        items={sections.map((section) => section.id)}
        value={activeSection}
        onChange={setActiveSection}
        getLabel={(id) => sections.find((section) => section.id === id)?.label ?? id}
        ariaLabel="Secciones del equipo"
      />

      <p className="text-sm text-slate-600">
        <strong className="text-slate-900">Entrenador:</strong> {coach}
        {category ? (
          <>
            {" · "}
            <span className="text-slate-500">{category}</span>
          </>
        ) : null}
        {" · "}
        <span className="text-slate-500">Temporada {seasonLabel}</span>
      </p>

      {activeSection === "plantilla" &&
        (isCmsBacked && cmsScope ? (
          <SectionUnderConstructionGate scope={cmsScope} section="plantilla">
            <CanteraSquadTableWithEditing teamId={cmsScopeToCanteraTeamId(cmsScope)} cmsScope={cmsScope} />
          </SectionUnderConstructionGate>
        ) : (
          <CanteraSquadTable
            teamId={teamId}
            squadImport={getCanteraSquadImport(teamId)}
            seasonLabel={seasonLabel}
          />
        ))}

      {activeSection === "calendario" &&
        (isCmsBacked && cmsScope ? (
          <SectionUnderConstructionGate scope={cmsScope} section="calendario">
            <TeamCalendar matches={calendarMatches} listOnly showVenue={false} />
          </SectionUnderConstructionGate>
        ) : (
          <TeamCalendar matches={calendarMatches} listOnly showVenue={false} />
        ))}

      {activeSection === "clasificacion" &&
        (isCmsBacked && cmsScope ? (
          <SectionUnderConstructionGate scope={cmsScope} section="competicion">
            <CanteraCompeticionSection
              standings={standings}
              highlightTeamId={avilesTeamId}
              calendarMatches={clasificacionCalendar}
              zoneLegend={isCmsBacked && canteraSeason ? canteraSeason.zoneLegend : undefined}
              isClubHighlight={(row) => row.id === avilesTeamId || isCanteraClubTeam(teamId, row.id, row.name)}
            />
          </SectionUnderConstructionGate>
        ) : (
          <CanteraCompeticionSection
            standings={standings}
            highlightTeamId={avilesTeamId}
            calendarMatches={clasificacionCalendar}
            zoneLegend={isCmsBacked && canteraSeason ? canteraSeason.zoneLegend : undefined}
            isClubHighlight={(row) => row.id === avilesTeamId || isCanteraClubTeam(teamId, row.id, row.name)}
          />
        ))}

      {activeSection === "jornadas" &&
        (isCmsBacked && cmsScope ? (
          <SectionUnderConstructionGate scope={cmsScope} section="jornadas">
            <CanteraJornadasView
              teamId={teamId}
              filialMatches={cmsMatches}
              clubTeamId={avilesTeamId}
              cmsScope={cmsScope}
            />
          </SectionUnderConstructionGate>
        ) : (
          <CanteraJornadasView
            teamId={teamId}
            filialMatches={cmsMatches}
            clubTeamId={avilesTeamId}
            cmsScope={canteraTeamIdToCmsScope(teamId)}
          />
        ))}
    </div>
  );
}
