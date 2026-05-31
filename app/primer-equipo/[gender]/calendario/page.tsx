import { Card } from "@/components/Card";
import { PrimerEquipoPageHero } from "@/components/PrimerEquipoPageHero";
import { TeamCalendar } from "@/components/TeamCalendar";
import { getCalendarMatchesByGender } from "@/lib/calendar";
import { genderLabels, type PrimerEquipoGender } from "@/lib/primer-equipo";

export default async function PrimerEquipoCalendarioPage({ params }: { params: Promise<{ gender: PrimerEquipoGender }> }) {
  const { gender } = await params;
  const matches = getCalendarMatchesByGender(gender);
  const played = matches.filter((match) => match.played).length;
  const upcoming = matches.length - played;

  return (
    <>
      <PrimerEquipoPageHero
        title="Calendario"
        description={
          gender === "femenino"
            ? `Calendario completo de ${genderLabels[gender].club}: partidos jugados y pendientes.`
            : `Calendario completo de ${genderLabels[gender].club}: partidos jugados y pendientes con acceso directo a las cronicas.`
        }
      />

      <Card eyebrow="Temporada" title="Partidos del equipo">
        <div className="mb-6 flex flex-wrap gap-4 text-sm font-bold text-slate-600">
          <span>
            <span className="text-[#214C9B]">{matches.length}</span> partidos
          </span>
          <span>
            <span className="text-emerald-700">{played}</span> jugados
          </span>
          <span>
            <span className="text-[#981915]">{upcoming}</span> pendientes
          </span>
        </div>
        <TeamCalendar matches={matches} gender={gender} showVenue={gender !== "femenino"} />
      </Card>
    </>
  );
}
