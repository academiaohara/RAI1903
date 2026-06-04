"use client";

import { useEditableTextValue } from "@/components/inline-editing/EditableText";
import { useSeason } from "@/components/season/SeasonProvider";
import { defaultLigaLabel, ligaLabelStorageKey } from "@/lib/calendar-competition-label";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

export function useLigaCompetitionLabel(gender: PrimerEquipoGender): string {
  const { getCompetitionConfig } = useSeason();
  const config = getCompetitionConfig(gender);
  const fallback = defaultLigaLabel(gender, config.ligaLabel);
  return useEditableTextValue(ligaLabelStorageKey(gender), fallback);
}
