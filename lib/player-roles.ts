import type { Player, PlayerRoleCode } from "@/types";

const ROLE_BY_PLAYER_ID: Record<string, PlayerRoleCode> = {
  "alvaro-garcia": "POR", "ivan-mendez": "LD", "daniel-sierra": "DFC", "marcos-alvarez": "DFC",
  "pablo-cuesta": "MCD", "sergio-navia": "EI", "mateo-rios": "MCO", "hector-llera": "DC",
  "nicolas-fidalgo": "MP", "diego-moran": "ED", "raul-prendes": "POR", "oscar-cabanas": "LI",
  "jorge-villa": "MC", "adrian-castro": "ED", "luis-bayon": "DFC", "enol-ferreiro": "MCO",
  "samuel-rodriguez": "SD", "fem-lucia-ramos": "POR", "fem-sara-perez": "DFC",
  "fem-claudia-nunez": "MC", "fem-irene-costa": "DC", "fem-noa-garcia": "EI",
  "fem-marta-diaz": "LD", "fem-alba-torre": "MCO", "fem-elena-rios": "MP",
};

export function getPlayerRole(player: Pick<Player, "id" | "position" | "bio">): PlayerRoleCode {
  return ROLE_BY_PLAYER_ID[player.id] ?? "MC";
}
