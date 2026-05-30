import resultados from "@/data/segunda-asturfutbol-grupo1-2526.json";
import type { FormCode, Match, Team } from "@/types";

/** Id alineado con `lib/cantera-data` para resaltado en tabla y calendario. */
export const FILIAL_TEAM_ID = "filial-real-aviles-b";
export const FILIAL_COMPETITION_ID = "segunda-asturfutbol" as const;

type ResultadosPartido = {
  fecha: string;
  hora: string | null;
  local: string;
  visitante: string;
  goles_local: number;
  goles_visitante: number;
  fase?: string;
};

type ResultadosJornada = {
  jornada: number;
  partidos: ResultadosPartido[];
};

type ResultadosSegundaAsturfutbol = {
  competicion: string;
  temporada: string;
  jornadas: ResultadosJornada[];
};

export const SEGUNDA_ASTURFUTBOL_DATA = resultados as ResultadosSegundaAsturfutbol;

/** Maps official AsturFutbol names to internal team ids. */
export const TEAM_NAME_TO_ID: Record<string, string> = {
  "Real Avilés B": "filial-real-aviles-b",
  "C.D. Treviense": "cd-treviense",
  "Navia CF": "navia-cf",
  "Gozon Club De Futbol": "gozon-cf",
  "Candás CF": "candas-cf",
  "SD Narcea": "sd-narcea",
  Camocha: "camocha",
  "Marítimo Racing Club": "maritimo-racing",
  "Triple A.Gijón": "triple-a-gijon",
  "Fabril C.D.": "fabril-cd",
  "CD Praviano B": "cd-praviano-b",
  "Vegadeo Club De Fútbol": "vegadeo-cf",
  Codema: "codema",
  "Asunción C.F.": "asuncion-cf",
  "Siderúrgico C.F.": "siderurgico-cf",
  "Boal CF": "boal-cf",
  "Podes C.F.": "podes-cf",
  "Llaranes C.F.": "llaranes-cf",
};

type TeamSeed = {
  id: string;
  name: string;
  shortName: string;
  city: string;
  stadium: string;
  crestInitials: string;
  colors: [string, string];
};

