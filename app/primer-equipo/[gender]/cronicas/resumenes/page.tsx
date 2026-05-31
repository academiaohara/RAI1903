import type { Route } from "next";
import { redirect } from "next/navigation";
import { Card } from "@/components/Card";
import { PrimerEquipoPageHero } from "@/components/PrimerEquipoPageHero";
import { ZonaMixtaVideoShowcase } from "@/components/ZonaMixtaVideoShowcase";
import { getFanResumenesVideos } from "@/lib/cronicas";
import { genderLabels, primerEquipoBase, primerEquipoHasCronicas, type PrimerEquipoGender } from "@/lib/primer-equipo";

export default async function CronicasResumenesPage({ params }: { params: Promise<{ gender: PrimerEquipoGender }> }) {
  const { gender } = await params;
  if (!primerEquipoHasCronicas(gender)) {
    redirect(`${primerEquipoBase(gender)}/plantilla` as Route);
  }
  const videos = getFanResumenesVideos(gender);

  return (
    <>
      <PrimerEquipoPageHero
        title="Resúmenes"
        description={`Vídeos resumen de los partidos de liga de ${genderLabels[gender].club}.`}
      />

      <Card>
        <p className="mb-5 text-sm leading-6 text-slate-600">
          Los goles y las jugadas clave de cada jornada. El último resumen se reproduce arriba; el resto aparece en el
          carrusel inferior.
        </p>
        <ZonaMixtaVideoShowcase
          section="resumenes"
          videos={videos}
          gender={gender}
          featuredLabel="Último resumen"
          carouselLabel="Más resúmenes"
        />
      </Card>
    </>
  );
}
