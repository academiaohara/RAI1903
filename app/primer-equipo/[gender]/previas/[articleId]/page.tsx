import { notFound } from "next/navigation";
import { MatchCenter } from "@/components/match-center/MatchCenter";
import { getMatchDetailForArticle } from "@/lib/match-detail";
import { getMatchArticleById } from "@/lib/match-articles";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Route } from "next";

export default async function PreviaDetailPage({ params }: { params: Promise<{ gender: PrimerEquipoGender; articleId: string }> }) {
  const { gender, articleId } = await params;
  const article = getMatchArticleById(articleId);

  if (!article || article.type !== "previa" || article.gender !== gender) notFound();

  const detail = getMatchDetailForArticle(article);
  if (!detail) notFound();

  return (
    <MatchCenter
      detail={detail}
      backHref={`${primerEquipoBase(gender)}/previas` as Route}
      backLabel="Volver a previas"
    />
  );
}
