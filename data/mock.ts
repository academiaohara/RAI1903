import { applyStandingsToTeams } from "@/lib/standings";
import type {
  AcademyTeam,
  CompetitionId,
  FanMediaLink,
  Match,
  MatchArticle,
  Matchday,
  NewsItem,
  Player,
  PressLink,
  Team,
  TransferRumor,
  JornadaParticipant,
  MatchPickStats,
  UserPredictionSummary,
} from "@/types";

export const RAI_TEAM_ID = "real-aviles-industrial";
export const RAI_FEM_TEAM_ID = "real-aviles-industrial-femenino";
export const COMPETITION_NAME = "Liga RAI1903 Norte";
export const COMPETITION_NAME_FEM = "Liga Femenina RAI1903";

export const competitionSeasons = [
  { id: "2024-25", label: "2024/25" },
  { id: "2025-26", label: "2025/26" },
  { id: "2026-27", label: "2026/27" },
] as const;

export type CompetitionSeasonId = (typeof competitionSeasons)[number]["id"];

export const DEFAULT_COMPETITION_SEASON_ID: CompetitionSeasonId = "2025-26";

const baseTeams: Team[] = [
  { id: RAI_TEAM_ID, name: "Real Aviles Industrial", shortName: "Aviles", city: "Aviles", stadium: "Roman Suarez Puerta", coach: "Miguel Alonso", founded: 1903, crestInitials: "RAI", colors: ["#214C9B", "#FFFFFF"], position: 0, form: [], stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 } },
  { id: "pontevedra", name: "Pontevedra CF", shortName: "Pontevedra", city: "Pontevedra", stadium: "Pasaron", coach: "Javi Rey", founded: 1941, crestInitials: "PON", colors: ["#7A1435", "#FFFFFF"], position: 0, form: [], stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 } },
  { id: "numancia", name: "CD Numancia", shortName: "Numancia", city: "Soria", stadium: "Los Pajaritos", coach: "Aitor Calle", founded: 1945, crestInitials: "NUM", colors: ["#D71920", "#1D2D50"], position: 0, form: [], stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 } },
  { id: "langreo", name: "UP Langreo", shortName: "Langreo", city: "Langreo", stadium: "Nuevo Ganzabal", coach: "Javi Vazquez", founded: 1961, crestInitials: "LAN", colors: ["#1D4ED8", "#E11D48"], position: 0, form: [], stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 } },
  { id: "coruxo", name: "Coruxo FC", shortName: "Coruxo", city: "Vigo", stadium: "O Vao", coach: "David de Dios", founded: 1930, crestInitials: "COR", colors: ["#0F766E", "#FFFFFF"], position: 0, form: [], stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 } },
  { id: "marino-luanco", name: "Marino de Luanco", shortName: "Marino", city: "Luanco", stadium: "Miramar", coach: "Sergio Sanchez", founded: 1931, crestInitials: "MAR", colors: ["#1E3A8A", "#F8FAFC"], position: 0, form: [], stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 } },
  { id: "compostela", name: "SD Compostela", shortName: "Compos", city: "Santiago", stadium: "Vero Bono", coach: "Anton Permuy", founded: 1962, crestInitials: "SDC", colors: ["#0EA5E9", "#FFFFFF"], position: 0, form: [], stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 } },
  { id: "bergantinos", name: "Bergantinos FC", shortName: "Bergantinos", city: "Carballo", stadium: "As Eiroas", coach: "Jose Luis Lemos", founded: 1923, crestInitials: "BER", colors: ["#EF4444", "#FFFFFF"], position: 0, form: [], stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 } },
  { id: "guijuelo", name: "CD Guijuelo", shortName: "Guijuelo", city: "Guijuelo", stadium: "Municipal Luis Ramos", coach: "Mario Sanchez", founded: 1974, crestInitials: "GUI", colors: ["#166534", "#FFFFFF"], position: 0, form: [], stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 } },
  { id: "zamora", name: "Zamora CF", shortName: "Zamora", city: "Zamora", stadium: "Ruta de la Plata", coach: "Yago Iglesias", founded: 1968, crestInitials: "ZAM", colors: ["#DC2626", "#111827"], position: 0, form: [], stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 } },
  { id: "racing-villalbes", name: "Racing Villalbes", shortName: "Villalbes", city: "Vilalba", stadium: "A Magdalena", coach: "Simon Lamas", founded: 1931, crestInitials: "RCV", colors: ["#16A34A", "#FFFFFF"], position: 0, form: [], stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 } },
  { id: "llanera", name: "UD Llanera", shortName: "Llanera", city: "Llanera", stadium: "Pepe Quimaran", coach: "Chuchi Collado", founded: 1981, crestInitials: "LLA", colors: ["#111827", "#F59E0B"], position: 0, form: [], stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 } },
  { id: "ourense", name: "Ourense CF", shortName: "Ourense", city: "Ourense", stadium: "O Couto", coach: "Ruben Dominguez", founded: 1977, crestInitials: "OUR", colors: ["#2563EB", "#FFFFFF"], position: 0, form: [], stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 } },
  { id: "covadonga", name: "CD Covadonga", shortName: "Covadonga", city: "Oviedo", stadium: "Juan Antonio Alvarez Rabanal", coach: "Ivan Ania", founded: 1979, crestInitials: "COV", colors: ["#0F172A", "#60A5FA"], position: 0, form: [], stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 } },
  { id: "lealtad", name: "CD Lealtad", shortName: "Lealtad", city: "Villaviciosa", stadium: "Les Caleyes", coach: "Samuel Banos", founded: 1916, crestInitials: "LEA", colors: ["#111827", "#FFFFFF"], position: 0, form: [], stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 } },
  { id: "aviles-b", name: "Sporting Atletico", shortName: "Sporting B", city: "Gijon", stadium: "Mareo", coach: "Dani Mori", founded: 1960, crestInitials: "SGB", colors: ["#EF4444", "#FFFFFF"], position: 0, form: [], stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 } },
  { id: "unionistas-b", name: "Unionistas Promesas", shortName: "Unionistas B", city: "Salamanca", stadium: "Reina Sofia Anexo", coach: "Sergio Garcia", founded: 2013, crestInitials: "UNI", colors: ["#111827", "#FFFFFF"], position: 0, form: [], stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 } },
  { id: "torrelavega", name: "RS Gimnastica", shortName: "Gimnastica", city: "Torrelavega", stadium: "El Malecon", coach: "Cristian Fernandez", founded: 1907, crestInitials: "RSG", colors: ["#1D4ED8", "#FFFFFF"], position: 0, form: [], stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 } },
  { id: "rayo-cantabria", name: "Rayo Cantabria", shortName: "Rayo Cantabria", city: "Santander", stadium: "La Albericia", coach: "Ezequiel Loza", founded: 1993, crestInitials: "RAC", colors: ["#22C55E", "#FFFFFF"], position: 0, form: [], stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 } },
  { id: "cristo-atletico", name: "CD Cristo Atletico", shortName: "Cristo", city: "Palencia", stadium: "Nueva Balastera", coach: "Ruben Gala", founded: 1985, crestInitials: "CTA", colors: ["#6D28D9", "#F8FAFC"], position: 0, form: [], stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 } },
];

