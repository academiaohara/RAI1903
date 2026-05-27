"use client";

import { SectionTabs } from "@/components/SectionTabs";
import { getPrimerEquipoTabs, type PrimerEquipoGender } from "@/lib/primer-equipo";

export function PrimerEquipoSubnav({ gender }: { gender: PrimerEquipoGender }) {
  return <SectionTabs variant="sidebar" tabs={getPrimerEquipoTabs(gender)} className="lg:sticky lg:top-28" />;
}
