"use client";

import { use } from "react";
import { LineupPage } from "@/components/lineup/LineupPage";
import { genderLabels, type PrimerEquipoGender } from "@/lib/primer-equipo";

export default function PrimerEquipoLineupPage({ params }: { params: Promise<{ gender: string }> }) {
  const { gender } = use(params) as { gender: PrimerEquipoGender };

  return (
    <div className="space-y-2">
      <p className="sr-only">Lineup de {genderLabels[gender].club}</p>
      <LineupPage gender={gender} />
    </div>
  );
}
