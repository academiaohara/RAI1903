import type { Player, PlayerRoleCode } from "@/types";

const ROLE_BY_PLAYER_ID: Record<string, PlayerRoleCode> = {
  "alvaro-fernandez": "POR",
  guzman: "LD",
  victor: "LI",
  babin: "DFC",
  "edu-cortina": "MCD",
  "luis-alcalde": "MC",
  "kevin-bautista": "MCO",
  "jose-santamaria": "DC",
  "javi-cueto": "MP",
  "raul-rubio": "ED",
  grigore: "DFC",
  nando: "POR",
  cayarga: "LI",
  "chukwuma-eze": "DC",
  "adri-gomez": "EI",
  quicala: "MCO",
  gete: "DFC",
  natalio: "SD",
  campadal: "MC",
  uzkudun: "DFC",
  "isi-ros": "EI",
  rivera: "MC",
  carmona: "DFC",
  osky: "ED",
  "fem-lucia-ramos": "POR",
  "fem-sara-perez": "DFC",
  "fem-claudia-nunez": "MC",
  "fem-irene-costa": "DC",
  "fem-noa-garcia": "EI",
  "fem-marta-diaz": "LD",
  "fem-alba-torre": "MCO",
  "fem-elena-rios": "MP",
};

export function getPlayerRole(player: Pick<Player, "id" | "position" | "bio">): PlayerRoleCode {
  return ROLE_BY_PLAYER_ID[player.id] ?? "MC";
}
