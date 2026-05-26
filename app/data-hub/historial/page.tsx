import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { SectionTabs } from "@/components/SectionTabs";
import { historicalMilestones } from "@/data/mock";

const tabs = [
  { href: "/data-hub/generales", label: "Generales" },
  { href: "/data-hub/comparativas", label: "Comparativas" },
  { href: "/data-hub/historial", label: "Historial" },
];

export default function DataHubHistorialPage() {
  return (
    <div className="space-y-6">
      <PageHero eyebrow="Data Hub" title="Historial" description="Hitos de archivo y contexto fan del Real Aviles." />
      <SectionTabs tabs={tabs} />

      <Card eyebrow="Historial" title="Archivo RAI1903">
        <div className="grid gap-4 md:grid-cols-3">
          {historicalMilestones.map((item) => (
            <article key={item.season} className="rounded-3xl border border-[#214C9B]/20 bg-white p-5">
              <p className="text-4xl font-extrabold text-[#214C9B]">{item.season}</p>
              <h3 className="mt-3 text-xl font-extrabold uppercase text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}
