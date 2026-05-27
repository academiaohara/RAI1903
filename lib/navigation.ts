import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  FileText,
  Headphones,
  Heart,
  Home,
  Medal,
  Megaphone,
  Mic2,
  Radio,
  Newspaper,
  Shield,
  Swords,
  Target,
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
    href: "/contenido-fan",
    label: "Contenido fan",
    icon: Video,
    children: [
      { href: "/contenido-fan/zona-mixta", label: "Zona Mixta", icon: Radio },
      { href: "/contenido-fan/previa", label: "Previa", icon: Target },
      { href: "/contenido-fan/rdp", label: "RDP", icon: Mic2 },
      { href: "/contenido-fan/tente-firme", label: "Tente firme", icon: Heart },
      { href: "/contenido-fan/podcasts", label: "Podcasts", icon: Headphones },
    ],
  },
];
