export type RivalSquadImportPlayer = {
  dorsal: number;
  jugador: string;
  pos: string;
  edad: number;
  pj: number;
  g: number;
  a: number;
  ta: number;
  tr: number;
  valor: string;
  contrato: number;
};

export type RivalSquadImport = {
  estadio: string;
  capacidad: number;
  entrenador: string;
  plantilla: RivalSquadImportPlayer[];
};
