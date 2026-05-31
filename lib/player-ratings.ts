const PLAYER_RATINGS_STORAGE_KEY = "rai1903.player-ratings.v1";

type RatingsStore = {
  matches: Record<string, Record<string, number>>;
};

function readStore(): RatingsStore {
  if (typeof window === "undefined") return { matches: {} };

  try {
    const stored = window.localStorage.getItem(PLAYER_RATINGS_STORAGE_KEY);
    if (!stored) return { matches: {} };
    const parsed = JSON.parse(stored) as RatingsStore;
    return parsed?.matches ? parsed : { matches: {} };
  } catch {
    return { matches: {} };
  }
}

function writeStore(store: RatingsStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PLAYER_RATINGS_STORAGE_KEY, JSON.stringify(store));
}

export function savePlayerMatchRating(matchId: string, playerId: string, rating: number) {
  const store = readStore();
  const matchRatings = store.matches[matchId] ?? {};
  matchRatings[playerId] = rating;
  store.matches[matchId] = matchRatings;
  writeStore(store);
}

export function getPlayerMatchRating(matchId: string, playerId: string): number | null {
  const store = readStore();
  return store.matches[matchId]?.[playerId] ?? null;
}

export function getMatchRatings(matchId: string): Record<string, number> {
  const store = readStore();
  return store.matches[matchId] ?? {};
}

export function getPlayerAverageFanRating(playerId: string): { average: number; count: number } | null {
  const store = readStore();
  const values: number[] = [];

  for (const matchRatings of Object.values(store.matches)) {
    const rating = matchRatings[playerId];
    if (rating != null) values.push(rating);
  }

  if (values.length === 0) return null;

  const sum = values.reduce((total, value) => total + value, 0);
  return { average: sum / values.length, count: values.length };
}

export function formatFanRating(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

