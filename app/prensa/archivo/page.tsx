import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { SectionTabs } from "@/components/SectionTabs";
import { newsItems } from "@/data/mock";

const tabs = [
  { href: "/prensa/noticias-externas", label: "Noticias externas" },
  { href: "/prensa/medios", label: "Medios" },
  { href: "/prensa/archivo", label: "Archivo" },
];

export default function ArchivoPage() {
  return (
    <div className="space-y-6">
      <PageHero eyebrow="Prensa" title="Archivo" description="Historico reciente de titulares externos." />
      <SectionTabs tabs={tabs} />

      <Card eyebrow="Archivo" title="Historico reciente">
        <div className="overflow-hidden rounded-2xl border border-[#214C9B]/20 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#214C9B] text-[11px] uppercase tracking-normal text-white"><tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Titular</th><th className="px-4 py-3">Medio</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {newsItems.map((item) => <tr key={item.id}><td className="px-4 py-3 text-slate-500">{item.date}</td><td className="px-4 py-3 font-bold text-slate-900">{item.title}</td><td className="px-4 py-3 text-[#214C9B]">{item.source}</td></tr>)}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
