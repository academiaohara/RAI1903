import type { PlayerStatus } from "@/types";
import type { StadiumInfo } from "@/types/squad";

export type RivalSquadFoot = "Derecha" | "Izquierda" | "Ambidiestro";

export type RivalSquadImportPlayer = {
  dorsal: number | null;
  jugador: string;
  pos: string;
  /** Pierna buena (Transfermarkt: Derecho / Izquierdo). */
  pie?: RivalSquadFoot | "Derecho" | "Izquierdo";
  edad?: number | null;
  /** Altura mostrada en la tabla (ej. "1,85 m"). */
  altura?: string | null;
  pj?: number;
  g?: number;
  a?: number;
  ta?: number;
  tr?: number;
  valor?: string | null;
  contrato?: number | null;
  /** lesionado | sancionado en plantilla rival; por defecto titular */
  estado?: PlayerStatus;
};

export type RivalSquadImport = {
  estadio: string;
  capacidad: number;
  entrenador: string;
  plantilla: RivalSquadImportPlayer[];
  /** Datos completos del estadio (imagen, dirección, etc.) cuando se elige desde el editor. */
  estadioInfo?: StadiumInfo;
};