const baseTeamsFemenino: Team[] = baseTeams.map((team) =>
  team.id === RAI_TEAM_ID
    ? {
        ...team,
        id: RAI_FEM_TEAM_ID,
        name: "Real Aviles Industrial Femenino",
        shortName: "Aviles Fem.",
        coach: "Laura Menendez",
      }
    : { ...team },
);

const teamById = new Map(baseTeams.map((team) => [team.id, team]));

const competitionForRound = (round: number): { competition: CompetitionId; competitionStage?: string } => {
  if (round === 4) return { competition: "copa-rey", competitionStage: "Dieciseisavos" };
  if (round === 12) return { competition: "copa-rey", competitionStage: "Octavos" };
  if (round === 8 || round === 16) return { competition: "amistoso" };
  if (round === 6 || round === 14) return { competition: "primera-rfef" };
  return { competition: "liga-raij903" };
};

const generateMatchdays = (): Matchday[] => {
  const ids = baseTeams.map((team) => team.id);
  const current = [...ids];
  const firstLeg: string[][][] = [];

  for (let round = 0; round < ids.length - 1; round += 1) {
    const pairings: string[][] = [];
    for (let index = 0; index < ids.length / 2; index += 1) {
      const left = current[index];
      const right = current[ids.length - 1 - index];
      pairings.push(round % 2 === 0 ? [left, right] : [right, left]);
    }
    firstLeg.push(pairings);
    const fixed = current[0];
    const rest = current.slice(1);
    rest.unshift(rest.pop() as string);
    current.splice(0, current.length, fixed, ...rest);
  }

  const rounds = [...firstLeg, ...firstLeg.map((round) => round.map(([home, away]) => [away, home]))];

  return rounds.map((roundMatches, roundIndex) => {
    const round = roundIndex + 1;
    const matches: Match[] = roundMatches.map(([homeTeamId, awayTeamId], matchIndex) => {
      const home = teamById.get(homeTeamId)!;
      const away = teamById.get(awayTeamId)!;
      const isFinished = round <= 9;
      const homeIndex = ids.indexOf(homeTeamId);
      const awayIndex = ids.indexOf(awayTeamId);
      const homeScore = isFinished ? (round + matchIndex + homeIndex) % 4 : undefined;
      const awayScore = isFinished ? (round + matchIndex + awayIndex + 1) % 3 : undefined;
      const date = new Date(Date.UTC(2026, 7, 23 + (round - 1) * 7, 15 + (matchIndex % 4), matchIndex % 2 === 0 ? 0 : 30));

      const { competition, competitionStage } = competitionForRound(round);

      return {
        id: `j${round}-${homeTeamId}-${awayTeamId}`,
        matchday: round,
        homeTeamId,
        awayTeamId,
        homeTeam: home.name,
        awayTeam: away.name,
        date: date.toISOString(),
        competition,
        competitionStage,
        venue: home.stadium,
        status: isFinished ? "finished" : "scheduled",
        homeScore,
        awayScore,
      };
    });

    return { round, matches };
  });
};

export const matchdays = generateMatchdays();

const leagueMatches = matchdays.flatMap((round) => round.matches);

export const teams: Team[] = applyStandingsToTeams(baseTeams, leagueMatches);
export const teamsFemenino: Team[] = applyStandingsToTeams(baseTeamsFemenino, leagueMatches);

