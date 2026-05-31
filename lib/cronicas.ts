import type { Route } from "next";
import { fanResumenesVideosByGender } from "@/data/mock";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { FanYouTubeVideo } from "@/types";

export function getCronicasTabs(gender: PrimerEquipoGender) {
  const base = `${primerEquipoBase(gender)}/cronicas`;
  return [
    { href: base as Route, label: "Crónicas y previas" },
    { href: `${base}/resumenes` as Route, label: "Resúmenes" },
  ];
}

export function getFanResumenesVideos(gender: PrimerEquipoGender): FanYouTubeVideo[] {
  return fanResumenesVideosByGender[gender];
}
