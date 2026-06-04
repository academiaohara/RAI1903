export const PRIMER_EQUIPO_GENDERS = ["masculino", "femenino"] as const;

export type PrimerEquipoGender = (typeof PRIMER_EQUIPO_GENDERS)[number];

export const genderLabels: Record<PrimerEquipoGender, { title: string; short: string; club: string }> = {
  masculino: { title: "Masculino", short: "Masc.", club: "Real Avilés Industrial" },
  femenino: { title: "Femenino", short: "Fem.", club: "Real Avilés Industrial Femenino" },
};

export function isPrimerEquipoGender(value: string): value is PrimerEquipoGender {
  return PRIMER_EQUIPO_GENDERS.includes(value as PrimerEquipoGender);
}

export function primerEquipoBase(gender: PrimerEquipoGender) {
  return `/primer-equipo/${gender}`;
}

export const PRIMER_EQUIPO_SECTIONS = [
  "plantilla",
  "noticias",
  "competicion",
  "jornadas",
  "calendario",
] as const;

export type PrimerEquipoSection = (typeof PRIMER_EQUIPO_SECTIONS)[number];

export function primerEquipoHasCronicas(gender: PrimerEquipoGender) {
  return gender === "masculino";
}

export function getPrimerEquipoTabs(gender: PrimerEquipoGender) {
  const base = primerEquipoBase(gender);
  return [
    { href: `${base}/plantilla`, label: "Plantilla" },
    { href: `${base}/noticias`, label: "Noticias" },
    { href: `${base}/competicion`, label: "Competición" },
    { href: `${base}/jornadas`, label: "Jornadas" },
    { href: `${base}/calendario`, label: "Calendario" },
  ];
}

/** Keeps the current subsection when switching between masculino and femenino. */
export function primerEquipoPathForGender(pathname: string, gender: PrimerEquipoGender) {
  const match = pathname.match(/^\/primer-equipo\/(?:masculino|femenino)(\/.*)?$/);
  const rest = match?.[1] ?? "/plantilla";
  const segments = rest.split("/").filter(Boolean);
  const section = segments[0];

  if (
    section &&
    PRIMER_EQUIPO_SECTIONS.includes(section as PrimerEquipoSection)
  ) {
    return `${primerEquipoBase(gender)}/${section}`;
  }

  return `${primerEquipoBase(gender)}/plantilla`;
}
