import type { Route } from "next";
import { redirect } from "next/navigation";
import { primerEquipoBase, primerEquipoHasCronicas, type PrimerEquipoGender } from "@/lib/primer-equipo";

export default async function PreviasRedirectPage({ params }: { params: Promise<{ gender: PrimerEquipoGender }> }) {
  const { gender } = await params;
  redirect(
    (primerEquipoHasCronicas(gender)
      ? `${primerEquipoBase(gender)}/cronicas`
      : `${primerEquipoBase(gender)}/plantilla`) as Route,
  );
}
