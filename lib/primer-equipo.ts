export const PRIMER_EQUIPO_GENDERS = ["masculino", "femenino"] as const;

export type PrimerEquipoGender = (typeof PRIMER_EQUIPO_GENDERS)[number];

export const genderLabels: Record<PrimerEquipoGender, { title: string; short: string; club: string }> = {
  masculino: { title: "Masculino", short: "Masc.", club: "Real Aviles Industrial" },
  femenino: { title: "Femenino", short: "Fem.", club: "Real Aviles Industrial Femenino" },
};

export function isPrimerEquipoGender(value: string): value is PrimerEquipoGender {
  return PRIMER_EQUIPO_GENDERS.includes(value as PrimerEquipoGender);
}

export function primerEquipoBase(gender: PrimerEquipoGender) {
  return `/primer-equipo/${gender}`;
}

export function getPrimerEquipoTabs(gender: PrimerEquipoGender) {
  const base = primerEquipoBase(gender);
  return [
    { href: `${base}/plantilla`, label: "Plantilla" },
    { href: `${base}/noticias`, label: "Noticias" },
    { href: `${base}/competicion`, label: "Competicion" },
    { href: `${base}/cronicas`, label: "Cronicas" },
    { href: `${base}/previas`, label: "Previas" },
  ];
}
