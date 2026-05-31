import { notFound } from "next/navigation";
import { Card } from "@/components/Card";
import { TenteFirmeShowcase } from "@/components/TenteFirmeShowcase";
import { ZonaMixtaVideoShowcase } from "@/components/ZonaMixtaVideoShowcase";
import { PageHero } from "@/components/PageHero";
import { contenidoFanSections, isContenidoFanSlug } from "@/lib/contenido-fan";

export default async function ContenidoFanSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!isContenidoFanSlug(section)) notFound();

  const config = contenidoFanSections[section];
  const isTenteFirme = section === "tente-firme";

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Contenido fan"
        title={config.heroTitle}
        description={config.heroDescription}
      />

      <Card eyebrow={config.cardEyebrow} borderlessHeader={!config.cardEyebrow}>
        <p className="mb-5 text-sm leading-6 text-slate-600">{config.cardIntro}</p>
        {isTenteFirme ? (
          <TenteFirmeShowcase section={section} spaces={config.links} videos={config.videos} />
        ) : (
          config.videos && (
            <ZonaMixtaVideoShowcase
              section={section}
              videos={config.videos}
              featuredLabel={section === "resumenes" ? "Último resumen" : undefined}
              carouselLabel={section === "resumenes" ? "Más resúmenes" : undefined}
            />
          )
        )}
      </Card>
    </div>
  );
}
