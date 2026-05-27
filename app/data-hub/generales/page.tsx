import { Activity, Goal, ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/Card";
import { LeagueTable } from "@/components/LeagueTable";
import { PageHero } from "@/components/PageHero";
import { SectionTabs } from "@/components/SectionTabs";
import { players } from "@/data/mock";
import { getTeamsByGender } from "@/lib/fixtures";

const tabs = [
  { href: "/data-hub/generales", label: "Generales" },
  { href: "/data-hub/comparativas", label: "Comparativas" },
  { href: "/data-hub/historial", label: "Historial" },
];

const statLeaders = [
  { label: "Maximo goleador", player: [...players].sort((a, b) => b.stats.goals - a.stats.goals)[0], value: "goles", icon: Goal },
  { label: "Maximo asistente", player: [...players].sort((a, b) => b.stats.assists - a.stats.assists)[0], value: "asist.", icon: Sparkles },
  { label: "Mas minutos", player: [...players].sort((a, b) => b.stats.minutes - a.stats.minutes)[0], value: "min", icon: Activity },
  { label: "Mejor valoracion", player: [...players].sort((a, b) => b.rating - a.rating)[0], value: "media", icon: ShieldCheck },
];

export default function DataHubGeneralesPage() {
  const teams = getTeamsByGender("masculino");

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Data Hub" title="Datos generales" description="Lideres del primer equipo y tabla compacta en una pagina propia." />
      <SectionTabs tabs={tabs} />

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card eyebrow="Estadisticas generales" title="Lideres del primer equipo">
          <div className="grid gap-4 md:grid-cols-2">
            {statLeaders.map((leader) => {
              const Icon = leader.icon;
              const amount = leader.value === "goles" ? leader.player.stats.goals : leader.value === "asist." ? leader.player.stats.assists : leader.value === "min" ? leader.player.stats.minutes : leader.player.rating.toFixed(2);
              return (
                <div key={leader.label} className="rounded-3xl border border-[#214C9B]/20 bg-white p-5 shadow-[0_10px_24px_rgba(17,24,39,0.05)]">
                  <Icon className="text-[#214C9B]" />
                  <p className="mt-4 text-xs font-bold uppercase tracking-normal text-slate-500">{leader.label}</p>
                  <p className="mt-2 text-xl font-extrabold uppercase text-[#214C9B]">{leader.player.displayName}</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{amount} <span className="text-sm text-slate-500">{leader.value}</span></p>
                </div>
              );
            })}
          </div>
        </Card>
        <Card eyebrow="Liga" title="Tabla compacta">
          <LeagueTable teams={teams} compact />
        </Card>
      </section>
    </div>
  );
}
