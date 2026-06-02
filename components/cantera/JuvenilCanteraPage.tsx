"use client";

import { CanteraContextBar } from "@/components/cantera/CanteraContextBar";
import { CanteraSeasonProvider } from "@/components/cantera/CanteraSeasonContext";
import { CanteraTeamSections } from "@/components/cantera/CanteraTeamSections";
import { JuvenilEditorPanel } from "@/components/editor/FilialEditorPanel";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";

export function JuvenilCanteraPage() {
  return (
    <CanteraSeasonProvider scope="juvenil">
      <div className="space-y-6">
        <PageHero
          eyebrow="Cantera"
          title="Juvenil A"
          description="Plantilla, clasificacion y calendario del Real Aviles U19 por temporada."
        />

        <CanteraContextBar showSeasonSelector />

        <JuvenilEditorPanel variant="inline" />

        <Card eyebrow="Juvenil A" title="Real Aviles U19">
          <CanteraTeamSections teamId="juvenil-a" cmsScope="juvenil" />
        </Card>
      </div>
    </CanteraSeasonProvider>
  );
}
