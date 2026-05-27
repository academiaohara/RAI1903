import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { SectionTabs } from "@/components/SectionTabs";
import { quinielaRanking } from "@/data/mock";

import { QUINIELA_TABS } from "@/lib/quiniela";

const tabs = [...QUINIELA_TABS];

export default function QuinielaRankingPage() {
  return (
    <div className="space-y-6">
      <PageHero eyebrow="Quiniela" title="Ranking" description="Clasificacion de usuarios mock en una pagina separada." />
      <SectionTabs tabs={tabs} />

      <Card eyebrow="Ranking" title="Clasificacion de usuarios">
        <div className="space-y-3">
          {quinielaRanking.map((row, index) => (
            <div key={row.user} className="grid items-center gap-3 rounded-2xl border border-[#214C9B]/20 bg-white p-4 text-sm sm:grid-cols-[auto_1fr_auto_auto_auto]">
              <Badge tone={index === 0 ? "blue" : "red"}>{index + 1}</Badge>
              <p className="font-extrabold uppercase text-[#214C9B]">{row.user}</p>
              <span>{row.points} pts</span>
              <span>{row.hits} aciertos</span>
              <span>{row.exactScores} exactos</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
