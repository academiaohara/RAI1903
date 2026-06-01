const BASE_URL = "https://v3.football.api-sports.io";

export type ApiFootballResponse<T> = {
  errors: unknown[] | Record<string, string>;
  results: number;
  response: T;
};

export async function apiFootballGet<T>(path: string, params: Record<string, string | number>): Promise<T[]> {
  const key = Deno.env.get("API_FOOTBALL_KEY");
  if (!key) throw new Error("Missing env: API_FOOTBALL_KEY");

  const url = new URL(path.startsWith("/") ? path : `/${path}`, BASE_URL);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url, {
    headers: {
      "x-apisports-key": key,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API-Football ${res.status}: ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as ApiFootballResponse<T>;
  if (json.errors && Array.isArray(json.errors) && json.errors.length > 0) {
    throw new Error(`API-Football errors: ${JSON.stringify(json.errors)}`);
  }
  if (json.errors && typeof json.errors === "object" && !Array.isArray(json.errors)) {
    const keys = Object.keys(json.errors);
    if (keys.length > 0) throw new Error(`API-Football errors: ${JSON.stringify(json.errors)}`);
  }

  return json.response ?? [];
}
