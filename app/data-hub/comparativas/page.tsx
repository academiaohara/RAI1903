import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { SectionTabs } from "@/components/SectionTabs";
import { dataComparisons } from "@/data/mock";

const tabs = [
  { href: "/data-hub/generales", label: "Generales" },
  { href: "/data-hub/comparativas", label: "Comparativas" },
  { href: "/data-hub/historial", label: "Historial" },
];

export default function DataHubComparativasPage() {
  return (
    <div className="space-y-6">
      <PageHero eyebrow="Data Hub" title="Comparativas" description="Aviles frente al rival directo en indicadores principales." />
      <SectionTabs tabs={tabs} />

      <Card eyebrow="Comparativas" title="Aviles vs rival directo">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dataComparisons.map((item) => (
            <div key={item.label} className="rounded-3xl border border-[#214C9B]/25 bg-blue-50 p-5">
              <p className="text-xs font-bold uppercase tracking-normal text-slate-500">{item.label}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-[10px] font-bold uppercase tracking-normal text-[#214C9B]">Aviles</p>
                  <p className="text-3xl font-extrabold text-[#214C9B]">{item.aviles}</p>
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-[10px] font-bold uppercase tracking-normal text-[#981915]">Rival</p>
                  <p className="text-3xl font-extrabold text-[#981915]">{item.rival}</p>
                </div>
              </div>
              <p className="mt-3 text-sm font-bold text-slate-500">{item.unit}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
