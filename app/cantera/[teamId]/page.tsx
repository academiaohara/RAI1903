import { notFound } from "next/navigation";
import { CanteraTeamSections } from "@/components/cantera/CanteraTeamSections";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { academyTeams } from "@/data/mock";

export function generateStaticParams() {
  return academyTeams.map((team) => ({ teamId: team.id }));
}

export default async function CanteraTeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const team = academyTeams.find((item) => item.id === teamId);

  if (!team) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Cantera" title={team.name} description="Plantilla, clasificacion y calendario del equipo en una pagina propia." />

      <Card eyebrow={team.category} title={team.name}>
        <CanteraTeamSections team={team} />
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-normal text-slate-500">Notas</p>
          {team.news.map((item) => (
            <p key={item} className="mt-2 text-sm font-bold text-slate-700">
              {item}
            </p>
          ))}
        </div>
      </Card>
    </div>
  );
}