export const players: Player[] = [
  { id: "alvaro-garcia", firstName: "Alvaro", lastName: "Garcia", displayName: "A. Garcia", number: 1, position: "Portero", nationality: "Espana", age: 29, birthDate: "1997-03-14", height: "1,88 m", preferredFoot: "Derecha", seasonsAtClub: 3, status: "titular", rating: 7.18, bio: "Portero sobrio, fuerte por alto y con buen desplazamiento en largo para activar transiciones.", clubHistory: ["Real Oviedo Vetusta", "Marino de Luanco", "Real Aviles Industrial"], stats: { appearances: 9, goals: 0, assists: 0, minutes: 810, yellowCards: 1, redCards: 0 } },
  { id: "ivan-mendez", firstName: "Ivan", lastName: "Mendez", displayName: "I. Mendez", number: 2, position: "Defensa", nationality: "Espana", age: 25, birthDate: "2001-05-22", height: "1,78 m", preferredFoot: "Derecha", seasonsAtClub: 2, status: "titular", rating: 7.02, bio: "Lateral de recorrido amplio, agresivo en la presion y fiable en duelos defensivos.", clubHistory: ["Sporting Atletico", "UP Langreo", "Real Aviles Industrial"], stats: { appearances: 9, goals: 1, assists: 3, minutes: 784, yellowCards: 2, redCards: 0 } },
  { id: "daniel-sierra", firstName: "Daniel", lastName: "Sierra", displayName: "D. Sierra", number: 4, position: "Defensa", nationality: "Espana", age: 31, birthDate: "1995-11-08", height: "1,86 m", preferredFoot: "Izquierda", seasonsAtClub: 5, status: "titular", rating: 7.26, bio: "Central zurdo con jerarquia, salida limpia y dominio en area propia.", clubHistory: ["CD Lealtad", "Real Aviles Industrial"], stats: { appearances: 8, goals: 2, assists: 0, minutes: 720, yellowCards: 3, redCards: 0 } },
  { id: "marcos-alvarez", firstName: "Marcos", lastName: "Alvarez", displayName: "M. Alvarez", number: 5, position: "Defensa", nationality: "Espana", age: 28, birthDate: "1998-01-29", height: "1,84 m", preferredFoot: "Derecha", seasonsAtClub: 1, status: "nuevo fichaje", rating: 6.91, bio: "Central intenso, contundente y con lectura para defender campo abierto.", clubHistory: ["CD Covadonga", "UD Llanera", "Real Aviles Industrial"], stats: { appearances: 7, goals: 0, assists: 1, minutes: 602, yellowCards: 4, redCards: 0 } },
  { id: "pablo-cuesta", firstName: "Pablo", lastName: "Cuesta", displayName: "P. Cuesta", number: 6, position: "Centrocampista", nationality: "Espana", age: 27, birthDate: "1999-06-03", height: "1,80 m", preferredFoot: "Derecha", seasonsAtClub: 4, status: "titular", rating: 7.34, bio: "Mediocentro posicional, lider en recuperaciones y primer pase tras robo.", clubHistory: ["Caudal Deportivo", "Real Aviles Industrial"], stats: { appearances: 9, goals: 1, assists: 2, minutes: 801, yellowCards: 5, redCards: 0 } },
  { id: "sergio-navia", firstName: "Sergio", lastName: "Navia", displayName: "S. Navia", number: 7, position: "Delantero", nationality: "Espana", age: 24, birthDate: "2002-09-17", height: "1,75 m", preferredFoot: "Izquierda", seasonsAtClub: 2, status: "titular", rating: 7.41, bio: "Extremo vertical, desequilibrante en uno contra uno y especialista a balon parado.", clubHistory: ["Real Aviles Juvenil", "Real Aviles Industrial"], stats: { appearances: 9, goals: 4, assists: 5, minutes: 736, yellowCards: 1, redCards: 0 } },
  { id: "mateo-rios", firstName: "Mateo", lastName: "Rios", displayName: "M. Rios", number: 8, position: "Centrocampista", nationality: "Espana", age: 23, birthDate: "2003-02-10", height: "1,77 m", preferredFoot: "Ambidiestro", seasonsAtClub: 1, status: "nuevo fichaje", rating: 7.11, bio: "Interior dinamico, con conduccion para romper lineas y llegada a frontal.", clubHistory: ["RC Celta Fortuna", "Real Aviles Industrial"], stats: { appearances: 8, goals: 2, assists: 2, minutes: 664, yellowCards: 2, redCards: 0 } },
  { id: "hector-llera", firstName: "Hector", lastName: "Llera", displayName: "H. Llera", number: 9, position: "Delantero", nationality: "Espana", age: 30, birthDate: "1996-07-19", height: "1,82 m", preferredFoot: "Derecha", seasonsAtClub: 3, status: "titular", rating: 7.56, bio: "Referencia ofensiva del equipo, domina el area y fija centrales para liberar a los extremos.", clubHistory: ["CD Tuilla", "UP Langreo", "Real Aviles Industrial"], stats: { appearances: 9, goals: 7, assists: 1, minutes: 755, yellowCards: 2, redCards: 0 } },
  { id: "nicolas-fidalgo", firstName: "Nicolas", lastName: "Fidalgo", displayName: "N. Fidalgo", number: 10, position: "Centrocampista", nationality: "Espana", age: 26, birthDate: "2000-04-06", height: "1,74 m", preferredFoot: "Izquierda", seasonsAtClub: 2, status: "titular", rating: 7.49, bio: "Media punta creativo, ultimo pase y pausa en los ataques posicionales.", clubHistory: ["Real Oviedo Vetusta", "SD Compostela", "Real Aviles Industrial"], stats: { appearances: 9, goals: 3, assists: 4, minutes: 699, yellowCards: 1, redCards: 0 } },
  { id: "diego-moran", firstName: "Diego", lastName: "Moran", displayName: "D. Moran", number: 11, position: "Delantero", nationality: "Espana", age: 22, birthDate: "2004-12-01", height: "1,79 m", preferredFoot: "Derecha", seasonsAtClub: 1, status: "suplente", rating: 6.83, bio: "Atacante rapido para agitar partidos desde el banquillo y atacar espacios largos.", clubHistory: ["Juvenil A Real Aviles", "Real Aviles Industrial"], stats: { appearances: 7, goals: 2, assists: 1, minutes: 318, yellowCards: 0, redCards: 0 } },
  { id: "raul-prendes", firstName: "Raul", lastName: "Prendes", displayName: "R. Prendes", number: 13, position: "Portero", nationality: "Espana", age: 21, birthDate: "2005-08-26", height: "1,90 m", preferredFoot: "Derecha", seasonsAtClub: 6, status: "cantera", rating: 6.7, bio: "Guardameta formado en casa, reflejos rapidos y proyeccion para competir el puesto.", clubHistory: ["Real Aviles Juvenil", "Real Aviles Industrial"], stats: { appearances: 1, goals: 0, assists: 0, minutes: 90, yellowCards: 0, redCards: 0 } },
  { id: "oscar-cabanas", firstName: "Oscar", lastName: "Cabanas", displayName: "O. Cabanas", number: 14, position: "Defensa", nationality: "Espana", age: 24, birthDate: "2002-10-12", height: "1,81 m", preferredFoot: "Izquierda", seasonsAtClub: 2, status: "suplente", rating: 6.68, bio: "Lateral izquierdo competitivo, util para cerrar partidos con defensa de cinco.", clubHistory: ["CD Colunga", "Real Aviles Industrial"], stats: { appearances: 5, goals: 0, assists: 1, minutes: 271, yellowCards: 1, redCards: 0 } },
  { id: "jorge-villa", firstName: "Jorge", lastName: "Villa", displayName: "J. Villa", number: 15, position: "Centrocampista", nationality: "Espana", age: 20, birthDate: "2006-05-04", height: "1,76 m", preferredFoot: "Derecha", seasonsAtClub: 7, status: "cantera", rating: 6.95, bio: "Mediocentro de cantera, ordenado sin balon y valiente para recibir entre lineas.", clubHistory: ["Real Aviles Cadete", "Real Aviles Juvenil", "Real Aviles Industrial"], stats: { appearances: 6, goals: 0, assists: 2, minutes: 356, yellowCards: 2, redCards: 0 } },
  { id: "adrian-castro", firstName: "Adrian", lastName: "Castro", displayName: "A. Castro", number: 17, position: "Delantero", nationality: "Espana", age: 28, birthDate: "1998-09-28", height: "1,72 m", preferredFoot: "Izquierda", seasonsAtClub: 2, status: "lesionado", rating: 6.52, bio: "Extremo zurdo en recuperacion, aporta desborde y centros tensos desde banda derecha.", clubHistory: ["CD Mosconia", "Real Aviles Industrial"], stats: { appearances: 4, goals: 1, assists: 0, minutes: 214, yellowCards: 1, redCards: 0 } },
  { id: "luis-bayon", firstName: "Luis", lastName: "Bayon", displayName: "L. Bayon", number: 18, position: "Defensa", nationality: "Espana", age: 32, birthDate: "1994-02-15", height: "1,83 m", preferredFoot: "Derecha", seasonsAtClub: 4, status: "sancionado", rating: 6.74, bio: "Defensa polivalente, capaz de actuar como central o lateral segun el contexto.", clubHistory: ["Caudal Deportivo", "Real Aviles Industrial"], stats: { appearances: 6, goals: 0, assists: 0, minutes: 401, yellowCards: 3, redCards: 1 } },
  { id: "enol-ferreiro", firstName: "Enol", lastName: "Ferreiro", displayName: "E. Ferreiro", number: 19, position: "Centrocampista", nationality: "Espana", age: 19, birthDate: "2007-01-21", height: "1,73 m", preferredFoot: "Derecha", seasonsAtClub: 8, status: "cantera", rating: 6.89, bio: "Interior con energia, buen golpeo desde media distancia y caracter competitivo.", clubHistory: ["Real Aviles Infantil", "Real Aviles Juvenil", "Real Aviles Industrial"], stats: { appearances: 5, goals: 1, assists: 1, minutes: 249, yellowCards: 1, redCards: 0 } },
  { id: "samuel-rodriguez", firstName: "Samuel", lastName: "Rodriguez", displayName: "S. Rodriguez", number: 21, position: "Delantero", nationality: "Espana", age: 25, birthDate: "2001-03-30", height: "1,85 m", preferredFoot: "Derecha", seasonsAtClub: 1, status: "nuevo fichaje", rating: 6.96, bio: "Segundo punta de apoyos, buen juego de espaldas y lectura para descargar de cara.", clubHistory: ["Bergantinos FC", "Real Aviles Industrial"], stats: { appearances: 8, goals: 3, assists: 2, minutes: 511, yellowCards: 2, redCards: 0 } },
];

