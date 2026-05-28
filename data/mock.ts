import { applyStandingsToTeams } from "@/lib/standings";
import type {
  AcademyTeam,
  CompetitionId,
  FanMediaLink,
  FanYouTubeVideo,
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
      "El Real Aviles Industrial control? los primeros compases con presion alta y transiciones rapidas por banda.",
      "La segunda parte confirmo el guion del equipo, que supo administrar ventaja y cerrar espacios sin perder verticalidad.",
      "Miguel Alonso valor? la intensidad defensiva y la capacidad del grupo para competir partido a partido.",
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
        "El bloque femenino firm? un partido completo desde el inicio, con Claudia Nunez mandando en el centro del campo.",
        "Irene Costa resolvi? con frialdad tres ocasiones claras y el equipo mantuvo la porteria segura en los tramos finales.",
        "Laura Menendez destac? la madurez del grupo y la proyeccion de las jugadoras de cantera.",
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
      excerpt: "Duelo directo por el liderato con dos estilos de presi?n alta y transici?n r?pida.",
      body: [
        "El Aviles Femenino viaja con la segunda posicion asegurada y la ambici?n de recuperar el liderato.",
        "Se espera rotaci?n m?nima en defensa y mayor protagonismo de Noa Garcia por la banda izquierda.",
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
  {
    id: "lne-fichajes-invernales-despiden",
    channel: "prensa",
    source: "La Nueva España",
    date: "2026-05-27",
    title: "Dos de los fichajes invernales del Avilés se despiden del club: 'Ha sido un año duro, intenso y lleno de altibajos'",
    excerpt: "Grigore y Luis Alcalde, que llegaron al Suárez Puerta durante el mes de enero, han escrito unas palabras en sus redes sociales",
    url: "https://www.lne.es/real-aviles/2026/05/27/fichajes-invernales-aviles-despiden-club-130718735.html",
    imageUrl: "https://estaticos-cdn.prensaiberica.es/clip/80ff21af-ae10-4481-8e31-92fd6ea4bbe4_16-9-discover-aspect-ratio_default_0_x1257y537.jpg",
    tags: ["fichajes", "club"],
    teams: ["masculino"],
    featured: true,
  },
  {
    id: "lne-fichajes-veraniegos-renovacion",
    channel: "prensa",
    source: "La Nueva España",
    date: "2026-05-27",
    title: "Los fichajes veraniegos del Avilés, sin renovación automática",
    excerpt: "Los jugadores que llegaron el pasado verano al Avilés contaban con una cláusula para seguir si se ascendía a Segunda, algo que no se activará",
    url: "https://www.lne.es/real-aviles/2026/05/27/fichajes-veraniegos-aviles-renovacion-automatica-130694552.html",
    imageUrl: "https://estaticos-cdn.prensaiberica.es/clip/0e112b57-56ba-4eef-8320-15c6f54e4abd_16-9-aspect-ratio_default_0.jpg",
    tags: ["fichajes", "renovaciones"],
    teams: ["masculino"],
  },
  {
    id: "lne-arquitecto-salvacion",
    channel: "prensa",
    source: "La Nueva España",
    date: "2026-05-27",
    title: "Habla el arquitecto de la salvación del Avilés: 'Hemos conseguido el objetivo que nos marcamos'",
    excerpt: "'Ha sido un temporada dura y muy exigente', apunta el director deportivo blanquiazul, que acaba contrato",
    url: "https://www.lne.es/real-aviles/2026/05/27/habla-arquitecto-salvacion-aviles-hemos-130694553.html",
    imageUrl: "https://estaticos-cdn.prensaiberica.es/clip/67bbd9de-dd19-4cb6-a5d7-647041f04846_16-9-aspect-ratio_default_0.jpg",
    tags: ["entrevistas", "partido"],
  },
  {
    id: "lne-dia-oposiciones",
    channel: "prensa",
    source: "La Nueva España",
    date: "2026-05-26",
    title: "Día de oposiciones, minuto a minuto: así se vivió la trepidante jornada en la que se decidió la salvación del Avilés",
    excerpt: "El cuadro blanquiazul consolidó su plaza en Primera Federación en una tarde que evolucionó desde la tranquilidad a la preocupación, hasta el final feliz y el surrealismo extremo",
    url: "https://www.lne.es/real-aviles/2026/05/26/dia-oposiciones-minuto-minuto-130677391.html",
    imageUrl: "https://estaticos-cdn.prensaiberica.es/clip/8b12064c-f782-4270-9e69-b36d0809f276_16-9-discover-aspect-ratio_default_0_x1226y471.jpg",
    tags: ["partido", "cronica"],
  },
  {
    id: "lne-reconstruccion-contratos",
    channel: "prensa",
    source: "La Nueva España",
    date: "2026-05-26",
    title: "El Avilés, ante una profunda reconstrucción: así está la situación de los contratos de la plantilla blanquiazul",
    excerpt: "Los blanquiazules tan solo tienen un jugador con contrato asegurado para la próxima campaña, Pablo Álvarez",
    url: "https://www.lne.es/real-aviles/2026/05/26/aviles-profunda-reconstruccion-situacion-contratos-130652565.html",
    imageUrl: "https://estaticos-cdn.prensaiberica.es/clip/b79ade27-cb36-4843-92b7-4d4cfd326189_16-9-discover-aspect-ratio_default_0_x596y254.jpg",
    tags: ["club", "renovaciones", "fichajes"],
    teams: ["masculino"],
  },
  {
    id: "lne-diego-baeza-hoja-ruta",
    channel: "prensa",
    source: "La Nueva España",
    date: "2026-05-25",
    title: "Diego Baeza marca la hoja de ruta del futuro Avilés: el primer paso estará en las oficinas",
    excerpt: "El presidente blanquiazul asegura que, antes de contratar al nuevo entrenador, se centra en saber quién ocupará la dirección deportiva",
    url: "https://www.lne.es/real-aviles/2026/05/25/diego-baeza-marca-hoja-ruta-130641895.html",
    imageUrl: "https://estaticos-cdn.prensaiberica.es/clip/c27add04-e4e4-469a-9e21-55e97d3888d7_16-9-discover-aspect-ratio_default_0_x876y536.jpg",
    tags: ["entrevistas", "club"],
  },
  {
    id: "comercio-presidente-linares",
    channel: "prensa",
    source: "El Comercio",
    date: "2026-05-26",
    title: "El presidente del Real Avilés pasa revista en LA VOZ: Linares, objetivos, presupuesto, ciudad deportiva...",
    excerpt: "Diego Baeza hace balance de la primera temporada del club en Primera Federación y mira hacia el futuro",
    url: "https://www.elcomercio.es/real-aviles/presidente-real-aviles-pasa-revista-voz-linares-20260526230134-nt.html",
    imageUrl: "https://s2.ppllstatics.com/elcomercio/www/multimedia/2026/05/26/diego-baeza-RH7YgRA6I4o0iam3Hhw0fuJ-1200x840@El%20Comercio.jpg",
    tags: ["entrevistas", "club"],
  },
  {
    id: "comercio-temporada-sufrida",
    channel: "prensa",
    source: "El Comercio",
    date: "2026-05-25",
    title: "Una temporada sufrida pero con final feliz en el Real Avilés",
    excerpt: "El conjunto blanquiazul utilizó a 27 jugadores en su estreno en Primera RFEF, con un Kevin Bautista estelar que firmó nueve goles y cuatro asistencias",
    url: "https://www.elcomercio.es/real-aviles/temporada-sufrida-final-feliz-real-aviles-20260525211043-nt.html",
    imageUrl: "https://s3.ppllstatics.com/elcomercio/www/multimedia/2026/05/25/real-aviles-RVWTNB5sx6ufOMja1MJoorM-1200x840@El%20Comercio.jpg",
    tags: ["cronica", "partido"],
  },
  {
    id: "comercio-verano-trabajo",
    channel: "prensa",
    source: "El Comercio",
    date: "2026-05-24",
    title: "El Real Avilés despide la temporada y da paso a un verano de mucho trabajo",
    excerpt: "El club debe negociar la continuidad de Miguel Linares, Lolo Escobar no va a seguir y la mayoría de jugadores acaban contrato el 30 de junio",
    url: "https://www.elcomercio.es/real-aviles/real-aviles-temporada-verano-trabajo-plantilla-entrenador-20260524194126-nt.html",
    imageUrl: "https://s3.ppllstatics.com/elcomercio/www/multimedia/2026/05/24/comida-aviles-RIgCXeRGWKwu2UXj5TjriDP-1200x840@El%20Comercio.jpg",
    tags: ["club", "fichajes"],
  },
  {
    id: "comercio-primera-federacion",
    channel: "prensa",
    source: "El Comercio",
    date: "2026-05-23",
    title: "El Real Avilés se queda en Primera Federación",
    excerpt: "El conjunto blanquiazul cumple su objetivo en un gran partido ante el Pontevedra, que acabó empatando en el añadido",
    url: "https://www.elcomercio.es/real-aviles/real-aviles-queda-primera-federacion-20260523223401-nt.html",
    imageUrl: "https://s2.ppllstatics.com/elcomercio/www/multimedia/2026/05/23/cronica-digital-RuaQYDoT3fqFlEjveYkL9qO-1200x840@El%20Comercio.jpg",
    tags: ["partido", "club"],
  },
  {
    id: "rtpa-permanencia-pasaron",
    channel: "prensa",
    source: "RTPA",
    date: "2026-05-23",
    title: "El Real Avilés Industrial se juega la permanencia en Pasarón",
    excerpt: "Los de Lolo Escobar necesitan sumar al menos un punto",
    url: "https://www.rtpa.es/noticias-deportes/2026-05-23/El-Real-Aviles-Industrial-se-juega-la-permanencia-en-Pasaron_111779544812.html",
    imageUrl: "https://www.rtpa.es/fotos//26/04/20260417203904_RTPA7986186.webp",
    tags: ["previa", "partido"],
  },
  {
    id: "rtpa-linares-continuidad",
    channel: "prensa",
    source: "RTPA",
    date: "2026-05-27",
    title: "El Real Avilés Industrial debe negociar la continuidad de Miguel Linares",
    excerpt: "El siguiente paso será buscar un nuevo entrenador",
    url: "https://www.rtpa.es/noticias-deportes/2026-05-27/El-Real-Aviles-Industrial-debe-negociar-la-continuidad-de-Miguel-Linares_111779890820.html",
    imageUrl: "https://www.rtpa.es/fotos//26/05/20260527164228_RTPA8154117.webp",
    tags: ["renovaciones", "entrevistas"],
  },
  {
    id: "club-somos-primera-rfef",
    channel: "club",
    source: "Real Avilés Industrial",
    date: "2026-05-24",
    title: "Somos de Primera RFEF",
    excerpt: "Comunicado oficial del club tras certificar la permanencia en Primera Federación.",
    url: "https://www.realavilesindustrial1903.com/somos-de-primera-rfef/",
    tags: ["club", "partido"],
    teams: ["masculino"],
    featured: true,
  },
  {
    id: "club-a-90-minutos",
    channel: "club",
    source: "Real Avilés Industrial",
    date: "2026-05-22",
    title: "A 90 minutos",
    excerpt: "El club prepara el partido decisivo por la permanencia con la mirada puesta en Pasarón.",
    url: "https://www.realavilesindustrial1903.com/a-90-minutos/",
    tags: ["previa", "partido"],
  },
  {
    id: "club-a-por-la-permanencia",
    channel: "club",
    source: "Real Avilés Industrial",
    date: "2026-05-19",
    title: "¡A por la permanencia!",
    excerpt: "Nota oficial de cara al tramo final de la temporada con la salvación como objetivo.",
    url: "https://www.realavilesindustrial1903.com/a-por-la-permanencia/",
    tags: ["previa", "partido"],
  },
  {
    id: "club-queda-una-bala",
    channel: "club",
    source: "Real Avilés Industrial",
    date: "2026-05-18",
    title: "Queda una bala",
    excerpt: "El equipo afronta la recta final con una última oportunidad para asegurar la categoría.",
    url: "https://www.realavilesindustrial1903.com/queda-una-bala/",
    tags: ["previa", "partido"],
    teams: ["masculino"],
  },
  {
    id: "club-femenino-pretemporada",
    channel: "club",
    source: "Real Avilés Industrial Femenino",
    date: "2026-05-20",
    title: "El femenino arranca la pretemporada",
    excerpt: "El primer equipo femenino comienza los trabajos de preparacion con la mirada puesta en la nueva campana.",
    url: "https://www.realavilesindustrial1903.com/",
    tags: ["club", "previa"],
    teams: ["femenino"],
  },
];

export const transfers: TransferRumor[] = [
  { id: "t1", playerName: "Iker Vieites", position: "Defensa", age: 22, category: "Rumores", status: "Negociacion", probability: 62, source: "Mercado Norte", date: "2026-10-20", originClub: "Coruxo FC", destinationClub: "Real Aviles Industrial", rating: 4, analysis: "Perfil sub-23 para doblar el lateral, con margen fisico y buen centro lateral." },
  { id: "t2", playerName: "Bruno Santamaria", position: "Delantero", age: 27, category: "Rumores", status: "Interes", probability: 38, source: "AsturFutbol", date: "2026-10-18", originClub: "CD Guijuelo", destinationClub: "Real Aviles Industrial", rating: 3, analysis: "Delantero movil que encajaria como complemento de Llera, aunque el coste salarial es alto." },
  {
    id: "t3",
    playerId: "mateo-rios",
    playerName: "Mateo Rios",
    position: "Centrocampista",
    age: 23,
    category: "Altas",
    status: "Oficial",
    probability: 100,
    source: "Club",
    date: "2026-07-10",
    originClub: "RC Celta Fortuna",
    destinationClub: "Real Aviles Industrial",
    rating: 4,
    analysis: "Fichaje de energia y conduccion para subir el techo creativo de la medular.",
    clubAnnouncement:
      "El Real Aviles Industrial hace oficial la incorporacion de Mateo Rios, centrocampista de 23 anos procedente del RC Celta Fortuna. Firma por dos temporadas y se incorpora a la pretemporada con dorsal 8.",
  },
  {
    id: "t4",
    playerId: "samuel-rodriguez",
    playerName: "Samuel Rodriguez",
    position: "Delantero",
    age: 25,
    category: "Altas",
    status: "Oficial",
    probability: 100,
    source: "Club",
    date: "2026-07-18",
    originClub: "Bergantinos FC",
    destinationClub: "Real Aviles Industrial",
    rating: 4,
    analysis: "Aporta juego entre lineas, trabajo sin balon y alternativas para jugar con dos puntas.",
    clubAnnouncement:
      "Samuel Rodriguez se convierte en nuevo jugador del Real Aviles Industrial. El delantero asturiano llega desde el Bergantinos FC para reforzar la zona de ataque blanquiazul.",
  },
  {
    id: "t9",
    playerId: "marcos-alvarez",
    playerName: "Marcos Alvarez",
    position: "Defensa",
    age: 28,
    category: "Altas",
    status: "Oficial",
    probability: 100,
    source: "Club",
    date: "2026-07-05",
    originClub: "UD Llanera",
    destinationClub: "Real Aviles Industrial",
    rating: 4,
    analysis: "Central contundente que refuerza el eje defensivo con experiencia en Segunda RFEF.",
    clubAnnouncement:
      "Marcos Alvarez firma por el Real Aviles Industrial tras su paso por el UD Llanera. Central de 28 anos que aporta solidez y liderazgo en la zaga.",
  },
  { id: "t5", playerName: "Hugo Carballo", position: "Portero", age: 24, category: "Bajas", status: "Oficial", probability: 100, source: "Club", date: "2026-07-02", originClub: "Real Aviles Industrial", destinationClub: "UP Langreo", rating: 3, analysis: "Salida logica tras perder protagonismo; libera una ficha senior y minutos para Prendes." },
  {
    id: "t6",
    playerId: "nicolas-fidalgo",
    playerName: "Nicolas Fidalgo",
    position: "Centrocampista",
    age: 26,
    category: "Renovaciones",
    status: "Oficial",
    probability: 100,
    source: "Club",
    date: "2026-10-12",
    originClub: "Real Aviles Industrial",
    destinationClub: "Real Aviles Industrial",
    rating: 5,
    analysis: "Pieza diferencial entre lineas; retenerlo seria un mensaje competitivo para el proyecto.",
    clubAnnouncement:
      "Nicolas Fidalgo renueva su contrato con el Real Aviles Industrial hasta 2027. El club blinda a uno de sus referentes creativos en la medular.",
  },
  { id: "t7", playerName: "Adrian Castro", position: "Delantero", age: 28, category: "Bajas", status: "Descartado", probability: 8, source: "RAI1903", date: "2026-10-07", originClub: "Real Aviles Industrial", destinationClub: "CD Lealtad", rating: 2, analysis: "El cuerpo tecnico cuenta con el extremo cuando supere su lesion muscular." },
  {
    id: "t8",
    playerId: "pablo-cuesta",
    playerName: "Pablo Cuesta",
    position: "Centrocampista",
    age: 27,
    category: "Renovaciones",
    status: "Oficial",
    probability: 100,
    source: "Club",
    date: "2026-10-15",
    originClub: "Real Aviles Industrial",
    destinationClub: "Real Aviles Industrial",
    rating: 5,
    analysis: "El equilibrio del equipo pasa por su continuidad; prioridad alta en la direccion deportiva.",
    clubAnnouncement:
      "Pablo Cuesta amplia su vinculacion con el Real Aviles Industrial. El mediocentro capitanea el eje del equipo y seguira liderando la medular la proxima campana.",
  },
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
  { id: "filial", name: "Filial", coach: "Dani Borrego", category: "Primera Asturfutbol", position: "2? - 19 pts", lastResult: "Real Aviles B 2-0 Llanera B", nextMatch: "Real Aviles B - Roces", standoutPlayers: ["Raul Prendes", "Jorge Villa", "Enol Ferreiro"], news: ["Tercera porteria a cero seguida", "Dos juveniles entrenan con el primer equipo"], roster: players.filter((player) => ["raul-prendes", "jorge-villa", "enol-ferreiro", "diego-moran", "oscar-cabanas"].includes(player.id)).map(({ id, displayName, number, position, age }) => ({ id, displayName, number, position, age })), table: academyTable("filial"), calendar: academyCalendar("filial", "B", "primera-asturfutbol") },
  { id: "juvenil-a", name: "Juvenil A", coach: "Borja Fernandez", category: "Liga Nacional Juvenil", position: "1? - 22 pts", lastResult: "Real Aviles 3-1 Verina", nextMatch: "Covadonga - Real Aviles", standoutPlayers: ["Mario Noval", "Leo Paredes", "Enol Ferreiro"], news: ["Cuarta victoria consecutiva", "Debut de dos juveniles con el filial"], roster: [{ id: "mario-noval", displayName: "M. Noval", number: 7, position: "Delantero", age: 17 }, { id: "leo-paredes", displayName: "L. Paredes", number: 10, position: "Centrocampista", age: 18 }, { id: "izan-arias", displayName: "I. Arias", number: 4, position: "Defensa", age: 17 }, { id: "dani-riestra", displayName: "D. Riestra", number: 1, position: "Portero", age: 18 }, { id: "hugo-menendez", displayName: "H. Menendez", number: 9, position: "Delantero", age: 17 }], table: academyTable("juvenil-a"), calendar: academyCalendar("juvenil-a", "Juvenil A", "liga-nacional-juvenil") },
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

const RAI_YOUTUBE_CHANNEL = "https://www.youtube.com/channel/UCqnlVJmxk-zGSSNCb9noziw";
const RAI_SPOTIFY_PODCAST = "https://open.spotify.com/show/5kHriw0nbuCDhY5qtLHuQC";

/** Episodios recientes de Zona Mixta en YouTube (el ?ltimo se muestra destacado). */
export const fanZonaMixtaVideos: FanYouTubeVideo[] = [
  {
    id: "zona-mixta-v1",
    title: "Zona Mixta",
    url: "https://youtu.be/cFMjxc7ifGA",
  },
  {
    id: "zona-mixta-v2",
    title: "Zona Mixta",
    url: "https://youtu.be/E3G45yeP17k",
  },
  {
    id: "zona-mixta-v3",
    title: "Zona Mixta",
    url: "https://youtu.be/1C8YDs_y75w",
  },
  {
    id: "zona-mixta-v4",
    title: "Zona Mixta",
    url: "https://youtu.be/_gb5fS8lIbE",
  },
];

/** Zona Mixta: programa oficial del club en YouTube y Spotify. */
export const fanZonaMixta: FanMediaLink[] = [
  {
    id: "zona-mixta-youtube",
    name: "Zona Mixta",
    platform: "youtube",
    url: RAI_YOUTUBE_CHANNEL,
    description: "Entrevistas con directivos, entrenadores y jugadores. Presentado por Jorge Quir?s.",
    schedule: "Semanal",
  },
  {
    id: "zona-mixta-spotify",
    name: "Zona Mixta en Spotify",
    platform: "spotify",
    url: RAI_SPOTIFY_PODCAST,
    description: "Episodios del programa en el canal de podcast oficial del club.",
  },
];

/** Previas oficiales antes de cada partido (el ultimo se muestra destacado). */
export const fanPreviaVideos: FanYouTubeVideo[] = [
  { id: "previa-v1", title: "Previa", url: "https://youtu.be/57y06JKzZa8" },
  { id: "previa-v2", title: "Previa", url: "https://youtu.be/w7Ayjxe76aA" },
  { id: "previa-v3", title: "Previa", url: "https://youtu.be/7QoTrVnOUmw" },
  { id: "previa-v4", title: "Previa", url: "https://youtu.be/Y4MobJJerF4" },
  { id: "previa-v5", title: "Previa", url: "https://youtu.be/Wd8uN3Z5J3U" },
];

/** Ruedas de prensa (RDP) del cuerpo tecnico (el ultimo se muestra destacado). */
export const fanRdpVideos: FanYouTubeVideo[] = [
  { id: "rdp-v1", title: "RDP", url: "https://youtu.be/UoOSohza1kE" },
  { id: "rdp-v2", title: "RDP", url: "https://youtu.be/tFKmZC99qSs" },
  { id: "rdp-v3", title: "RDP", url: "https://youtu.be/Kxuks6EiBdg" },
  { id: "rdp-v4", title: "RDP", url: "https://youtu.be/V7TtRlBDveE" },
  { id: "rdp-v5", title: "RDP", url: "https://youtu.be/eCeLvze6axY" },
];

/** Contenido de aficion y pe?as: tertulias y directos en X Spaces. */
export const fanTenteFirme: FanMediaLink[] = [
  {
    id: "tente-firme-space-1",
    name: "Tente firme ? Space I",
    platform: "twitter",
    url: "https://x.com/i/spaces/1vKpPPNBdVXKE",
    description: "Tertulia o directo de aficion grabado en X Spaces.",
  },
  {
    id: "tente-firme-space-2",
    name: "Tente firme ? Space II",
    platform: "twitter",
    url: "https://x.com/i/spaces/1kKzDMRrDYNJv",
    description: "Tertulia o directo de aficion grabado en X Spaces.",
  },
];
