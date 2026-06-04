import type { Route } from "next";
import { redirect } from "next/navigation";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";

export default async function PreviaDetailRedirectPage({
  params,
}: {
  params: Promise<{ gender: PrimerEquipoGender; articleId: string }>;
}) {
  const { gender } = await params;
  redirect(`${primerEquipoBase(gender)}/plantilla` as Route);
}
