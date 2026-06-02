"use client";

import { CanteraContextBar } from "@/components/cantera/CanteraContextBar";
import { CanteraTeamSections } from "@/components/cantera/CanteraTeamSections";
import { FilialSeasonProvider } from "@/components/cantera/FilialSeasonContext";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";

export function FilialCanteraPage() {
  return (
    <FilialSeasonProvider>
      <div className="space-y-6">
        <PageHero
          eyebrow="Cantera"
          title="Filial"
          description="Plantilla, clasificacion y calendario del Real Aviles B por temporada."
        />

        <CanteraContextBar showSeasonSelector />

        <Card eyebrow="Filial" title="Real Aviles B">
          <CanteraTeamSections teamId="filial" />
        </Card>
      </div>
    </FilialSeasonProvider>
  );
}
