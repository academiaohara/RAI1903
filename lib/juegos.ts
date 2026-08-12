export const GAME_MODES = [
  { id: "quiniela", label: "Quiniela" },
  { id: "quinigol", label: "Quinigol" },
  { id: "clasificacion", label: "Clasificación" },
] as const;

export type GameModeId = (typeof GAME_MODES)[number]["id"];

export const GAME_TABS = [
  { slug: "pronosticos", label: "Pronósticos" },
  { slug: "resultado", label: "Resultado" },
  { slug: "ranking", label: "Ranking" },
] as const;

export type GameTabSlug = (typeof GAME_TABS)[number]["slug"];

export function gameTabHref(game: GameModeId, tab: GameTabSlug): string {
  return `/juegos/${game}/${tab}`;
}

export function gameModeHref(game: GameModeId): string {
  return gameTabHref(game, "pronosticos");
}

export function isGameModeId(value: string): value is GameModeId {
  return GAME_MODES.some((mode) => mode.id === value);
}

export const GAME_MODE_LABELS: Record<GameModeId, string> = {
  quiniela: "Quiniela",
  quinigol: "Quinigol",
  clasificacion: "Clasificación",
};
