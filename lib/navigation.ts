import { BarChart3, CalendarCheck2, Home, Newspaper, Shield, Trophy } from "lucide-react";

export const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/primer-equipo", label: "Primer Equipo", icon: Shield },
  { href: "/cantera", label: "Cantera", icon: Trophy },
  { href: "/quiniela", label: "Quiniela", icon: CalendarCheck2 },
  { href: "/prensa", label: "Prensa", icon: Newspaper },
  { href: "/data-hub", label: "Data Hub", icon: BarChart3 },
] as const;
