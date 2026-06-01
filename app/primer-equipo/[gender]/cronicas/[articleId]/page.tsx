import type { Route } from "next";
import { notFound, redirect } from "next/navigation";
import { MatchVideoUrlEditor } from "@/components/admin/MatchVideoUrlEditor";
import { MatchCenter } from "@/components/match-center/MatchCenter";
import { getMatchDetailForArticleResolved } from "@/lib/match-detail";
import { getMatchArticleById } from "@/lib/match-articles";
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
  const article = getMatchArticleById(articleId);

  if (articleId === "resumenes") notFound();
  if (!article || article.gender !== gender) notFound();
  if (article.type !== "cronica" && article.type !== "previa") notFound();

  const detail = await getMatchDetailForArticleResolved(article);
  if (!detail) notFound();

  const fixtureId = Number(detail.match.id);
  const videoEditor =
    gender === "masculino" && !Number.isNaN(fixtureId) ? (
      <MatchVideoUrlEditor fixtureId={fixtureId} initialUrl={detail.rdpPostpartido?.url} />
    ) : null;

  return (
    <>
      <MatchCenter
        detail={detail}
        article={article}
        backHref={`${primerEquipoBase(gender)}/cronicas` as Route}
        backLabel="Volver a crónicas"
      />
      {videoEditor}
    </>
  );
}
