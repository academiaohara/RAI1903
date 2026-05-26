import { Card } from "@/components/Card";
import { MatchCard } from "@/components/MatchCard";
import { PageHero } from "@/components/PageHero";
import { SectionTabs } from "@/components/SectionTabs";
import { matchdayResult } from "@/data/mock";

const tabs = [
  { href: "/quiniela/pronosticos", label: "Pronosticos" },
  { href: "/quiniela/resultado", label: "Resultado" },
  { href: "/quiniela/ranking", label: "Ranking" },
];

export default function QuinielaResultadoPage() {
  return (
    <div className="space-y-6">
      <PageHero eyebrow="Quiniela" title="Resultado" description="Resultado de jornada y resumen de puntuacion." />
      <SectionTabs tabs={tabs} />

      <Card eyebrow={`Jornada ${matchdayResult.round}`} title="Resultado de la jornada">
        <div className="grid gap-5 lg:grid-cols-[1fr_0.7fr]">
          {matchdayResult.highlightedMatch && <MatchCard match={matchdayResult.highlightedMatch} />}
          <div className="grid grid-cols-3 gap-3">
            {[["Puntos", matchdayResult.pointsAvailable], ["Media", matchdayResult.averagePoints], ["Ganador", matchdayResult.bestUser.user]].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-[#214C9B]/20 bg-blue-50 p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-normal text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-extrabold text-[#214C9B]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
