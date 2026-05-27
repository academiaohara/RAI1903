import { notFound } from "next/navigation";
import { Card } from "@/components/Card";
import { FanMediaLinkCard } from "@/components/FanMediaLinkCard";
import { ZonaMixtaVideoShowcase } from "@/components/ZonaMixtaVideoShowcase";
import { PageHero } from "@/components/PageHero";
import { SectionTabs } from "@/components/SectionTabs";
import { contenidoFanSections, getContenidoFanTabs, isContenidoFanSlug } from "@/lib/contenido-fan";

export default async function ContenidoFanSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!isContenidoFanSlug(section)) notFound();

  const config = contenidoFanSections[section];

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Contenido fan"
        title={config.heroTitle}
        description={config.heroDescription}
      />
      <SectionTabs tabs={getContenidoFanTabs()} />

      <Card eyebrow={config.cardEyebrow} title={config.cardTitle}>
        <p className="mb-5 text-sm leading-6 text-slate-600">{config.cardIntro}</p>
        {config.videos && config.videos.length > 0 && (
          <div className="mb-8">
            <ZonaMixtaVideoShowcase videos={config.videos} />
          </div>
        )}
        {config.links.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {config.links.map((link) => (
              <FanMediaLinkCard key={link.id} link={link} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
