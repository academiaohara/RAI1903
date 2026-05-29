export type RivalSquadImportPlayer = {
  dorsal: number;
  jugador: string;
  pos: string;
  edad: number | null;
  pj: number;
  g: number;
  a: number;
  ta: number;
  tr: number;
  valor: string | null;
  contrato: number | null;
};

export type RivalSquadImport = {
  estadio: string;
  capacidad: number;
  entrenador: string;
  plantilla: RivalSquadImportPlayer[];
};
