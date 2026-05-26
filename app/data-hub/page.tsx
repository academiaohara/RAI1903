import { Activity, Goal, ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/Card";
import { LeagueTable } from "@/components/LeagueTable";
import { PageHero } from "@/components/PageHero";
import { SectionTabs } from "@/components/SectionTabs";
import { dataComparisons, historicalMilestones, players, teams } from "@/data/mock";

const tabs = [
  { href: "#generales", label: "Estadisticas generales" },
  { href: "#comparativas", label: "Comparativas" },
  { href: "#historial", label: "Historial" },
];

const statLeaders = [
  { label: "Maximo goleador", player: [...players].sort((a, b) => b.stats.goals - a.stats.goals)[0], value: "goles", icon: Goal },
  { label: "Maximo asistente", player: [...players].sort((a, b) => b.stats.assists - a.stats.assists)[0], value: "asist.", icon: Sparkles },
  { label: "Mas minutos", player: [...players].sort((a, b) => b.stats.minutes - a.stats.minutes)[0], value: "min", icon: Activity },
  { label: "Mejor valoracion", player: [...players].sort((a, b) => b.rating - a.rating)[0], value: "media", icon: ShieldCheck },
];

export default function DataHubPage() {
  return (
    <div className="space-y-6">
      <PageHero eyebrow="Data Hub" title="Datos para aficionados" description="Estadisticas generales, comparativas y pequeno historial. Todo es mock estructurado para sustituirlo por tablas Supabase cuando toque." />
      <SectionTabs tabs={tabs} />

      <section id="generales" className="grid gap-6 scroll-mt-28 xl:grid-cols-[1fr_0.8fr]">
        <Card eyebrow="Estadisticas generales" title="Lideres del primer equipo">
          <div className="grid gap-4 md:grid-cols-2">
            {statLeaders.map((leader) => {
              const Icon = leader.icon;
              const amount = leader.value === "goles" ? leader.player.stats.goals : leader.value === "asist." ? leader.player.stats.assists : leader.value === "min" ? leader.player.stats.minutes : leader.player.rating.toFixed(2);
              return (
                <div key={leader.label} className="rounded-3xl border border-[#981915]/20 bg-white p-5 shadow-[0_10px_24px_rgba(17,24,39,0.05)]">
                  <Icon className="text-[#214C9B]" />
                  <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-slate-500">{leader.label}</p>
                  <p className="mt-2 text-xl font-black uppercase text-[#981915]">{leader.player.displayName}</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{amount} <span className="text-sm text-slate-500">{leader.value}</span></p>
                </div>
              );
            })}
          </div>
        </Card>
        <Card eyebrow="Liga" title="Tabla compacta">
          <LeagueTable teams={teams} compact />
        </Card>
      </section>

      <section id="comparativas" className="scroll-mt-28">
        <Card eyebrow="Comparativas" title="Aviles vs rival directo">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dataComparisons.map((item) => (
              <div key={item.label} className="rounded-3xl border border-[#214C9B]/25 bg-blue-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-2xl bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#981915]">Aviles</p>
                    <p className="text-3xl font-black text-[#981915]">{item.aviles}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#214C9B]">Rival</p>
                    <p className="text-3xl font-black text-[#214C9B]">{item.rival}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm font-bold text-slate-500">{item.unit}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section id="historial" className="scroll-mt-28">
        <Card eyebrow="Historial" title="Archivo RAI1903">
          <div className="grid gap-4 md:grid-cols-3">
            {historicalMilestones.map((item) => (
              <article key={item.season} className="rounded-3xl border border-[#981915]/20 bg-white p-5">
                <p className="text-4xl font-black text-[#981915]">{item.season}</p>
                <h3 className="mt-3 text-xl font-black uppercase text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
              </article>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
