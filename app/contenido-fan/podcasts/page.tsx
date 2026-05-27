import { Card } from "@/components/Card";
import { FanMediaLinkCard } from "@/components/FanMediaLinkCard";
import { PageHero } from "@/components/PageHero";
import { SectionTabs } from "@/components/SectionTabs";
import { fanPodcasts } from "@/data/mock";

const tabs = [
  { href: "/contenido-fan/youtube", label: "YouTube" },
  { href: "/contenido-fan/podcasts", label: "Podcasts" },
];

export default function ContenidoFanPodcastsPage() {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Contenido fan"
        title="Podcasts y audio"
        description="Espacios para enlazar podcasts y audio de aficionados en Spotify, X, iVoox y otras plataformas."
      />
      <SectionTabs tabs={tabs} />

      <Card eyebrow="Audio fan" title="Podcasts y redes">
        <p className="mb-5 text-sm leading-6 text-slate-600">
          Los aficionados suelen compartir programas en varias plataformas. Añade aqui los enlaces que quieras destacar en la web.
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {fanPodcasts.map((link) => (
            <FanMediaLinkCard key={link.id} link={link} />
          ))}
        </div>
      </Card>
    </div>
  );
}
