import type { LucideIcon } from "lucide-react";
import {
  Archive,
  BarChart3,
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  FileText,
  GitCompare,
  History,
  Home,
  Medal,
  Megaphone,
  Newspaper,
  Radio,
  Shield,
  Swords,
  Target,
  Trophy,
  Users,
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
      { href: "/primer-equipo/masculino/competicion", label: "Competicion", icon: Trophy },
      { href: "/primer-equipo/masculino/calendario", label: "Calendario", icon: CalendarDays },
      { href: "/primer-equipo/masculino/cronicas", label: "Cronicas", icon: FileText },
      { href: "/primer-equipo/masculino/previas", label: "Previas", icon: Target },
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
      { href: "/primer-equipo/femenino/competicion", label: "Competicion", icon: Trophy },
      { href: "/primer-equipo/femenino/calendario", label: "Calendario", icon: CalendarDays },
      { href: "/primer-equipo/femenino/cronicas", label: "Cronicas", icon: FileText },
      { href: "/primer-equipo/femenino/previas", label: "Previas", icon: Target },
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
      { href: "/quiniela/pronosticos", label: "Pronosticos", icon: ClipboardList },
      { href: "/quiniela/resultado", label: "Resultado", icon: Swords },
      { href: "/quiniela/ranking", label: "Ranking", icon: Medal },
    ],
  },
  {
    href: "/prensa",
    label: "Prensa",
    icon: Newspaper,
    children: [
      { href: "/prensa/noticias-externas", label: "Noticias externas", icon: Radio },
      { href: "/prensa/medios", label: "Medios", icon: Megaphone },
      { href: "/prensa/archivo", label: "Archivo", icon: Archive },
    ],
  },
  {
    href: "/data-hub",
    label: "Data Hub",
    icon: BarChart3,
    children: [
      { href: "/data-hub/generales", label: "Generales", icon: BarChart3 },
      { href: "/data-hub/comparativas", label: "Comparativas", icon: GitCompare },
      { href: "/data-hub/historial", label: "Historial", icon: History },
    ],
  },
];
