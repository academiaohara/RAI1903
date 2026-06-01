import type { Route } from "next";
import { notFound, redirect } from "next/navigation";
import { MatchArticleDetailSeason } from "@/components/primer-equipo/MatchArticleDetailSeason";
import { primerEquipoBase, primerEquipoHasCronicas, type PrimerEquipoGender } from "@/lib/primer-equipo";

export default async function MatchArticleDetailPage({
  params,
}: {
  params: Promise<{ gender: PrimerEquipoGender; articleId: string }>;
}) {
  const { gender, articleId } = await params;
  if (!primerEquipoHasCronicas(gender)) {
    redirect(`${primerEquipoBase(gender)}/plantilla` as Route);
  }

  if (articleId === "resumenes") notFound();

  return <MatchArticleDetailSeason gender={gender} articleId={articleId} />;
}
