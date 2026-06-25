"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import { LineupPage } from "@/components/lineup/LineupPage";
import {
  genderLabels,
  isPrimerEquipoGender,
  primerEquipoHasLineup,
  type PrimerEquipoGender,
} from "@/lib/primer-equipo";

export default function PrimerEquipoLineupPage({ params }: { params: Promise<{ gender: string }> }) {
  const { gender: genderParam } = use(params);
  if (!isPrimerEquipoGender(genderParam) || !primerEquipoHasLineup(genderParam)) notFound();
  const gender = genderParam as PrimerEquipoGender;

  return (
    <div className="space-y-2">
      <p className="sr-only">Lineup de {genderLabels[gender].club}</p>
      <LineupPage gender={gender} />
    </div>
  );
}
