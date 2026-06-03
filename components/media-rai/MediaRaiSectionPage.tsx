"use client";

import { notFound } from "next/navigation";
import { Card } from "@/components/Card";
import { PageHero } from "@/components/PageHero";
import { TenteFirmeShowcase } from "@/components/TenteFirmeShowcase";
import { ZonaMixtaVideoShowcase } from "@/components/ZonaMixtaVideoShowcase";
import { useMediaRaiSections } from "@/components/media-rai/MediaRaiSectionsProvider";
import { resolveContenidoFanSection } from "@/lib/contenido-fan";
import { isKnownMediaRaiSection } from "@/lib/media-rai-sections";

type MediaRaiSectionPageProps = {
  sectionSlug: string;
};

export function MediaRaiSectionPage({ sectionSlug }: MediaRaiSectionPageProps) {
  const { sections } = useMediaRaiSections();

  if (!isKnownMediaRaiSection(sectionSlug, sections)) {
    notFound();
  }

  const config = resolveContenidoFanSection(sectionSlug, sections);
  const isTenteFirme = sectionSlug === "tente-firme";
  const heroTitleMobile =
    sectionSlug === "rdp" || sectionSlug === "resumenes" ? config.label : undefined;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Media RAI"
        title={config.heroTitle}
        titleMobile={heroTitleMobile}
        description={config.heroDescription}
      />

      <Card eyebrow={config.cardEyebrow} borderlessHeader={!config.cardEyebrow}>
        <p className="mb-5 text-sm leading-6 text-slate-600">{config.cardIntro}</p>
        {isTenteFirme ? (
          <TenteFirmeShowcase section={sectionSlug} spaces={config.links} videos={config.videos} />
        ) : (
          <ZonaMixtaVideoShowcase
            section={sectionSlug}
            videos={config.videos ?? []}
            featuredLabel={sectionSlug === "resumenes" ? "Último resumen" : undefined}
            carouselLabel={sectionSlug === "resumenes" ? "Más resúmenes" : undefined}
          />
        )}
      </Card>
    </div>
  );
}
