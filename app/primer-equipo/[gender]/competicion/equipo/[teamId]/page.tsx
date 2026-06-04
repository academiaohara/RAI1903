import { EquipoLigaPageClient } from "@/components/competicion/EquipoLigaPageClient";
import { isPrimerEquipoGender, type PrimerEquipoGender } from "@/lib/primer-equipo";
import { notFound } from "next/navigation";

export default async function EquipoLigaPage({
  params,
}: {
  params: Promise<{ gender: string; teamId: string }>;
}) {
  const { gender: genderParam, teamId } = await params;

  if (!isPrimerEquipoGender(genderParam) || !teamId.trim()) {
    notFound();
  }

  const gender = genderParam as PrimerEquipoGender;

  if (gender === "femenino") {
    notFound();
  }

  return <EquipoLigaPageClient gender={gender} teamId={teamId} />;
}
