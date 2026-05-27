import { Card } from "@/components/Card";
import { FanMediaLinkCard } from "@/components/FanMediaLinkCard";
import { PageHero } from "@/components/PageHero";
import { SectionTabs } from "@/components/SectionTabs";
import { youtubePrograms } from "@/data/mock";

const tabs = [
  { href: "/contenido-fan/youtube", label: "YouTube" },
  { href: "/contenido-fan/podcasts", label: "Podcasts" },
];

export default function ContenidoFanYoutubePage() {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Contenido fan"
        title="Programas de YouTube"
        description="Enlaces a programas y canales que repasan la actualidad del Real Aviles Industrial."
      />
      <SectionTabs tabs={tabs} />

      <Card eyebrow="YouTube" title="Programas y canales">
        <p className="mb-5 text-sm leading-6 text-slate-600">
          Sustituye las URLs de ejemplo por los canales reales del club o de aficionados. Cada tarjeta es un espacio listo para enlazar.
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {youtubePrograms.map((link) => (
            <FanMediaLinkCard key={link.id} link={link} />
          ))}
        </div>
      </Card>
    </div>
  );
}
