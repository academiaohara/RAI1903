import type { Team } from "@/types";

const emptyStats = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };

/** Plantilla por defecto: 22 clubes de LaLiga Hypermotion (LFP) 25/26. */
export const segundaDivisionTeams: Team[] = [
  { id: "ceuta", name: "AD Ceuta FC", shortName: "Ceuta", city: "Ceuta", stadium: "Alfonso Murube", coach: "TBD", founded: 1956, crestInitials: "CEU", colors: ["#111827", "#FFFFFF"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "albacete", name: "Albacete Balompié", shortName: "Albacete", city: "Albacete", stadium: "Carlos Belmonte", coach: "TBD", founded: 1940, crestInitials: "ALB", colors: ["#FFFFFF", "#DC2626"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "burgos", name: "Burgos CF", shortName: "Burgos", city: "Burgos", stadium: "El Plantío", coach: "TBD", founded: 1985, crestInitials: "BUR", colors: ["#FFFFFF", "#111827"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "cadiz", name: "Cádiz CF", shortName: "Cádiz", city: "Cádiz", stadium: "Nuevo Mirandilla", coach: "TBD", founded: 1910, crestInitials: "CAD", colors: ["#FACC15", "#1D4ED8"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "castellon", name: "CD Castellón", shortName: "Castellón", city: "Castellón", stadium: "Castalia", coach: "TBD", founded: 1922, crestInitials: "CAS", colors: ["#111827", "#FFFFFF"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "leganes", name: "CD Leganés", shortName: "Leganés", city: "Leganés", stadium: "Butarque", coach: "TBD", founded: 1928, crestInitials: "LEG", colors: ["#1D4ED8", "#FFFFFF"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "mirandes", name: "CD Mirandés", shortName: "Mirandés", city: "Miranda de Ebro", stadium: "Anduva", coach: "TBD", founded: 1927, crestInitials: "MIR", colors: ["#DC2626", "#111827"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "cordoba", name: "Córdoba CF", shortName: "Córdoba", city: "Córdoba", stadium: "Nuevo Arcángel", coach: "TBD", founded: 1954, crestInitials: "COR", colors: ["#166534", "#FFFFFF"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "cultural-leonesa", name: "Cultural Leonesa", shortName: "Cultural", city: "León", stadium: "Reino de León", coach: "TBD", founded: 1923, crestInitials: "CUL", colors: ["#DC2626", "#FFFFFF"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "deportivo", name: "RC Deportivo", shortName: "Depor", city: "A Coruña", stadium: "Riazor", coach: "TBD", founded: 1906, crestInitials: "DEP", colors: ["#1D4ED8", "#FFFFFF"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "andorra", name: "FC Andorra", shortName: "Andorra", city: "Andorra la Vella", stadium: "Estadi Nacional", coach: "TBD", founded: 1942, crestInitials: "AND", colors: ["#2563EB", "#FACC15"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "granada", name: "Granada CF", shortName: "Granada", city: "Granada", stadium: "Nuevo Los Cármenes", coach: "TBD", founded: 1931, crestInitials: "GRA", colors: ["#DC2626", "#FFFFFF"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "malaga", name: "Málaga CF", shortName: "Málaga", city: "Málaga", stadium: "La Rosaleda", coach: "TBD", founded: 1994, crestInitials: "MAL", colors: ["#1D4ED8", "#FFFFFF"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "racing", name: "Racing de Santander", shortName: "Racing", city: "Santander", stadium: "El Sardinero", coach: "TBD", founded: 1913, crestInitials: "RAC", colors: ["#166534", "#FFFFFF"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "real-sociedad-b", name: "Real Sociedad B", shortName: "Real Sociedad B", city: "San Sebastián", stadium: "Zubieta", coach: "TBD", founded: 1909, crestInitials: "RSB", colors: ["#1D4ED8", "#FFFFFF"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "sporting", name: "Real Sporting", shortName: "Sporting", city: "Gijón", stadium: "El Molinón", coach: "TBD", founded: 1905, crestInitials: "SPO", colors: ["#DC2626", "#FFFFFF"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "valladolid", name: "Real Valladolid", shortName: "Valladolid", city: "Valladolid", stadium: "José Zorrilla", coach: "TBD", founded: 1928, crestInitials: "VLL", colors: ["#7A1435", "#FFFFFF"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "zaragoza", name: "Real Zaragoza", shortName: "Zaragoza", city: "Zaragoza", stadium: "La Romareda", coach: "TBD", founded: 1932, crestInitials: "ZAR", colors: ["#FFFFFF", "#1D4ED8"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "eibar", name: "SD Eibar", shortName: "Eibar", city: "Eibar", stadium: "Ipurua", coach: "TBD", founded: 1940, crestInitials: "EIB", colors: ["#1D4ED8", "#DC2626"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "huesca", name: "SD Huesca", shortName: "Huesca", city: "Huesca", stadium: "El Alcoraz", coach: "TBD", founded: 1960, crestInitials: "HUE", colors: ["#1D4ED8", "#DC2626"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "almeria", name: "UD Almería", shortName: "Almería", city: "Almería", stadium: "Power Horse", coach: "TBD", founded: 1989, crestInitials: "ALM", colors: ["#DC2626", "#FFFFFF"], position: 0, form: [], stats: { ...emptyStats } },
  { id: "las-palmas", name: "UD Las Palmas", shortName: "Las Palmas", city: "Las Palmas", stadium: "Gran Canaria", coach: "TBD", founded: 1949, crestInitials: "LPA", colors: ["#FACC15", "#1D4ED8"], position: 0, form: [], stats: { ...emptyStats } },
];
