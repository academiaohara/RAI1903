import { notFound } from "next/navigation";
import { CanteraTeamSections } from "@/components/cantera/CanteraTeamSections";
import { FilialCanteraPage } from "@/components/cantera/FilialCanteraPage";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { academyTeams } from "@/data/mock";

export function generateStaticParams() {
  return academyTeams.map((team) => ({ teamId: team.id }));
}

export default async function CanteraTeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;

  if (teamId === "filial") {
    return <FilialCanteraPage />;
  }

  const team = academyTeams.find((item) => item.id === teamId);
  if (!team) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Cantera"
        title={team.name}
        description="Plantilla, clasificacion y calendario del equipo en una pagina propia."
      />

      <Card eyebrow={team.category} title={team.name}>
        <CanteraTeamSections teamId={team.id as "juvenil-a"} />
      </Card>
    </div>
  );
}