export const playersFemenino: Player[] = [
  { id: "fem-lucia-ramos", firstName: "Lucia", lastName: "Ramos", displayName: "L. Ramos", number: 1, position: "Portero", nationality: "Espana", age: 27, birthDate: "1999-04-12", height: "1,74 m", preferredFoot: "Derecha", seasonsAtClub: 4, status: "titular", rating: 7.32, bio: "Portera referente del bloque femenino, fuerte en uno contra uno y salida de balon.", clubHistory: ["Sporting de Gijon Femenino", "Real Aviles Industrial Femenino"], stats: { appearances: 9, goals: 0, assists: 0, minutes: 810, yellowCards: 0, redCards: 0 } },
  { id: "fem-sara-perez", firstName: "Sara", lastName: "Perez", displayName: "S. Perez", number: 3, position: "Defensa", nationality: "Espana", age: 24, birthDate: "2002-08-03", height: "1,69 m", preferredFoot: "Izquierda", seasonsAtClub: 2, status: "titular", rating: 7.08, bio: "Central rapida y agresiva en marca, lider del eje defensivo.", clubHistory: ["Oviedo Moderno", "Real Aviles Industrial Femenino"], stats: { appearances: 9, goals: 1, assists: 0, minutes: 801, yellowCards: 2, redCards: 0 } },
  { id: "fem-claudia-nunez", firstName: "Claudia", lastName: "Nunez", displayName: "C. Nunez", number: 6, position: "Centrocampista", nationality: "Espana", age: 26, birthDate: "2000-11-19", height: "1,66 m", preferredFoot: "Derecha", seasonsAtClub: 3, status: "titular", rating: 7.44, bio: "Mediocentro con gran volumen de juego y capacidad para romper presion.", clubHistory: ["Real Aviles Industrial Femenino"], stats: { appearances: 9, goals: 2, assists: 4, minutes: 790, yellowCards: 3, redCards: 0 } },
  { id: "fem-irene-costa", firstName: "Irene", lastName: "Costa", displayName: "I. Costa", number: 9, position: "Delantero", nationality: "Espana", age: 23, birthDate: "2003-01-27", height: "1,71 m", preferredFoot: "Derecha", seasonsAtClub: 1, status: "titular", rating: 7.61, bio: "Delantera goleadora, fuerte en el juego aereo y en la finalizacion rapida.", clubHistory: ["CD Orientacion Maritima", "Real Aviles Industrial Femenino"], stats: { appearances: 9, goals: 8, assists: 2, minutes: 742, yellowCards: 1, redCards: 0 } },
  { id: "fem-noa-garcia", firstName: "Noa", lastName: "Garcia", displayName: "N. Garcia", number: 11, position: "Delantero", nationality: "Espana", age: 21, birthDate: "2005-06-15", height: "1,68 m", preferredFoot: "Izquierda", seasonsAtClub: 5, status: "cantera", rating: 7.02, bio: "Extrema zurda con desborde y llegada constante al segundo palo.", clubHistory: ["Real Aviles Cadete Femenino", "Real Aviles Industrial Femenino"], stats: { appearances: 8, goals: 3, assists: 5, minutes: 655, yellowCards: 1, redCards: 0 } },
  { id: "fem-marta-diaz", firstName: "Marta", lastName: "Diaz", displayName: "M. Diaz", number: 14, position: "Defensa", nationality: "Espana", age: 29, birthDate: "1997-09-08", height: "1,72 m", preferredFoot: "Derecha", seasonsAtClub: 2, status: "titular", rating: 6.98, bio: "Lateral derecha con proyeccion y centros al area rival.", clubHistory: ["UD Santa Teresa", "Real Aviles Industrial Femenino"], stats: { appearances: 8, goals: 0, assists: 3, minutes: 710, yellowCards: 2, redCards: 0 } },
  { id: "fem-alba-torre", firstName: "Alba", lastName: "Torre", displayName: "A. Torre", number: 17, position: "Centrocampista", nationality: "Espana", age: 20, birthDate: "2006-03-22", height: "1,65 m", preferredFoot: "Ambidiestro", seasonsAtClub: 6, status: "cantera", rating: 6.88, bio: "Interior joven con buen golpeo desde media distancia.", clubHistory: ["Real Aviles Juvenil Femenino", "Real Aviles Industrial Femenino"], stats: { appearances: 7, goals: 1, assists: 2, minutes: 402, yellowCards: 0, redCards: 0 } },
  { id: "fem-elena-rios", firstName: "Elena", lastName: "Rios", displayName: "E. Rios", number: 19, position: "Centrocampista", nationality: "Espana", age: 25, birthDate: "2001-12-30", height: "1,67 m", preferredFoot: "Izquierda", seasonsAtClub: 1, status: "nuevo fichaje", rating: 7.15, bio: "Media punta con vision y ultimo pase para activar a las delanteras.", clubHistory: ["Zaragoza CFF B", "Real Aviles Industrial Femenino"], stats: { appearances: 9, goals: 4, assists: 3, minutes: 688, yellowCards: 2, redCards: 0 } },
];

