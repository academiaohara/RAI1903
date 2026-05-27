import Link from "next/link";
import { notFound } from "next/navigation";
import { MatchArticleContent } from "@/components/MatchArticleContent";
import { PrimerEquipoPageHero } from "@/components/PrimerEquipoPageHero";
import { getMatchArticleById } from "@/lib/match-articles";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Route } from "next";

export default async function PreviaDetailPage({ params }: { params: Promise<{ gender: PrimerEquipoGender; articleId: string }> }) {
  const { gender, articleId } = await params;
  const article = getMatchArticleById(articleId);

  if (!article || article.type !== "previa" || article.gender !== gender) notFound();

  return (
    <>
      <PrimerEquipoPageHero title="Previa" description="Analisis completo del proximo duelo." />
      <div className="rounded-[2rem] border border-[#214C9B]/20 bg-white p-6 shadow-[0_12px_30px_rgba(17,24,39,0.06)] sm:p-8">
        <MatchArticleContent article={article} />
      </div>
      <Link href={`${primerEquipoBase(gender)}/previas` as Route} className="inline-flex text-sm font-bold uppercase tracking-normal text-[#214C9B] hover:underline">
        Volver a previas
      </Link>
    </>
  );
}
