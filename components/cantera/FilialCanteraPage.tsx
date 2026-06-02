"use client";

import { CanteraTeamSections } from "@/components/cantera/CanteraTeamSections";
import { CanteraSeasonProvider } from "@/components/cantera/CanteraSeasonContext";
import { FilialEditorPanel } from "@/components/editor/FilialEditorPanel";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { SeasonSelector } from "@/components/SeasonSelector";

export function FilialCanteraPage() {
  return (
    <CanteraSeasonProvider scope="filial">
      <div className="space-y-6">
        <PageHero
          eyebrow="Cantera"
          title="Filial"
          description="Plantilla, clasificacion y calendario del Real Aviles B por temporada."
        />

        <FilialEditorPanel variant="inline" />

        <Card
          eyebrow="Filial"
          title="Real Aviles B"
          action={<SeasonSelector className="border-[#214C9B]/15 bg-[#214C9B]/5 shrink-0" />}
        >
          <CanteraTeamSections teamId="filial" cmsScope="filial" />
        </Card>
      </div>
    </CanteraSeasonProvider>
  );
}