const TEAM_SEEDS: TeamSeed[] = [
  { id: "filial-real-aviles-b", name: "Real Avilés B", shortName: "Avilés B", city: "Avilés", stadium: "Muro de Zaro", crestInitials: "RAB", colors: ["#214C9B", "#FFFFFF"] },
  { id: "cd-treviense", name: "C.D. Treviense", shortName: "Treviense", city: "Trevías", stadium: "El Pando", crestInitials: "TRE", colors: ["#166534", "#FFFFFF"] },
  { id: "navia-cf", name: "Navia CF", shortName: "Navia", city: "Navia", stadium: "Tabiella", crestInitials: "NAV", colors: ["#DC2626", "#FFFFFF"] },
  { id: "gozon-cf", name: "Gozón CF", shortName: "Gozón", city: "Gozón", stadium: "La Montaña", crestInitials: "GOZ", colors: ["#1D4ED8", "#FACC15"] },
  { id: "candas-cf", name: "Candás CF", shortName: "Candás", city: "Candás", stadium: "Ramon Gonzalez", crestInitials: "CAN", colors: ["#0F172A", "#F59E0B"] },
  { id: "sd-narcea", name: "SD Narcea", shortName: "Narcea", city: "Cangas del Narcea", stadium: "La Corredoria", crestInitials: "NAR", colors: ["#7C2D12", "#FFFFFF"] },
  { id: "camocha", name: "Camocha", shortName: "Camocha", city: "Gijón", stadium: "La Camocha", crestInitials: "CAM", colors: ["#059669", "#FFFFFF"] },
  { id: "maritimo-racing", name: "Marítimo Racing Club", shortName: "Marítimo", city: "Gijón", stadium: "Mareo", crestInitials: "MAR", colors: ["#1E3A8A", "#FFFFFF"] },
  { id: "triple-a-gijon", name: "Triple A. Gijón", shortName: "Triple A", city: "Gijón", stadium: "El Molinon", crestInitials: "TAA", colors: ["#111827", "#EF4444"] },
  { id: "fabril-cd", name: "Fabril C.D.", shortName: "Fabril", city: "Gijón", stadium: "El Requexon", crestInitials: "FAB", colors: ["#1D4ED8", "#FFFFFF"] },
  { id: "cd-praviano-b", name: "CD Praviano B", shortName: "Praviano B", city: "Pravia", stadium: "Santa Catalina", crestInitials: "PRB", colors: ["#B91C1C", "#FFFFFF"] },
  { id: "vegadeo-cf", name: "Vegadeo CF", shortName: "Vegadeo", city: "Vegadeo", stadium: "Municipal", crestInitials: "VEG", colors: ["#15803D", "#FFFFFF"] },
  { id: "codema", name: "Codema", shortName: "Codema", city: "Gijón", stadium: "La Ería", crestInitials: "COD", colors: ["#7C3AED", "#FFFFFF"] },
  { id: "asuncion-cf", name: "Asunción C.F.", shortName: "Asunción", city: "Gijón", stadium: "El Bibio", crestInitials: "ASU", colors: ["#0369A1", "#FDE047"] },
  { id: "siderurgico-cf", name: "Siderúrgico C.F.", shortName: "Siderúrgico", city: "Langreo", stadium: "Tuilla", crestInitials: "SID", colors: ["#374151", "#F97316"] },
  { id: "boal-cf", name: "Boal CF", shortName: "Boal", city: "Boal", stadium: "El Llanon", crestInitials: "BOA", colors: ["#065F46", "#FFFFFF"] },
  { id: "podes-cf", name: "Podes C.F.", shortName: "Podes", city: "Podes", stadium: "Municipal", crestInitials: "POD", colors: ["#4B5563", "#EAB308"] },
  { id: "llaranes-cf", name: "Llaranes C.F.", shortName: "Llaranes", city: "Gijón", stadium: "Pepe Ortiz", crestInitials: "LLA", colors: ["#991B1B", "#FFFFFF"] },
];

const teamSeedById = new Map(TEAM_SEEDS.map((team) => [team.id, team]));

function resolveTeamId(name: string): string {
  const teamId = TEAM_NAME_TO_ID[name];
  if (!teamId) {
    throw new Error(`Unknown team name in 2ª Asturfutbol 25/26: "${name}"`);
  }
  return teamId;
}

function parseKickoffIso(fecha: string, hora: string | null): string {
  const [year, month, day] = fecha.split("-").map(Number);
  const [hours, minutes] = hora ? hora.split(":").map(Number) : [12, 0];
  return new Date(Date.UTC(year, month - 1, day, hours, minutes)).toISOString();
}

type MutableStats = {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form: FormCode[];
};

function emptyStats(): MutableStats {
  return { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0, form: [] };
}

function recordResult(stats: MutableStats, goalsFor: number, goalsAgainst: number) {
  stats.played += 1;
  stats.goalsFor += goalsFor;
  stats.goalsAgainst += goalsAgainst;

  if (goalsFor > goalsAgainst) {
    stats.won += 1;
    stats.points += 3;
    stats.form.push("G");
  } else if (goalsFor < goalsAgainst) {
    stats.lost += 1;
    stats.form.push("P");
  } else {
    stats.drawn += 1;
    stats.points += 1;
    stats.form.push("E");
  }
}

function buildStatsByTeam(data: ResultadosSegundaAsturfutbol): Map<string, MutableStats> {
  const statsByTeam = new Map<string, MutableStats>();
  for (const seed of TEAM_SEEDS) {
    statsByTeam.set(seed.id, emptyStats());
  }

  const jornadas = [...data.jornadas].sort((a, b) => a.jornada - b.jornada);
  for (const jornada of jornadas) {
    for (const partido of jornada.partidos) {
      const homeId = resolveTeamId(partido.local);
      const awayId = resolveTeamId(partido.visitante);
      recordResult(statsByTeam.get(homeId)!, partido.goles_local, partido.goles_visitante);
      recordResult(statsByTeam.get(awayId)!, partido.goles_visitante, partido.goles_local);
    }
  }

  return statsByTeam;
}

