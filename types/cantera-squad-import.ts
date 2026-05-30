export type CanteraSquadImportPlayer = {
  dorsal: number | null;
  jugador: string;
  pos: string;
  edad: number | null;
  pc: number;
  pj: number;
  pt: number;
  min: number;
  goles: number;
  /** Goles encajados (porteros). */
  golesEncajados?: number;
  ta: number;
  tr: number;
};

export type CanteraSquadImportStaff = {
  nombre: string;
  rol: string;
  partidos: number;
  ta: number;
  tr: number;
};

export type CanteraSquadImport = {
  entrenador: string;
  mediaEdad: number;
  cuerpoTecnico?: CanteraSquadImportStaff[];
  plantilla: CanteraSquadImportPlayer[];
};
