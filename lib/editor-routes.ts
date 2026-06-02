import type { Route } from "next";

export function isPlantillaPath(pathname: string) {
  return /^\/primer-equipo\/(masculino|femenino)\/plantilla/.test(pathname);
}

export function isFichajesPath(pathname: string) {
  return pathname === "/fichajes" || pathname.startsWith("/fichajes/");
}

export function isFilialPath(pathname: string) {
  return pathname === "/cantera/filial" || pathname.startsWith("/cantera/filial/");
}

export const EDITOR_PAGE_LINKS = {
  plantilla: "/primer-equipo/masculino/plantilla" as Route,
  fichajes: "/fichajes" as Route,
  filial: "/cantera/filial" as Route,
} as const;

export function plantillaEditorLink(pathname: string): Route {
  const match = pathname.match(/^\/primer-equipo\/(masculino|femenino)/);
  if (match) return `/primer-equipo/${match[1]}/plantilla` as Route;
  return EDITOR_PAGE_LINKS.plantilla;
}
