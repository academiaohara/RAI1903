export type PlayerStatus = "titular" | "suplente" | "lesionado" | "sancionado" | "cantera" | "nuevo fichaje";
export type PlayerPosition = "Portero" | "Defensa" | "Centrocampista" | "Delantero";

export type Player = {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  number: number;
  position: PlayerPosition;
  nationality: string;
  age: number;
  birthDate: string;
  height: string;
  preferredFoot: "Derecha" | "Izquierda" | "Ambidiestro";
  seasonsAtClub: number;
  status: PlayerStatus;
  rating: number;
  bio: string;
  clubHistory: string[];
  stats: {
    appearances: number;
    goals: number;
    assists: number;
    minutes: number;
    yellowCards: number;
    redCards: number;
  };
};

/** Spanish form badges: G (ganado), E (empatado), P (perdido). */
export type FormCode = "G" | "E" | "P";

export type StandingsZone = "promotion" | "playoff" | "relegation" | "mid";

export type Team = {
  id: string;
  name: string;
  shortName: string;
  city: string;
  stadium: string;
  coach: string;
  founded: number;
  crestInitials: string;
  colors: string[];
  position: number;
  zone?: StandingsZone;
  form: FormCode[];
  stats: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
  };
};

/** Aviles-centric match result for cards and badges. */
export type ResultCode = "W" | "D" | "L";

export type CompetitionId =
  | "liga-raij903"
  | "primera-rfef"
  | "copa-rey"
  | "amistoso"
  | "liga-femenina"
  | "primera-asturfutbol"
  | "liga-nacional-juvenil";

export type MatchStatus = "scheduled" | "finished";

export type Match = {
  id: string;
  matchday: number;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  competition: CompetitionId;
  /** Copa del Rey round label (e.g. Dieciseisavos). */
  competitionStage?: string;
  venue: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
};

export type Matchday = {
  round: number;
  matches: Match[];
};

export type NewsTag = "partido" | "fichajes" | "cantera" | "previa" | "cronica" | "club" | "lesionados" | "rumores" | "renovaciones" | "entrevistas" | "otros";

export type NewsItem = {
  id: string;
  source: string;
  date: string;
  title: string;
  excerpt: string;
  url: string;
  tags: NewsTag[];
  featured?: boolean;
};

export type NewsCategory = "Fichajes" | "Lesionados" | "Rumores" | "Renovaciones" | "Entrevistas" | "Otros";

export type TransferStatus = "Interes" | "Negociacion" | "Cercano" | "Oficial" | "Descartado";
export type TransferCategory = "Rumores" | "Altas" | "Bajas" | "Renovaciones";

export type TransferRumor = {
  id: string;
  playerName: string;
  position: PlayerPosition;
  age: number;
  category: TransferCategory;
  status: TransferStatus;
  probability: number;
  source: string;
  date: string;
  originClub?: string;
  destinationClub?: string;
  rating: number;
  analysis: string;
};

export type PredictionOutcome = "1" | "X" | "2";

/** Porra del Aviles: 0, 1, 2 o M (3 o mas goles). */
export type GoalsPick = 0 | 1 | 2 | "M";

export type Prediction = {
  matchId: string;
  matchday: number;
  outcome?: PredictionOutcome;
  goalsHome?: GoalsPick;
  goalsAway?: GoalsPick;
  /** Un solo goleador del Aviles o "nadie". */
  scorer?: string;
  updatedAt: string;
};

export type OutcomePickStats = {
  outcome: PredictionOutcome;
  count: number;
  percent: number;
};

export type MatchPickStats = {
  matchId: string;
  total: number;
  picks: OutcomePickStats[];
};

export type JornadaParticipant = {
  user: string;
  submittedAt: string;
  points: number;
  hits: number;
};

export type AcademyTeam = {
  id: string;
  name: string;
  coach: string;
  category: string;
  position: string;
  lastResult: string;
  nextMatch: string;
  standoutPlayers: string[];
  news: string[];
  roster: Array<Pick<Player, "id" | "displayName" | "number" | "position" | "age">>;
  table: Team[];
  calendar: Match[];
};

export type PressLink = {
  id: string;
  name: string;
  outlet: string;
  url: string;
  description: string;
};

export type UserPredictionSummary = {
  user: string;
  points: number;
  hits: number;
  exactScores: number;
};

export type FanMediaPlatform = "youtube" | "spotify" | "twitter" | "ivoox" | "apple" | "otro";

export type FanMediaLink = {
  id: string;
  name: string;
  platform: FanMediaPlatform;
  url: string;
  description: string;
  /** Ej. "Lunes y jueves" o "Cada domingo tras el partido". */
  schedule?: string;
};

export type PrimerEquipoGender = "masculino" | "femenino";

export type CalendarMatch = {
  id: string;
  date: string;
  opponent: string;
  opponentLogo: string;
  competition: CompetitionId;
  competitionStage?: string;
  matchday?: number;
  isHome: boolean;
  time: string | null;
  played: boolean;
  result: string | null;
  chronicleUrl: string | null;
};

export type MatchArticle = {
  id: string;
  matchId: string;
  gender: PrimerEquipoGender;
  type: "cronica" | "previa";
  title: string;
  date: string;
  source: string;
  excerpt: string;
  body: string[];
};
