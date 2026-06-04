import type { Route } from "next";

export function isPlantillaPath(pathname: string) {
  return /^\/primer-equipo\/(masculino|femenino)\/plantilla/.test(pathname);
}

export function isFichajesPath(pathname: string) {
  return pathname === "/fichajes" || pathname.startsWith("/fichajes/");
}

export function isFemeninoPath(pathname: string) {
  return /^\/primer-equipo\/femenino/.test(pathname);
}

export function isJornadasPath(pathname: string) {
  return /^\/primer-equipo\/(masculino|femenino)\/jornadas/.test(pathname);
}

export function isFilialPath(pathname: string) {
  return pathname === "/cantera/filial" || pathname.startsWith("/cantera/filial/");
}

export function isJuvenilPath(pathname: string) {
  return pathname === "/cantera/juvenil-a" || pathname.startsWith("/cantera/juvenil-a/");
}

export function isCanteraCmsPath(pathname: string) {
  return isFilialPath(pathname) || isJuvenilPath(pathname);
}

export const EDITOR_PAGE_LINKS = {
  plantilla: "/primer-equipo/masculino/plantilla" as Route,
  femenino: "/primer-equipo/femenino/competicion" as Route,
  fichajes: "/fichajes" as Route,
  filial: "/cantera/filial" as Route,
  juvenil: "/cantera/juvenil-a" as Route,
} as const;

export function plantillaEditorLink(pathname: string): Route {
  const match = pathname.match(/^\/primer-equipo\/(masculino|femenino)/);
  if (match) return `/primer-equipo/${match[1]}/plantilla` as Route;
  return EDITOR_PAGE_LINKS.plantilla;
}
