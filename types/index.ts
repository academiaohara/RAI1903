export type PlayerStatus = "titular" | "suplente" | "lesionado" | "sancionado" | "cantera" | "nuevo fichaje";
export type PlayerPosition = "Portero" | "Defensa" | "Centrocampista" | "Delantero";

export type PlayerRoleCode = "POR" | "LD" | "LI" | "DFC" | "MC" | "MCO" | "MCD" | "SD" | "ED" | "DC" | "MP" | "EI";

export type Player = {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  number: number;
  position: PlayerPosition;
  nationality: string;
  /** Lugar de nacimiento cuando consta en la ficha oficial. */
  birthPlace?: string;
  age: number;
  birthDate: string;
  height: string;
  preferredFoot: "Derecha" | "Izquierda" | "Ambidiestro";
  seasonsAtClub: number;
  status: PlayerStatus;
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
  /** Aviso cuando el desempate queda pendiente de resolución oficial. */
  tiebreakNote?: string;
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
  | "segunda-asturfutbol"
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

export type NewsChannel = "club" | "prensa";

export type NewsItem = {
  id: string;
  channel: NewsChannel;
  source: string;
  date: string;
  title: string;
  excerpt: string;
  url: string;
  imageUrl?: string;
  tags: NewsTag[];
  featured?: boolean;
  /** Si se omite, la noticia aplica al club en general (masculino y femenino). */
  teams?: PrimerEquipoGender[];
  /** Jugadores mencionados en la noticia (id de plantilla). */
  playerIds?: string[];
};

export type NewsCategory = "Fichajes" | "Lesionados" | "Rumores" | "Renovaciones" | "Entrevistas" | "Otros";

export type TransferStatus = "Interes" | "Negociacion" | "Cercano" | "Oficial" | "Descartado";
export type TransferCategory = "Rumores" | "Altas" | "Bajas" | "Renovaciones";

export type TransferKind = "fichaje" | "renovacion" | "cesion";

export type TransferMarketWindowId =
  | "verano-24-25"
  | "invierno-24-25"
  | "verano-25-26"
  | "invierno-25-26";

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
  /** Enlace con jugador de plantilla cuando existe. */
  playerId?: string;
  /** Comunicado oficial del club (mock). */
  clubAnnouncement?: string;
  /** Noticia del club enlazada al comunicado (fichaje, renovacion, etc.). */
  clubAnnouncementNewsId?: string;
  /** Ventana de mercado (verano / invierno de una temporada). */
  marketWindowId?: TransferMarketWindowId;
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
  /** Fecha del espacio o episodio (p. ej. "26/05/2026"). */
  date?: string;
  /** Foto de perfil de la cuenta (p. ej. avatar de X). */
  avatarUrl?: string;
  /** Ej. "Lunes y jueves" o "Cada domingo tras el partido". */
  schedule?: string;
};

export type FanYouTubeVideo = {
  id: string;
  title: string;
  url: string;
  /** Fecha del vídeo (p. ej. "26/05/2026"). */
  date?: string;
};

export type PrimerEquipoGender = "masculino" | "femenino";

export type CalendarMatch = {
  id: string;
  date: string;
  opponent: string;
  opponentLogo: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: string;
  awayTeamId: string;
  venue: string;
  competition: CompetitionId;
  competitionStage?: string;
  matchday?: number;
  isHome: boolean;
  time: string | null;
  played: boolean;
  result: string | null;
  homeScore?: number;
  awayScore?: number;
  chronicleUrl: string | null;
  previaUrl: string | null;
};

export type CalendarViewMode = "mes" | "lista";

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
  /** Nota oficial del club en la web (sin contenido propio en RAI1903). */
  clubNewsId?: string;
};

export type MatchStatRow = {
  label: string;
  home: string | number;
  away: string | number;
};

export type MatchStatCategory = {
  title: string;
  rows: MatchStatRow[];
};

export type LineupPlayer = {
  number: number;
  name: string;
  role?: string;
};

export type MatchLineup = {
  formation: string;
  starters: LineupPlayer[];
  bench: LineupPlayer[];
};

export type MatchEventType = "goal" | "goal_disallowed" | "yellow" | "red" | "substitution";

export type MatchEvent = {
  id: string;
  minute: number;
  type: MatchEventType;
  team: "home" | "away";
  player: string;
  detail?: string;
};

export type RecentFormMatch = {
  date: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  competition: string;
  resultCode: FormCode;
};

export type HeadToHeadEntry = {
  date: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  competition: string;
  resultCode: FormCode;
};

export type MatchAvailabilityPlayer = {
  name: string;
  reason: "lesionado" | "sancionado";
  detail: string;
};

export type MatchAvailability = {
  home: MatchAvailabilityPlayer[];
  away: MatchAvailabilityPlayer[];
};

export type MatchVideo = {
  id: string;
  title: string;
  url: string;
  label: string;
};

export type MatchDetail = {
  match: Match;
  gender: PrimerEquipoGender;
  referee: string;
  attendance: number | null;
  kickoffTime: string;
  kickoffDateLabel: string;
  seasonLabel: string;
  stats: MatchStatCategory[];
  events: MatchEvent[];
  homeLineup: MatchLineup;
  awayLineup: MatchLineup;
  homeRecentMatches: RecentFormMatch[];
  awayRecentMatches: RecentFormMatch[];
  headToHead: HeadToHeadEntry[];
  h2hSummary: { wins: number; draws: number; losses: number };
  availability: MatchAvailability;
  rdpPrevia: MatchVideo | null;
  rdpPostpartido: MatchVideo | null;
  pressNews: NewsItem[];
  chronicleNews: NewsItem[];
};