const buildMatchArticles = (matches: Match[]): MatchArticle[] => {
  const avilesMatches = matches.filter((match) => match.homeTeamId === RAI_TEAM_ID || match.awayTeamId === RAI_TEAM_ID);
  const finished = avilesMatches.filter((match) => match.status === "finished");
  const scheduled = avilesMatches.filter((match) => match.status === "scheduled").slice(0, 6);

  const cronicas: MatchArticle[] = finished.map((match) => ({
    id: `cronica-${match.id}`,
    matchId: match.id,
    gender: "masculino",
    type: "cronica",
    title: `Cronica: ${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam}`,
    date: match.date,
    source: "RAI1903",
    excerpt: `Resumen de la jornada ${match.matchday} con lectura tactica, protagonistas y sensaciones del vestuario blanquiazul.`,
    body: [
      `El encuentro de la jornada ${match.matchday} dejo un marcador de ${match.homeScore}-${match.awayScore} en ${match.venue}.`,
      "El Real Aviles Industrial controló los primeros compases con presion alta y transiciones rapidas por banda.",
      "La segunda parte confirmo el guion del equipo, que supo administrar ventaja y cerrar espacios sin perder verticalidad.",
      "Miguel Alonso valoró la intensidad defensiva y la capacidad del grupo para competir partido a partido.",
    ],
  }));

  const previas: MatchArticle[] = scheduled.map((match) => ({
    id: `previa-${match.id}`,
    matchId: match.id,
    gender: "masculino",
    type: "previa",
    title: `Previa: ${match.homeTeam} vs ${match.awayTeam}`,
    date: match.date,
    source: "AsturFutbol",
    excerpt: `Analisis del duelo de la jornada ${match.matchday}: forma reciente, claves tacticas y estado de la plantilla.`,
    body: [
      `El Real Aviles Industrial afronta la jornada ${match.matchday} ante ${match.awayTeamId === RAI_TEAM_ID ? match.homeTeam : match.awayTeam}.`,
      "El cuerpo tecnico llega con la plantilla casi completa y rotaciones pensadas para sostener el ritmo competitivo.",
      "La clave pasara por dominar los duelos en campo abierto y aprovechar las acciones a balon parado.",
      "El Roman Suarez Puerta busca otro ambiente exigente para empujar al equipo en un tramo decisivo de la liga.",
    ],
  }));

  const femeninoExtras: MatchArticle[] = [
    {
      id: "cronica-fem-j8",
      matchId: "fem-j8-llanera",
      gender: "femenino",
      type: "cronica",
      title: "Cronica: Aviles Femenino 3-1 Llanera",
      date: "2026-10-12T11:00:00.000Z",
      source: "RAI1903",
      excerpt: "Victoria contundente con hat-trick parcial de Irene Costa y gran actitud colectiva.",
      body: [
        "El bloque femenino firmó un partido completo desde el inicio, con Claudia Nunez mandando en el centro del campo.",
        "Irene Costa resolvió con frialdad tres ocasiones claras y el equipo mantuvo la porteria segura en los tramos finales.",
        "Laura Menendez destacó la madurez del grupo y la proyeccion de las jugadoras de cantera.",
      ],
    },
    {
      id: "previa-fem-j10",
      matchId: "fem-j10-covadonga",
      gender: "femenino",
      type: "previa",
      title: "Previa: Covadonga vs Aviles Femenino",
      date: "2026-10-26T11:30:00.000Z",
      source: "Futbol Femenino Norte",
      excerpt: "Duelo directo por el liderato con dos estilos de presión alta y transición rápida.",
      body: [
        "El Aviles Femenino viaja con la segunda posicion asegurada y la ambición de recuperar el liderato.",
        "Se espera rotación mínima en defensa y mayor protagonismo de Noa Garcia por la banda izquierda.",
        "El partido puede decidirse en los primeros quince minutos de cada parte.",
      ],
    },
  ];

  const cronicasFemenino: MatchArticle[] = finished.map((match) => ({
    id: `cronica-fem-${match.id}`,
    matchId: match.id,
    gender: "femenino",
    type: "cronica",
    title: `Cronica femenina: ${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam}`,
    date: match.date,
    source: "RAI1903",
    excerpt: "Resumen del bloque femenino con protagonismo de Irene Costa y Claudia Nunez.",
    body: [
      `La jornada ${match.matchday} dejo un ${match.homeScore}-${match.awayScore} para el primer equipo femenino.`,
      "El equipo mostro intensidad sin balon y solvencia en los ultimos metros.",
      "Laura Menendez destaco la madurez del grupo y la aportacion de la cantera.",
    ],
  }));

  const previasFemenino: MatchArticle[] = scheduled.map((match) => ({
    id: `previa-fem-${match.id}`,
    matchId: match.id,
    gender: "femenino",
    type: "previa",
    title: `Previa femenina: ${match.homeTeam} vs ${match.awayTeam}`,
    date: match.date,
    source: "Futbol Femenino Norte",
    excerpt: `Analisis femenino de la jornada ${match.matchday} con estado de forma y convocatoria.`,
    body: [
      `El Aviles Femenino afronta la jornada ${match.matchday} con ambicion de sumar en la parte alta de la tabla.`,
      "Laura Menendez cuenta con la base titular y rotaciones para mantener la intensidad.",
      "La clave sera el duelo en bandas y la capacidad de cerrar el partido desde balon parado.",
    ],
  }));

  return [...cronicas, ...previas, ...cronicasFemenino, ...previasFemenino, ...femeninoExtras];
};

