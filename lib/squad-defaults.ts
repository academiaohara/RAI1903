import type { SquadPlayer } from "@/types/squad";

export function createEmptySquadPlayer(position: SquadPlayer["posicion"] = "Centrocampista"): SquadPlayer {
  const id = `cms-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    nombre: "Nuevo",
    apellido: "Jugador",
    dorsal: 0,
    posicion: position,
    rol: "MC",
    estado: "suplente",
    edad: 0,
    fechaNacimiento: "",
    lugarNacimiento: "",
    nacionalidad: "España",
    altura: "",
    peso: "",
    piernaBuena: "Derecha",
    contratoHasta: "",
    valorMercado: null,
    descripcion: "",
    foto: null,
    partidos: 0,
    minutos: 0,
    goles: 0,
    asistencias: 0,
    amarillas: 0,
    rojas: 0,
    historialPartidos: [],
    trayectoria: [],
  };
}
