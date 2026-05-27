import type { Player, PlayerPosition, PlayerStatus, Team } from "@/types";

export type RivalPlayer = {
  id: string;
  teamId: string;
  displayName: string;
  position: PlayerPosition;
  status: PlayerStatus;
  stats: Pick<Player["stats"], "appearances" | "goals" | "assists">;
};

const POSITIONS: PlayerPosition[] = ["Portero", "Defensa", "Centrocampista", "Delantero"];
const POSITION_SLOTS: Record<PlayerPosition, number> = {
  Portero: 2,
  Defensa: 6,
  Centrocampista: 6,
  Delantero: 5,
};

const FIRST_NAMES = [
  "Adrian",
  "Bruno",
  "Carlos",
  "Diego",
  "Edu",
  "Fabian",
  "Gorka",
  "Hugo",
  "Iker",
  "Jorge",
  "Kevin",
  "Luis",
  "Manu",
  "Nico",
  "Oscar",
  "Pablo",
  "Quique",
  "Raul",
  "Santi",
  "Toni",
  "Unai",
  "Victor",
  "Xabi",
  "Yeray",
];

const LAST_NAMES = [
  "Alonso",
  "Blanco",
  "Crespo",
  "Diaz",
  "Estevez",
  "Fernandez",
  "Gomez",
  "Hernandez",
  "Iglesias",
  "Jimenez",
  "Lopez",
  "Martinez",
  "Nunez",
  "Ortega",
  "Perez",
  "Quintana",
  "Ramos",
  "Sanchez",
  "Torres",
  "Vazquez",
];

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function pick<T>(items: readonly T[], seed: number): T {
  return items[seed % items.length]!;
}

function buildRoster(team: Team): RivalPlayer[] {
  const seed = hashString(team.id);
  const roster: RivalPlayer[] = [];
  let playerIndex = 0;

  for (const position of POSITIONS) {
    for (let slot = 0; slot < POSITION_SLOTS[position]; slot += 1) {
      const mix = seed + playerIndex * 17;
      const firstName = pick(FIRST_NAMES, mix);
      const lastName = pick(LAST_NAMES, mix + 3);
      const displayName = `${firstName[0]!}. ${lastName}`;
      const appearances = 5 + (mix % 5);
      const goals = position === "Portero" ? 0 : mix % 4;
      const assists = position === "Delantero" ? mix % 3 : mix % 2;
      let status: PlayerStatus = mix % 11 === 0 ? "lesionado" : mix % 13 === 0 ? "sancionado" : "titular";

      if (team.id.includes("aviles") && status !== "titular") {
        status = "titular";
      }

      roster.push({
        id: `${team.id}-p${playerIndex}`,
        teamId: team.id,
        displayName,
        position,
        status,
        stats: { appearances, goals, assists },
      });
      playerIndex += 1;
    }
  }

  return roster;
}

const rosterByTeamId = new Map<string, RivalPlayer[]>();

export function getRivalSquad(team: Team): RivalPlayer[] {
  const cached = rosterByTeamId.get(team.id);
  if (cached) return cached;

  const roster = buildRoster(team);
  rosterByTeamId.set(team.id, roster);
  return roster;
}

export function getRivalAvailability(team: Team) {
  const squad = getRivalSquad(team);
  return {
    injured: squad.filter((player) => player.status === "lesionado"),
    suspended: squad.filter((player) => player.status === "sancionado"),
  };
}
