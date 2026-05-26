import { BarChart3, CalendarCheck2, Home, Newspaper, Shield, Trophy } from "lucide-react";

export const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  {
    href: "/primer-equipo",
    label: "Primer Equipo",
    icon: Shield,
    children: [
      { href: "/primer-equipo/plantilla", label: "Plantilla" },
      { href: "/primer-equipo/noticias", label: "Noticias" },
      { href: "/primer-equipo/competicion", label: "Competicion" },
    ],
  },
  {
    href: "/cantera",
    label: "Cantera",
    icon: Trophy,
    children: [
      { href: "/cantera/filial", label: "Filial" },
      { href: "/cantera/juvenil-a", label: "Juvenil A" },
    ],
  },
  {
    href: "/quiniela",
    label: "Quiniela",
    icon: CalendarCheck2,
    children: [
      { href: "/quiniela/pronosticos", label: "Pronosticos" },
      { href: "/quiniela/resultado", label: "Resultado" },
      { href: "/quiniela/ranking", label: "Ranking" },
    ],
  },
  {
    href: "/prensa",
    label: "Prensa",
    icon: Newspaper,
    children: [
      { href: "/prensa/noticias-externas", label: "Noticias externas" },
      { href: "/prensa/medios", label: "Medios" },
      { href: "/prensa/archivo", label: "Archivo" },
    ],
  },
  {
    href: "/data-hub",
    label: "Data Hub",
    icon: BarChart3,
    children: [
      { href: "/data-hub/generales", label: "Generales" },
      { href: "/data-hub/comparativas", label: "Comparativas" },
      { href: "/data-hub/historial", label: "Historial" },
    ],
  },
] as const;
