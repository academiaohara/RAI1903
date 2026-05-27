const competitionBorderClass: Record<string, string> = {
  "Liga RAI1903 Norte": "hover:border-[#214C9B]",
  "Liga Femenina RAI1903": "hover:border-[#981915]",
  "Copa del Rey": "hover:border-amber-500",
  Amistoso: "hover:border-slate-500",
  "1? RFEF": "hover:border-emerald-600",
};

export function getCompetitionBorderClass(competition: string) {
  return competitionBorderClass[competition] ?? "hover:border-[#214C9B]";
}

export function getCompetitionAccentClass(competition: string) {
  if (competition.includes("Copa")) return "text-amber-600";
  if (competition === "Amistoso") return "text-slate-600";
  if (competition.includes("RFEF")) return "text-emerald-700";
  if (competition.includes("Femenina")) return "text-[#981915]";
  return "text-[#214C9B]";
}
