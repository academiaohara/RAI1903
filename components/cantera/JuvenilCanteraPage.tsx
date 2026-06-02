"use client";

import { CanteraSeasonProvider } from "@/components/cantera/CanteraSeasonContext";
import { CanteraTeamSections } from "@/components/cantera/CanteraTeamSections";
import { JuvenilEditorPanel } from "@/components/editor/FilialEditorPanel";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { SeasonSelector } from "@/components/SeasonSelector";

export function JuvenilCanteraPage() {
  return (
    <CanteraSeasonProvider scope="juvenil">
      <div className="space-y-6">
        <PageHero
          eyebrow="Cantera"
          title="Juvenil A"
          description="Plantilla, clasificacion y calendario del Real Aviles U19 por temporada."
        />

        <JuvenilEditorPanel variant="inline" />

        <Card
          eyebrow="Juvenil A"
          title="Real Aviles U19"
          action={<SeasonSelector className="border-[#214C9B]/15 bg-[#214C9B]/5 shrink-0" />}
        >
          <CanteraTeamSections teamId="juvenil-a" cmsScope="juvenil" />
        </Card>
      </div>
    </CanteraSeasonProvider>
  );
}
