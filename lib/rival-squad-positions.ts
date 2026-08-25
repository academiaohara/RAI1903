import type { SquadRoleCode } from "@/types/squad";

/** Valores de `pos` aceptados en JSON / editor y cómo se muestran en la web. */
export const RIVAL_SQUAD_POS_OPTIONS: Array<{
  value: string;
  grupo: string;
  web: SquadRoleCode;
}> = [
  { value: "Portero", grupo: "Portero", web: "POR" },
  { value: "Defensa central", grupo: "Defensa", web: "DFC" },
  { value: "Lateral izquierdo", grupo: "Defensa", web: "LI" },
  { value: "Lateral derecho", grupo: "Defensa", web: "LD" },
  { value: "Defensa", grupo: "Defensa", web: "DFC" },
  { value: "Mediocentro", grupo: "Centrocampista", web: "MC" },
  { value: "Pivote", grupo: "Centrocampista", web: "MC" },
  { value: "Centrocampista", grupo: "Centrocampista", web: "MC" },
  { value: "Mediocentro ofensivo", grupo: "Centrocampista", web: "MCO" },
  { value: "Mediapunta", grupo: "Centrocampista", web: "MCO" },
  { value: "Extremo izquierdo", grupo: "Delantero", web: "EI" },
  { value: "Extremo derecho", grupo: "Delantero", web: "ED" },
  { value: "Delantero centro", grupo: "Delantero", web: "DC" },
  { value: "Delantero", grupo: "Delantero", web: "DC" },
  { value: "Atacante", grupo: "Delantero", web: "DC" },
];

export const RIVAL_SQUAD_FOOT_OPTIONS = ["Derecho", "Izquierdo", "Ambidiestro"] as const;

export type RivalSquadFootOption = (typeof RIVAL_SQUAD_FOOT_OPTIONS)[number];
