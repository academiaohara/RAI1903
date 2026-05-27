import { Card } from "@/components/Card";
import { LeagueTableCard } from "@/components/LeagueTableCard";
import { MatchCard } from "@/components/MatchCard";
import { PageHero } from "@/components/PageHero";
import { RivalCard } from "@/components/RivalCard";
import { RAI_FEM_TEAM_ID, RAI_TEAM_ID } from "@/data/mock";
import { getTeamsByGender, getUpcomingAvilesMatchesByGender } from "@/lib/fixtures";
import { genderLabels, type PrimerEquipoGender } from "@/lib/primer-equipo";

export default async function PrimerEquipoCompeticionPage({ params }: { params: Promise<{ gender: PrimerEquipoGender }> }) {
  const { gender } = await params;
  const teams = getTeamsByGender(gender);
  const highlightTeamId = gender === "femenino" ? RAI_FEM_TEAM_ID : RAI_TEAM_ID;
  const upcoming = getUpcomingAvilesMatchesByGender(gender, 6);

  return (
    <>
      <PageHero
        title="Competicion"
        description={`Clasificacion, proximos partidos y rivales directos de ${genderLabels[gender].club}.`}
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <LeagueTableCard teams={teams} highlightTeamId={highlightTeamId} />
        <Card>
          <div className="space-y-3">{upcoming.map((match) => <MatchCard key={match.id} match={match} />)}</div>
        </Card>
        <Card className="xl:col-span-2">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {teams.filter((team) => team.id !== highlightTeamId).slice(0, 8).map((team) => (
              <RivalCard key={team.id} team={team} />
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}
