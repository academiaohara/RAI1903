import type { CompetitionId } from "@/types";

const competitionBorderClass: Record<CompetitionId, string> = {
  "liga-raij903": "hover:border-[#214C9B]",
  "liga-femenina": "hover:border-[#981915]",
  "copa-rey": "hover:border-amber-500",
  amistoso: "hover:border-slate-500",
  "primera-rfef": "hover:border-emerald-600",
  "primera-asturfutbol": "hover:border-[#214C9B]",
  "segunda-asturfutbol": "hover:border-[#214C9B]",
  "liga-nacional-juvenil": "hover:border-violet-500",
};

export function getCompetitionBorderClass(competition: CompetitionId | string) {
  return competitionBorderClass[competition as CompetitionId] ?? "hover:border-[#214C9B]";
}

export function getCompetitionAccentClass(competition: CompetitionId | string) {
  if (competition === "copa-rey") return "text-amber-600";
  if (competition === "amistoso") return "text-slate-600";
  if (competition === "primera-rfef") return "text-emerald-700";
  if (competition === "liga-femenina") return "text-[#981915]";
  return "text-[#214C9B]";
}
