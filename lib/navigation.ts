import { BarChart3, CalendarCheck2, Home, Newspaper, Repeat2, Shield, Trophy } from "lucide-react";

export const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/quiniela", label: "Quiniela", icon: CalendarCheck2 },
  { href: "/prensa", label: "Prensa", icon: Newspaper },
  { href: "/fichajes", label: "Fichajes", icon: Repeat2 },
  { href: "/plantilla", label: "Plantilla", icon: Shield },
  { href: "/cantera", label: "Cantera", icon: Trophy },
  { href: "/competicion", label: "Competicion", icon: BarChart3 },
] as const;
