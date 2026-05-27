import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { quinielaRanking } from "@/data/mock";

export default function QuinielaRankingPage() {
  return (
    <div className="space-y-6">
      <PageHero eyebrow="Quiniela" title="Ranking" description="Clasificacion de usuarios mock en una pagina separada." />

      <Card eyebrow="Ranking" title="Clasificacion de usuarios">
        <div className="space-y-3">
          {quinielaRanking.map((row) => (
            <div
              key={row.user}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[#214C9B]/20 bg-white p-4 text-sm"
            >
              <p className="font-extrabold uppercase text-[#214C9B]">{row.user}</p>
              <span className="font-extrabold text-slate-900">{row.points} pts</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
