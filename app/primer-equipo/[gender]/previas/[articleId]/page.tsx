import type { Route } from "next";
import { redirect } from "next/navigation";
import { getMatchArticleById } from "@/lib/match-articles";
import { primerEquipoBase, primerEquipoHasCronicas, type PrimerEquipoGender } from "@/lib/primer-equipo";

export default async function PreviaDetailRedirectPage({
  params,
}: {
  params: Promise<{ gender: PrimerEquipoGender; articleId: string }>;
}) {
  const { gender, articleId } = await params;
  const article = getMatchArticleById(articleId);

  if (!primerEquipoHasCronicas(gender)) {
    redirect(`${primerEquipoBase(gender)}/plantilla` as Route);
  }

  if (!article || article.type !== "previa" || article.gender !== gender) {
    redirect(`${primerEquipoBase(gender)}/cronicas` as Route);
  }

  redirect(`${primerEquipoBase(gender)}/cronicas/${articleId}` as Route);
}
