export function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export function getAvilesTeamId(): number {
  return Number(requireEnv("AVILES_TEAM_ID"));
}

export function getSeason(): number {
  return Number(requireEnv("SEASON"));
}