export function buildSegundaAsturfutbolTable(
  data: ResultadosSegundaAsturfutbol = SEGUNDA_ASTURFUTBOL_DATA,
): Team[] {
  const statsByTeam = buildStatsByTeam(data);

  const ranked = TEAM_SEEDS.map((seed) => {
    const stats = statsByTeam.get(seed.id)!;
    return {
      seed,
      stats,
      goalDifference: stats.goalsFor - stats.goalsAgainst,
    };
  }).sort((a, b) => {
    if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.stats.goalsFor - a.stats.goalsFor;
  });

  return ranked.map(({ seed, stats }, index) => ({
    id: seed.id,
    name: seed.name,
    shortName: seed.shortName,
    city: seed.city,
    stadium: seed.stadium,
    coach: "—",
    founded: 0,
    crestInitials: seed.crestInitials,
    colors: [...seed.colors],
    position: index + 1,
    zone: index === 0 ? "promotion" : undefined,
    form: stats.form.slice(-5),
    stats: {
      played: stats.played,
      won: stats.won,
      drawn: stats.drawn,
      lost: stats.lost,
      goalsFor: stats.goalsFor,
      goalsAgainst: stats.goalsAgainst,
      points: stats.points,
    },
  }));
}

function buildMatch(partido: ResultadosPartido, round: number): Match {
  const homeTeamId = resolveTeamId(partido.local);
  const awayTeamId = resolveTeamId(partido.visitante);
  const home = teamSeedById.get(homeTeamId)!;
  const away = teamSeedById.get(awayTeamId)!;

  return {
    id: `segunda-j${round}-${homeTeamId}-${awayTeamId}`,
    matchday: round,
    homeTeamId,
    awayTeamId,
    homeTeam: home.name,
    awayTeam: away.name,
    date: parseKickoffIso(partido.fecha, partido.hora),
    competition: FILIAL_COMPETITION_ID,
    venue: home.stadium,
    status: "finished",
    homeScore: partido.goles_local,
    awayScore: partido.goles_visitante,
  };
}

export function buildSegundaAsturfutbolFilialCalendar(data: ResultadosSegundaAsturfutbol = SEGUNDA_ASTURFUTBOL_DATA): Match[] {
  const matches: Match[] = [];

  for (const jornada of [...data.jornadas].sort((a, b) => a.jornada - b.jornada)) {
    for (const partido of jornada.partidos) {
      const homeId = resolveTeamId(partido.local);
      const awayId = resolveTeamId(partido.visitante);
      if (homeId !== FILIAL_TEAM_ID && awayId !== FILIAL_TEAM_ID) continue;
      matches.push(buildMatch(partido, jornada.jornada));
    }
  }

  return matches;
}

function formatResultLine(match: Match): string {
  if (match.homeTeamId === FILIAL_TEAM_ID) {
    return `Real Avilés B ${match.homeScore}-${match.awayScore} ${match.awayTeam}`;
  }
  return `${match.homeTeam} ${match.homeScore}-${match.awayScore} Real Avilés B`;
}

export function buildFilialSummary(data: ResultadosSegundaAsturfutbol = SEGUNDA_ASTURFUTBOL_DATA) {
  const table = buildSegundaAsturfutbolTable(data);
  const filial = table.find((team) => team.id === FILIAL_TEAM_ID);
  const calendar = buildSegundaAsturfutbolFilialCalendar(data);
  const lastMatch = calendar.at(-1);

  return {
    category: data.competicion,
    position: filial ? `${filial.position}º - ${filial.stats.points} pts` : "—",
    lastResult: lastMatch ? formatResultLine(lastMatch) : "—",
    nextMatch: "Temporada 2025-26 finalizada",
  };
}