export const matchArticles: MatchArticle[] = buildMatchArticles(matchdays.flatMap((matchday) => matchday.matches));

export const newsItems: NewsItem[] = [
  { id: "n1", channel: "club", source: "RAI1903", date: "2026-10-20", title: "El Aviles encuentra una marcha mas antes del tramo clave", excerpt: "El equipo suma siete puntos de nueve y gana solidez en las areas, con Llera y Navia liderando la produccion ofensiva.", url: "https://example.com/rai1903/aviles-tramo-clave", tags: ["club", "partido"], featured: true },
  { id: "n2", channel: "prensa", source: "La Voz de Aviles", date: "2026-10-19", title: "Sierra: 'El Roman tiene que ser un campo incomodo para todos'", excerpt: "El central blanquiazul analiza la mejora defensiva y pide continuidad tras el ultimo triunfo en casa.", url: "https://example.com/prensa/sierra-roman", tags: ["entrevistas", "club"] },
  { id: "n3", channel: "prensa", source: "AsturFutbol", date: "2026-10-18", title: "Previa: duelo de estilos entre Aviles y Numancia", excerpt: "La jornada enfrenta al tercer clasificado con uno de los bloques mas fiables de la categoria.", url: "https://example.com/asturfutbol/previa-numancia", tags: ["previa", "partido"] },
  { id: "n4", channel: "prensa", source: "El Comercio", date: "2026-10-16", title: "La cantera gana peso en los planes del cuerpo tecnico", excerpt: "Villa y Ferreiro acumulan minutos y el Juvenil A mantiene la primera posicion de su grupo.", url: "https://example.com/elcomercio/cantera-aviles", tags: ["cantera", "club"] },
  { id: "n5", channel: "prensa", source: "Mercado Norte", date: "2026-10-14", title: "Un lateral sub-23 entra en la agenda blanquiazul", excerpt: "El club rastrea perfiles jovenes para reforzar la banda izquierda en el mercado de invierno.", url: "https://example.com/mercado/lateral-sub23", tags: ["fichajes", "rumores"] },
  { id: "n6", channel: "prensa", source: "Radio Marca Asturias", date: "2026-10-13", title: "Cronica: oficio y pegada para volver al playoff", excerpt: "El Aviles firmo un partido maduro, con dominio de areas y gestion de ritmos tras adelantarse.", url: "https://example.com/radio/cronicarai", tags: ["cronica", "partido"] },
  { id: "n7", channel: "prensa", source: "Futbol Modesto", date: "2026-10-11", title: "Parte medico: Castro apunta a volver al grupo", excerpt: "El extremo completa trabajo individual y podria entrar en la convocatoria si supera la ultima prueba.", url: "https://example.com/modesto/parte-medico-castro", tags: ["lesionados", "club"] },
  { id: "n8", channel: "prensa", source: "La Voz de Aviles", date: "2026-10-09", title: "Fidalgo y Cuesta, renovaciones prioritarias", excerpt: "La direccion deportiva quiere cerrar antes de enero dos piezas clave del centro del campo.", url: "https://example.com/voz/renovaciones-aviles", tags: ["renovaciones", "club"] },
  { id: "n9", channel: "prensa", source: "Cantera Norte", date: "2026-10-08", title: "El Cadete confirma su progresion con otra porteria a cero", excerpt: "El bloque de Marcos Roldan encadena cuatro jornadas sin perder y sube al podio.", url: "https://example.com/cantera/cadete", tags: ["cantera", "cronica"] },
  { id: "n10", channel: "club", source: "RAI1903", date: "2026-10-07", title: "El club prepara iniciativas para llenar el Roman", excerpt: "Promociones para abonados jovenes, colegios y penas locales antes del duelo grande del mes.", url: "https://example.com/rai1903/roman-promos", tags: ["otros", "club"] },
];

export const transfers: TransferRumor[] = [
  { id: "t1", playerName: "Iker Vieites", position: "Defensa", age: 22, category: "Rumores", status: "Negociacion", probability: 62, source: "Mercado Norte", date: "2026-10-20", originClub: "Coruxo FC", destinationClub: "Real Aviles Industrial", rating: 4, analysis: "Perfil sub-23 para doblar el lateral, con margen fisico y buen centro lateral." },
  { id: "t2", playerName: "Bruno Santamaria", position: "Delantero", age: 27, category: "Rumores", status: "Interes", probability: 38, source: "AsturFutbol", date: "2026-10-18", originClub: "CD Guijuelo", destinationClub: "Real Aviles Industrial", rating: 3, analysis: "Delantero movil que encajaria como complemento de Llera, aunque el coste salarial es alto." },
  { id: "t3", playerName: "Mateo Rios", position: "Centrocampista", age: 23, category: "Altas", status: "Oficial", probability: 100, source: "Club", date: "2026-07-10", originClub: "RC Celta Fortuna", destinationClub: "Real Aviles Industrial", rating: 4, analysis: "Fichaje de energia y conduccion para subir el techo creativo de la medular." },
  { id: "t4", playerName: "Samuel Rodriguez", position: "Delantero", age: 25, category: "Altas", status: "Oficial", probability: 100, source: "Club", date: "2026-07-18", originClub: "Bergantinos FC", destinationClub: "Real Aviles Industrial", rating: 4, analysis: "Aporta juego entre lineas, trabajo sin balon y alternativas para jugar con dos puntas." },
  { id: "t5", playerName: "Hugo Carballo", position: "Portero", age: 24, category: "Bajas", status: "Oficial", probability: 100, source: "Club", date: "2026-07-02", originClub: "Real Aviles Industrial", destinationClub: "UP Langreo", rating: 3, analysis: "Salida logica tras perder protagonismo; libera una ficha senior y minutos para Prendes." },
  { id: "t6", playerName: "Nicolas Fidalgo", position: "Centrocampista", age: 26, category: "Renovaciones", status: "Cercano", probability: 82, source: "La Voz de Aviles", date: "2026-10-12", originClub: "Real Aviles Industrial", destinationClub: "Real Aviles Industrial", rating: 5, analysis: "Pieza diferencial entre lineas; retenerlo seria un mensaje competitivo para el proyecto." },
  { id: "t7", playerName: "Adrian Castro", position: "Delantero", age: 28, category: "Bajas", status: "Descartado", probability: 8, source: "RAI1903", date: "2026-10-07", originClub: "Real Aviles Industrial", destinationClub: "CD Lealtad", rating: 2, analysis: "El cuerpo tecnico cuenta con el extremo cuando supere su lesion muscular." },
  { id: "t8", playerName: "Pablo Cuesta", position: "Centrocampista", age: 27, category: "Renovaciones", status: "Negociacion", probability: 69, source: "Radio Marca Asturias", date: "2026-10-15", originClub: "Real Aviles Industrial", destinationClub: "Real Aviles Industrial", rating: 5, analysis: "El equilibrio del equipo pasa por su continuidad; prioridad alta en la direccion deportiva." },
];

