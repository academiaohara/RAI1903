"use client";

import { use } from "react";
import { SquadPage } from "@/components/squad/SquadPage";
import { genderLabels, type PrimerEquipoGender } from "@/lib/primer-equipo";

export default function PlantillaPage({ params }: { params: Promise<{ gender: string }> }) {
  const { gender } = use(params) as { gender: PrimerEquipoGender };

  return (
    <div className="space-y-2">
      <p className="sr-only">Plantilla de {genderLabels[gender].club}</p>
      <SquadPage gender={gender} />
    </div>
  );
}
