import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { SectionTabs } from "@/components/SectionTabs";
import { pressLinks } from "@/data/mock";

const tabs = [
  { href: "/prensa/noticias-externas", label: "Noticias externas" },
  { href: "/prensa/medios", label: "Medios" },
  { href: "/prensa/archivo", label: "Archivo" },
];

export default function MediosPage() {
  return (
    <div className="space-y-6">
      <PageHero eyebrow="Prensa" title="Medios" description="Fuentes para seguir al club y al futbol asturiano." />
      <SectionTabs tabs={tabs} />

      <Card eyebrow="Enlaces a medios" title="Fuentes para seguir el club">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pressLinks.map((link) => (
            <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="rounded-3xl border border-[#214C9B]/25 bg-white p-5 transition hover:-translate-y-1 hover:border-[#214C9B]">
              <Badge tone="blue">{link.outlet}</Badge>
              <h3 className="mt-4 text-2xl font-extrabold uppercase text-[#214C9B]">{link.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{link.description}</p>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
