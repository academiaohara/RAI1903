import { isPrimerEquipoGender } from "@/lib/primer-equipo";
import { notFound } from "next/navigation";

export default async function MatchArticleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gender: string }>;
}) {
  const { gender } = await params;
  if (!isPrimerEquipoGender(gender)) notFound();

  return <div className="space-y-6">{children}</div>;
}