const academyTable = (teamName: string): Team[] => [
  { id: `${teamName}-aviles`, name: `Real Aviles ${teamName}`, shortName: "Aviles", city: "Aviles", stadium: "Santo Domingo", coach: "Casa", founded: 1903, crestInitials: "RAI", colors: ["#214C9B", "#FFFFFF"], position: 2, form: ["G", "G", "E", "G", "P"], stats: { played: 9, won: 6, drawn: 1, lost: 2, goalsFor: 19, goalsAgainst: 9, points: 19 } },
  { id: `${teamName}-oviedo`, name: "Real Oviedo Vetusta", shortName: "Oviedo B", city: "Oviedo", stadium: "El Requexon", coach: "Pablo Lago", founded: 1926, crestInitials: "OVI", colors: ["#214C9B", "#FFFFFF"], position: 1, form: ["G", "E", "G", "G", "G"], stats: { played: 9, won: 6, drawn: 2, lost: 1, goalsFor: 21, goalsAgainst: 8, points: 20 } },
  { id: `${teamName}-llanera`, name: "UD Llanera", shortName: "Llanera", city: "Llanera", stadium: "Pepe Quimaran", coach: "Adrian Torre", founded: 1981, crestInitials: "LLA", colors: ["#111827", "#F59E0B"], position: 3, form: ["G", "P", "G", "E", "G"], stats: { played: 9, won: 5, drawn: 2, lost: 2, goalsFor: 16, goalsAgainst: 10, points: 17 } },
  { id: `${teamName}-roces`, name: "TSK Roces", shortName: "Roces", city: "Gijon", stadium: "Covadonga", coach: "Ivan Valdes", founded: 1952, crestInitials: "ROC", colors: ["#DC2626", "#FFFFFF"], position: 4, form: ["E", "G", "P", "G", "E"], stats: { played: 9, won: 4, drawn: 3, lost: 2, goalsFor: 13, goalsAgainst: 11, points: 15 } },
  { id: `${teamName}-covadonga`, name: "CD Covadonga", shortName: "Covadonga", city: "Oviedo", stadium: "Juan Antonio Alvarez", coach: "Hugo Perez", founded: 1979, crestInitials: "COV", colors: ["#0F172A", "#60A5FA"], position: 5, form: ["P", "G", "E", "G", "P"], stats: { played: 9, won: 4, drawn: 1, lost: 4, goalsFor: 12, goalsAgainst: 14, points: 13 } },
];

const academyCalendar = (teamId: string, teamName: string, competition: CompetitionId): Match[] => [
  { id: `${teamId}-j10`, matchday: 10, homeTeamId: `${teamId}-aviles`, awayTeamId: `${teamId}-roces`, homeTeam: `Real Aviles ${teamName}`, awayTeam: "TSK Roces", date: "2026-10-24T10:30:00.000Z", competition, venue: "Santo Domingo", status: "scheduled" },
  { id: `${teamId}-j11`, matchday: 11, homeTeamId: `${teamId}-covadonga`, awayTeamId: `${teamId}-aviles`, homeTeam: "CD Covadonga", awayTeam: `Real Aviles ${teamName}`, date: "2026-10-31T11:00:00.000Z", competition, venue: "Juan Antonio Alvarez", status: "scheduled" },
  { id: `${teamId}-j12`, matchday: 12, homeTeamId: `${teamId}-aviles`, awayTeamId: `${teamId}-llanera`, homeTeam: `Real Aviles ${teamName}`, awayTeam: "UD Llanera", date: "2026-11-07T12:00:00.000Z", competition, venue: "Santo Domingo", status: "scheduled" },
];

export const academyTeams: AcademyTeam[] = [
  { id: "filial", name: "Filial", coach: "Dani Borrego", category: "Primera Asturfutbol", position: "2º - 19 pts", lastResult: "Real Aviles B 2-0 Llanera B", nextMatch: "Real Aviles B - Roces", standoutPlayers: ["Raul Prendes", "Jorge Villa", "Enol Ferreiro"], news: ["Tercera porteria a cero seguida", "Dos juveniles entrenan con el primer equipo"], roster: players.filter((player) => ["raul-prendes", "jorge-villa", "enol-ferreiro", "diego-moran", "oscar-cabanas"].includes(player.id)).map(({ id, displayName, number, position, age }) => ({ id, displayName, number, position, age })), table: academyTable("filial"), calendar: academyCalendar("filial", "B", "primera-asturfutbol") },
  { id: "juvenil-a", name: "Juvenil A", coach: "Borja Fernandez", category: "Liga Nacional Juvenil", position: "1º - 22 pts", lastResult: "Real Aviles 3-1 Verina", nextMatch: "Covadonga - Real Aviles", standoutPlayers: ["Mario Noval", "Leo Paredes", "Enol Ferreiro"], news: ["Cuarta victoria consecutiva", "Debut de dos juveniles con el filial"], roster: [{ id: "mario-noval", displayName: "M. Noval", number: 7, position: "Delantero", age: 17 }, { id: "leo-paredes", displayName: "L. Paredes", number: 10, position: "Centrocampista", age: 18 }, { id: "izan-arias", displayName: "I. Arias", number: 4, position: "Defensa", age: 17 }, { id: "dani-riestra", displayName: "D. Riestra", number: 1, position: "Portero", age: 18 }, { id: "hugo-menendez", displayName: "H. Menendez", number: 9, position: "Delantero", age: 17 }], table: academyTable("juvenil-a"), calendar: academyCalendar("juvenil-a", "Juvenil A", "liga-nacional-juvenil") },
];

