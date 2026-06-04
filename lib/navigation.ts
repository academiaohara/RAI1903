import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  Columns3,
  Ship,
  Home,
  Medal,
  Megaphone,
  Mic2,
  Radio,
  Newspaper,
  Shield,
  Swords,
  Target,
  Clapperboard,
  Landmark,
  Trophy,
  Users,
  Video,
} from "lucide-react";

export type NavChild = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  activePrefix?: string;
  children?: NavChild[];
};

export const navItems: NavItem[] = [
  { href: "/", label: "Inicio", icon: Home },
  {
    href: "/primer-equipo/masculino/plantilla",
    label: "Primer Equipo",
    icon: Shield,
    activePrefix: "/primer-equipo/masculino",
    children: [
      { href: "/primer-equipo/masculino/plantilla", label: "Plantilla", icon: Users },
      { href: "/primer-equipo/masculino/competicion", label: "Competición", icon: Trophy },
      { href: "/primer-equipo/masculino/jornadas", label: "Jornadas", icon: Columns3 },
      { href: "/primer-equipo/masculino/calendario", label: "Calendario", icon: CalendarDays },
      { href: "/primer-equipo/masculino/noticias", label: "Noticias", icon: Newspaper },
    ],
  },
  {
    href: "/primer-equipo/femenino/plantilla",
    label: "Femenino",
    icon: Shield,
    activePrefix: "/primer-equipo/femenino",
    children: [
      { href: "/primer-equipo/femenino/plantilla", label: "Plantilla", icon: Users },
      { href: "/primer-equipo/femenino/competicion", label: "Competición", icon: Trophy },
      { href: "/primer-equipo/femenino/jornadas", label: "Jornadas", icon: Columns3 },
      { href: "/primer-equipo/femenino/calendario", label: "Calendario", icon: CalendarDays },
      { href: "/primer-equipo/femenino/noticias", label: "Noticias", icon: Newspaper },
    ],
  },
  {
    href: "/cantera",
    label: "Cantera",
    icon: Trophy,
    children: [
      { href: "/cantera/filial", label: "Filial", icon: Users },
      { href: "/cantera/juvenil-a", label: "Juvenil A", icon: Medal },
    ],
  },
  {
    href: "/quiniela",
    label: "Quiniela",
    icon: CalendarCheck2,
    children: [
      { href: "/quiniela/quiniela", label: "Pronosticos", icon: ClipboardList },
      { href: "/quiniela/resultado", label: "Resultado", icon: Swords },
      { href: "/quiniela/ranking", label: "Ranking", icon: Medal },
    ],
  },
  {
    href: "/noticias",
    label: "Noticias",
    icon: Newspaper,
    children: [
      { href: "/noticias/club", label: "Club", icon: Shield },
      { href: "/noticias/prensa", label: "Prensa", icon: Megaphone },
    ],
  },
  {
    href: "/media-rai",
    label: "Media RAI",
    icon: Video,
    children: [
      { href: "/media-rai/zona-mixta", label: "Zona Mixta", icon: Radio },
      { href: "/media-rai/previa", label: "Previa", icon: Target },
      { href: "/media-rai/rdp", label: "RDP", icon: Mic2 },
      { href: "/media-rai/resumenes", label: "Resúmenes", icon: Clapperboard },
      { href: "/media-rai/del-club", label: "Del club", icon: Landmark },
      { href: "/media-rai/tente-firme", label: "Tente firme", icon: Ship },
    ],
  },
];

export type MobileNavSection = {
  title: string;
  items: NavChild[];
};

function navChildren(activePrefix: string) {
  return navItems.find((item) => item.activePrefix === activePrefix)?.children ?? [];
}

export function navChildrenByHref(href: string) {
  return navItems.find((item) => item.href === href)?.children ?? [];
}

/** Secciones del menu hamburguesa (lista vertical compacta). */
export const mobileNavSections: MobileNavSection[] = [
  {
    title: "INICIO",
    items: [{ href: "/", label: "Inicio", icon: Home }],
  },
  {
    title: "PRIMER EQUIPO",
    items: navChildren("/primer-equipo/masculino"),
  },
  {
    title: "FEMENINO",
    items: navChildren("/primer-equipo/femenino"),
  },
  {
    title: "CANTERA",
    items: navChildrenByHref("/cantera"),
  },
  {
    title: "NOTICIAS",
    items: navChildrenByHref("/noticias"),
  },
  {
    title: "APPS",
    items: [...navChildrenByHref("/quiniela"), ...navChildrenByHref("/media-rai")],
  },
];

export function isMobileNavItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
