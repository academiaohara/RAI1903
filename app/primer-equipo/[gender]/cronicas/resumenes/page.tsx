import type { Route } from "next";
import { redirect } from "next/navigation";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";

export default async function CronicasResumenesPage({ params }: { params: Promise<{ gender: PrimerEquipoGender }> }) {
  const { gender } = await params;
  redirect(`${primerEquipoBase(gender)}/calendario` as Route);
}