export const pressLinks: PressLink[] = [
  { id: "la-voz", name: "La Voz de Aviles", outlet: "Prensa local", url: "https://example.com/la-voz-aviles", description: "Seguimiento diario del club, entrevistas y piezas de ciudad." },
  { id: "el-comercio", name: "El Comercio", outlet: "Prensa regional", url: "https://example.com/el-comercio-aviles", description: "Cronicas, previas y contexto del futbol asturiano." },
  { id: "radio-marca", name: "Radio Marca Asturias", outlet: "Radio", url: "https://example.com/radio-marca-asturias", description: "Audios, tertulias y actualidad de la categoria." },
  { id: "asturfutbol", name: "AsturFutbol", outlet: "Digital", url: "https://example.com/asturfutbol", description: "Calendarios, rivales y mercado de futbol modesto." },
];

export const CURRENT_QUINIELA_ROUND = 10;

const hashSeed = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const matchPickStats: MatchPickStats[] = matchdays.flatMap((matchday) =>
  matchday.matches.map((match) => {
    const seed = hashSeed(match.id);
    const raw = [
      { outcome: "1" as const, count: 18 + (seed % 40) },
      { outcome: "X" as const, count: 12 + ((seed >> 3) % 28) },
      { outcome: "2" as const, count: 10 + ((seed >> 6) % 32) },
    ];
    const total = raw.reduce((sum, item) => sum + item.count, 0);
    return {
      matchId: match.id,
      total,
      picks: raw.map((item) => ({
        ...item,
        percent: Math.round((item.count / total) * 1000) / 10,
      })),
    };
  }),
);

const participantNames = [
  "Roman1903",
  "LaGradaDeRivero",
  "BlanquiazulData",
  "VillaDelAdelantado",
  "RomanSuarez",
  "PuertaNorte",
  "AsturFutbolero",
  "GradaAzul",
  "Industrial1903",
  "CaleyaBlanca",
  "MuelleDeAviles",
  "Trubia1903",
];

export const jornadaParticipants: Record<number, JornadaParticipant[]> = Object.fromEntries(
  matchdays.map((matchday) => {
    const finished = matchday.round <= 9;
    const entries = participantNames
      .slice(0, 8 + (matchday.round % 5))
      .map((user, index) => ({
        user,
        submittedAt: new Date(Date.UTC(2026, 7, 20 + matchday.round, 9 + index, (index * 11) % 60)).toISOString(),
        points: finished ? 4 + ((matchday.round + index * 3) % 12) : 0,
        hits: finished ? 3 + ((matchday.round + index) % 7) : 0,
      }))
      .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));

    if (finished) {
      entries.sort((a, b) => b.points - a.points || a.submittedAt.localeCompare(b.submittedAt));
    }

    return [matchday.round, entries];
  }),
);

export const quinielaRanking: UserPredictionSummary[] = [
  { user: "Roman1903", points: 41, hits: 29, exactScores: 5 },
  { user: "LaGradaDeRivero", points: 38, hits: 27, exactScores: 4 },
  { user: "BlanquiazulData", points: 34, hits: 24, exactScores: 3 },
  { user: "VillaDelAdelantado", points: 31, hits: 22, exactScores: 2 },
];

export const matchdayResult = {
  round: 9,
  pointsAvailable: 20,
  averagePoints: 9.6,
  bestUser: quinielaRanking[0],
  highlightedMatch: matchdays[8].matches.find((match) => match.homeTeamId === RAI_TEAM_ID || match.awayTeamId === RAI_TEAM_ID),
};

/** Programas de YouTube que repasan la actualidad del club. Sustituye las URLs por los canales reales. */
export const youtubePrograms: FanMediaLink[] = [
  {
    id: "programa-oficial",
    name: "Canal oficial del club",
    platform: "youtube",
    url: "https://www.youtube.com",
    description: "Resumenes, entrevistas y piezas institucionales del Real Aviles Industrial.",
    schedule: "Publicaciones semanales",
  },
  {
    id: "programa-actualidad",
    name: "Espacio para programa de actualidad",
    platform: "youtube",
    url: "https://www.youtube.com",
    description: "Enlaza aqui el programa de YouTube que repasa cada jornada, fichajes y ruedas de prensa.",
    schedule: "Tras cada partido",
  },
  {
    id: "programa-tertulia",
    name: "Espacio para tertulia blanquiazul",
    platform: "youtube",
    url: "https://www.youtube.com",
    description: "Hueco reservado para tertulias o directos de aficionados con analisis del equipo.",
  },
];

/** Podcasts y audio fan compartidos en Spotify, Twitter/X, iVoox y similares. */
export const fanPodcasts: FanMediaLink[] = [
  {
    id: "podcast-spotify",
    name: "Espacio en Spotify",
    platform: "spotify",
    url: "https://open.spotify.com",
    description: "Enlaza el podcast de aficionados que sigues en Spotify.",
    schedule: "Episodio semanal",
  },
  {
    id: "podcast-ivoox",
    name: "Espacio en iVoox",
    platform: "ivoox",
    url: "https://www.ivoox.com",
    description: "Para programas de audio alojados en iVoox u otras plataformas locales.",
  },
  {
    id: "podcast-twitter",
    name: "Espacio en X / Twitter",
    platform: "twitter",
    url: "https://x.com",
    description: "Cuenta o espacio donde los aficionados comparten clips, directos o hilos de actualidad.",
  },
  {
    id: "podcast-apple",
    name: "Espacio en Apple Podcasts",
    platform: "apple",
    url: "https://podcasts.apple.com",
    description: "Enlaza el feed de Apple Podcasts si el programa tambien esta alli.",
  },
];
