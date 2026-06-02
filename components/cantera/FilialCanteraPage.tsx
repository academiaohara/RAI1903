"use client";

import { CanteraContextBar } from "@/components/cantera/CanteraContextBar";
import { CanteraTeamSections } from "@/components/cantera/CanteraTeamSections";
import { CanteraSeasonProvider } from "@/components/cantera/CanteraSeasonContext";
import { FilialEditorPanel } from "@/components/editor/FilialEditorPanel";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";

export function FilialCanteraPage() {
  return (
    <CanteraSeasonProvider scope="filial">
      <div className="space-y-6">
        <PageHero
          eyebrow="Cantera"
          title="Filial"
          description="Plantilla, clasificacion y calendario del Real Aviles B por temporada."
        />

        <CanteraContextBar showSeasonSelector />

        <FilialEditorPanel variant="inline" />

        <Card eyebrow="Filial" title="Real Aviles B">
          <CanteraTeamSections teamId="filial" cmsScope="filial" />
        </Card>
      </div>
    </CanteraSeasonProvider>
  );
}
